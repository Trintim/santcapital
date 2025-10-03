<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CustomerPlan;
use App\Models\MoneyTransaction;
use App\Support\Balances;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $userId = (int) auth()->user()->id;
        $now    = now()->toImmutable();

        // Totais do cliente (apenas aprovadas)
        $totals = DB::table('money_transactions as t')
            ->join('customer_plans as cp', 'cp.id', '=', 't.customer_plan_id')
            ->where('cp.user_id', $userId)
            ->where('t.status', MoneyTransaction::STATUS_APPROVED)
            ->selectRaw('
                COALESCE(SUM(CASE WHEN t.type = ? THEN t.amount END), 0) as deposits,
                COALESCE(SUM(CASE WHEN t.type = ? THEN t.amount END), 0) as yields,
                COALESCE(SUM(CASE WHEN t.type = ? THEN t.amount END), 0) as withdraws
            ', [
                MoneyTransaction::TYPE_DEPOSIT,
                MoneyTransaction::TYPE_YIELD,
                MoneyTransaction::TYPE_WITHDRAWAL,
            ])
            ->first();

        $totalInvestido   = (float) $totals->deposits + (float) $totals->yields - (float) $totals->withdraws;
        $totalRendimentos = (float) $totals->yields;

        $qtdAportes = (int) DB::table('money_transactions as t')
            ->join('customer_plans as cp', 'cp.id', '=', 't.customer_plan_id')
            ->where('cp.user_id', $userId)
            ->where('t.status', MoneyTransaction::STATUS_APPROVED)
            ->where('t.type', MoneyTransaction::TYPE_DEPOSIT)
            ->count();

        // Saldo disponível = (depósitos + rendimentos − saques aprovados) − saques pendentes
        $approvedAgg = DB::table('money_transactions as t')
            ->join('customer_plans as cp', 'cp.id', '=', 't.customer_plan_id')
            ->where('cp.user_id', $userId)
            ->where('t.status', MoneyTransaction::STATUS_APPROVED)
            ->whereDate('t.effective_date', '<=', $now->toDateString())
            ->selectRaw('
                COALESCE(SUM(CASE WHEN t.type = ? THEN t.amount END),0) as deposits,
                COALESCE(SUM(CASE WHEN t.type = ? THEN t.amount END),0) as yields,
                COALESCE(SUM(CASE WHEN t.type = ? THEN t.amount END),0) as withdraws
            ', [
                MoneyTransaction::TYPE_DEPOSIT,
                MoneyTransaction::TYPE_YIELD,
                MoneyTransaction::TYPE_WITHDRAWAL,
            ])
            ->first();

        $saldoDisponivel = Balances::totalAvailableForUser($userId);

        // Próximo vencimento (primeira data em que algum vínculo ativo se torna elegível, hoje ou futuro)
        $plans = CustomerPlan::query()
            ->with('plan:id,lockup_days')
            ->where('user_id', $userId)
            ->where('status', 'active')
            ->get(['id', 'activated_on', 'chosen_lockup_days', 'investment_plan_id']);

        $proximoVencimento = null;

        foreach ($plans as $cp) {
            if (blank($cp->activated_on)) {
                continue;
            }
            $lockup = $cp->chosen_lockup_days ?? $cp->plan?->lockup_days ?? 0;
            $elig   = Carbon::parse($cp->activated_on)->addDays($lockup)->endOfDay();

            if ($elig->greaterThanOrEqualTo($now)) {
                $proximoVencimento = $proximoVencimento
                    ? $elig->min($proximoVencimento)
                    : $elig;
            }
        }

        // Série (mantida): últimos 12 meses, por dia com movimento
        $start = $now->subMonths(11)->startOfDay();
        $rows  = DB::table('money_transactions as t')
            ->join('customer_plans as cp', 'cp.id', '=', 't.customer_plan_id')
            ->where('cp.user_id', $userId)
            ->where('t.status', MoneyTransaction::STATUS_APPROVED)
            ->whereBetween('t.effective_date', [$start, $now->endOfDay()])
            ->selectRaw('
                DATE(t.effective_date) as d,
                COALESCE(SUM(CASE WHEN t.type = ? THEN t.amount END), 0) as deposits,
                COALESCE(SUM(CASE WHEN t.type = ? THEN t.amount END), 0) as yields,
                COALESCE(SUM(CASE WHEN t.type = ? THEN t.amount END), 0) as withdraws
            ', [
                MoneyTransaction::TYPE_DEPOSIT,
                MoneyTransaction::TYPE_YIELD,
                MoneyTransaction::TYPE_WITHDRAWAL,
            ])
            ->groupBy('d')
            ->orderBy('d')
            ->get();

        $series = collect($rows)->map(fn ($r) => [
            'key'       => (string) $r->d,
            'label'     => Carbon::parse($r->d)->format('Y-m-d'),
            'deposits'  => (float) $r->deposits,
            'yields'    => (float) $r->yields,
            'withdraws' => (float) $r->withdraws,
            'net'       => (float) $r->deposits + (float) $r->yields - (float) $r->withdraws,
        ])->values();

        return Inertia::render('Customer/Dashboard/Index', [
            'kpis' => [
                'qtdAportes'        => $qtdAportes,
                'totalInvestido'    => $totalInvestido,
                'totalRendimentos'  => $totalRendimentos,
                'saldoDisponivel'   => $saldoDisponivel,
                'proximoVencimento' => $proximoVencimento?->format('d/m/Y'),
            ],
            'series' => $series,
        ]);
    }
}
