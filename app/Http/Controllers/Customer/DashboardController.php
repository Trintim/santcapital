<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Mail\CustomerYieldPdf;
use App\Models\CustomerPlanCustomYield;
use App\Models\MoneyTransaction;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $userId = (int) auth()->id();
        $now    = now()->toImmutable();

        // === KPIs (apenas aprovadas) ===
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
        $qtdAportes       = (int) DB::table('money_transactions as t')
            ->join('customer_plans as cp', 'cp.id', '=', 't.customer_plan_id')
            ->where('cp.user_id', $userId)
            ->where('t.status', MoneyTransaction::STATUS_APPROVED)
            ->where('t.type', MoneyTransaction::TYPE_DEPOSIT)
            ->count();

        // Média de rendimentos (12m mais recentes) — considera custom e padrão
        $plans = DB::table('customer_plans')->where('user_id', $userId)->pluck('id');
        $weeks = DB::table('weekly_yields')
            ->select('period')
            ->whereBetween('period', [$now->subMonths(12)->startOfWeek()->toDateString(), $now->endOfWeek()->toDateString()])
            ->groupBy('period')
            ->orderBy('period')
            ->get();
        $totalYield = 0;
        $countYield = 0;

        foreach ($plans as $planId) {
            foreach ($weeks as $week) {
                $custom = DB::table('customer_plan_custom_yields')
                    ->where('customer_plan_id', $planId)
                    ->where('period', $week->period)
                    ->value('percent_decimal');

                if ($custom !== null) {
                    $totalYield += (float)$custom;
                    $countYield++;
                } else {
                    $plan    = DB::table('customer_plans')->where('id', $planId)->first();
                    $default = DB::table('weekly_yields')
                        ->where('investment_plan_id', $plan->investment_plan_id)
                        ->where('period', $week->period)
                        ->value('percent_decimal');

                    if ($default !== null) {
                        $totalYield += (float)$default;
                        $countYield++;
                    }
                }
            }
        }
        $avgYield12m = $countYield > 0 ? $totalYield / $countYield : null;

        // === Série MENSAL (12 meses) ===
        $start = $now->copy()->startOfMonth()->subMonths(11); // inclui o mês atual -11
        $end   = $now->copy()->endOfMonth();

        // Saldo inicial ANTES do primeiro mês da janela (para acumulado)
        $initial = DB::table('money_transactions as t')
            ->join('customer_plans as cp', 'cp.id', '=', 't.customer_plan_id')
            ->where('cp.user_id', $userId)
            ->where('t.status', MoneyTransaction::STATUS_APPROVED)
            ->whereDate('t.effective_date', '<', $start->toDateString())
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

        $running = (float) $initial->deposits + (float) $initial->yields - (float) $initial->withdraws;

        // movimentos agregados por mês dentro da janela
        $rows = DB::table('money_transactions as t')
            ->join('customer_plans as cp', 'cp.id', '=', 't.customer_plan_id')
            ->where('cp.user_id', $userId)
            ->where('t.status', MoneyTransaction::STATUS_APPROVED)
            ->whereBetween('t.effective_date', [$start->toDateString(), $end->toDateString()])
            ->selectRaw("
                DATE_FORMAT(t.effective_date, '%Y-%m-01') as k,
                COALESCE(SUM(CASE WHEN t.type = ? THEN t.amount END),0) as deposits,
                COALESCE(SUM(CASE WHEN t.type = ? THEN t.amount END),0) as yields,
                COALESCE(SUM(CASE WHEN t.type = ? THEN t.amount END),0) as withdraws
            ", [
                MoneyTransaction::TYPE_DEPOSIT,
                MoneyTransaction::TYPE_YIELD,
                MoneyTransaction::TYPE_WITHDRAWAL,
            ])
            ->groupBy('k')
            ->orderBy('k')
            ->get();

        $series = [];

        foreach ($rows as $r) {
            $k   = (string) $r->k; // YYYY-MM-01
            $dep = (float) $r->deposits;
            $yld = (float) $r->yields;
            $wd  = (float) $r->withdraws;
            $net = $dep + $yld - $wd;

            $running += $net; // saldo ao fim do mês

            $series[] = [
                'key'          => $k,
                'label'        => Carbon::parse($k)->format('Y-m-01'),
                'deposits'     => $dep,
                'yields'       => $yld,     // pode ser negativo!
                'withdraws'    => $wd,
                'net'          => $net,
                'equity_close' => $running, // curva acumulada
            ];
        }

        return Inertia::render('Customer/Dashboard/Index', [
            'kpis' => [
                'qtdAportes'       => $qtdAportes,
                'totalInvestido'   => $totalInvestido,
                'totalRendimentos' => $totalRendimentos,
                'avgYield12m'      => $avgYield12m,  // média de rendimento dos últimos 12 meses
            ],
            'series'    => $series,              // mensal
            'dimension' => ['mode' => 'month'],  // para o componente
        ]);
    }

    public function exportPdf()
    {
        $user          = auth()->user();
        $userId        = (int) $user->id;
        $now           = now()->toImmutable();
        $currentMonth  = $now->format('Y-m');
        $previousMonth = $now->subMonth()->format('Y-m');
        $previousYear  = $now->subYear()->format('Y-m');

        // Buscar rendimentos do mês atual, anterior e do mesmo mês do ano anterior
        $yields = CustomerPlanCustomYield::query()
            ->whereHas('customerPlan', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->whereIn(\DB::raw("DATE_FORMAT(period, '%Y-%m')"), [$currentMonth, $previousMonth, $previousYear])
            ->with('customerPlan.plan')
            ->get();

        $data = [
            'user'          => $user,
            'yields'        => $yields,
            'currentMonth'  => $currentMonth,
            'previousMonth' => $previousMonth,
            'previousYear'  => $previousYear,
        ];

        $filename = 'rendimentos_' . $user->id . '_' . $now->format('Ymd_His') . '.pdf';

        Mail::to($user->email)->queue(new CustomerYieldPdf($user, $data, $filename));

        return back()->with('success', 'PDF enviado para seu email!');
    }
}
