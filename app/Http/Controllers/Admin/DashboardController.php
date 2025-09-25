<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomerPlan;
use App\Models\MoneyTransaction;
use App\Models\MonthlyYield;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $activeCustomers = CustomerPlan::query()
            ->select('id')
            ->where('status', 'active')
            ->distinct('user_id')
            ->count('user_id');

        $totalInvested = MoneyTransaction::query()
            ->approved()
            ->selectRaw("
                SUM(CASE WHEN type IN ('deposit','yield','adjustment') THEN amount ELSE 0 END)
              - SUM(CASE WHEN type = 'withdrawal' THEN amount ELSE 0 END) AS balance
            ")
            ->value('balance') ?? 0;

        // média simples de percentuais registrados nos últimos 12 meses (todas as competências/planos)
        $start      = Carbon::now()->subMonths(12)->format('Y-m');
        $avgLast12m = MonthlyYield::query()
            ->whereDate('period', '>=', $start)
            ->avg('percent_decimal');

        return Inertia::render('Admin/Dashboard/Index', [
            'kpis' => [
                'activeCustomers' => $activeCustomers,
                'totalInvested'   => (float) $totalInvested,
                'avgYield12m'     => $avgLast12m ? (float) $avgLast12m : null,
            ],
        ]);
    }
}
