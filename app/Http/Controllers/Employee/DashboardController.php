<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\CustomerPlan;
use App\Models\MoneyTransaction;
use App\Models\MonthlyYield;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Number;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $now   = now()->toImmutable();
        $range = request('range', '12m'); // '7d' | '3m' | '9m' | '12m'

        // === KPIs ===

        $activeCustomers = CustomerPlan::query()
            ->where('status', 'active')
            ->distinct('user_id')
            ->count('user_id');

        $totals = DB::table('money_transactions')
            ->where('status', MoneyTransaction::STATUS_APPROVED)
            ->selectRaw('
                COALESCE(SUM(CASE WHEN type = ? THEN amount END), 0) AS deposits,
                COALESCE(SUM(CASE WHEN type = ? THEN amount END), 0) AS yields,
                COALESCE(SUM(CASE WHEN type = ? THEN amount END), 0) AS withdraws
            ', [
                MoneyTransaction::TYPE_DEPOSIT,
                MoneyTransaction::TYPE_YIELD,
                MoneyTransaction::TYPE_WITHDRAWAL,
            ])
            ->first();

        $totalInvested = (float) $totals->deposits + (float) $totals->yields - (float) $totals->withdraws;

        $avgYield12m = MonthlyYield::query()
            ->whereDate('period', '>=', $now->subMonths(12)->startOfMonth()->toDateString())
            ->whereDate('period', '<=', $now->endOfDay()->toDateString())
            ->avg('percent_decimal');

        // === Série temporal sem CTE ===
        if ($range === '7d') {
            // diário: últimos 7 dias (apenas dias com movimento)
            $start = $now->startOfDay()->subDays(6);
            $end   = $now->endOfDay();

            $rows = DB::table('money_transactions as t')
                ->selectRaw("
                    DATE(t.effective_date) as k,
                    DATE_FORMAT(t.effective_date, '%d/%m') as label,
                    COALESCE(SUM(CASE WHEN t.type = ? THEN t.amount END), 0) AS deposits,
                    COALESCE(SUM(CASE WHEN t.type = ? THEN t.amount END), 0) AS yields,
                    COALESCE(SUM(CASE WHEN t.type = ? THEN t.amount END), 0) AS withdraws
                ", [
                    MoneyTransaction::TYPE_DEPOSIT,
                    MoneyTransaction::TYPE_YIELD,
                    MoneyTransaction::TYPE_WITHDRAWAL,
                ])
                ->where('t.status', MoneyTransaction::STATUS_APPROVED)
                ->whereBetween('t.effective_date', [$start->toDateTimeString(), $end->toDateTimeString()])
                ->groupBy('k', 'label')
                ->orderBy('k')
                ->get();

            $series = $rows->map(fn ($r) => [
                'key'       => (string) $r->k,
                'label'     => (string) $r->label, // dd/mm
                'deposits'  => (float) $r->deposits,
                'withdraws' => (float) $r->withdraws,
                'yields'    => (float) $r->yields,
                'net'       => (float) $r->deposits + (float) $r->yields - (float) $r->withdraws,
            ])->all();

            $dimension = ['mode' => 'day'];
        } else {
            $monthsBack = [
                '3m'  => 3,
                '9m'  => 9,
                '12m' => 12,
            ][$range] ?? 3;

            $start = $now->copy()->startOfMonth()->subMonths($monthsBack - 1);
            $end   = $now->copy()->endOfMonth();

            $rows = DB::table('money_transactions as t')
                ->selectRaw("
                    DATE_FORMAT(t.effective_date, '%Y-%m') as k,
                    DATE_FORMAT(t.effective_date, '%b/%y') as label,
                    COALESCE(SUM(CASE WHEN t.type = ? THEN t.amount END), 0) AS deposits,
                    COALESCE(SUM(CASE WHEN t.type = ? THEN t.amount END), 0) AS yields,
                    COALESCE(SUM(CASE WHEN t.type = ? THEN t.amount END), 0) AS withdraws
                ", [
                    MoneyTransaction::TYPE_DEPOSIT,
                    MoneyTransaction::TYPE_YIELD,
                    MoneyTransaction::TYPE_WITHDRAWAL,
                ])
                ->where('t.status', MoneyTransaction::STATUS_APPROVED)
                ->whereBetween('t.effective_date', [$start->toDateString(), $end->toDateString()])
                ->groupBy('k', 'label')
                ->orderBy('k')
                ->get();

            $series = $rows->map(function ($r) {
                $label = Carbon::parse($r->k . '-01')->locale('pt_BR')->isoFormat('MMM/YY');

                return [
                    'key'       => (string) $r->k,
                    'label'     => $label,
                    'deposits'  => (float) $r->deposits,
                    'withdraws' => (float) $r->withdraws,
                    'yields'    => (float) $r->yields,
                    'net'       => (float) $r->deposits + (float) $r->yields - (float) $r->withdraws,
                ];
            })->all();

            $dimension = ['mode' => 'month'];
        }

        return Inertia::render('Employee/Dashboard/Index', [
            'kpis' => [
                'activeCustomers' => $activeCustomers,
                'totalInvested'   => $totalInvested,
                'avgYield12m'     => Number::percentage((float) $avgYield12m * 100, 2),
            ],
            'series'    => $series,          // { key, label, deposits, yields, withdraws, net }
            'range'     => $range,           // '7d' | '3m' | '9m' | '12m'
            'dimension' => $dimension,       // { mode: 'day' | 'month' }
        ]);
    }
}
