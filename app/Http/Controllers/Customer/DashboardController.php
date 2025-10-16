<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\MoneyTransaction;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
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
            ],
            'series'    => $series,              // mensal
            'dimension' => ['mode' => 'month'],  // para o componente
        ]);
    }
}
