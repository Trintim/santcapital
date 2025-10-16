<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CustomerPlan;
use App\Models\MoneyTransaction;
use App\Support\Balances;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DepositController extends Controller
{
    public function index(): Response
    {
        $userId = (int) auth()->id();

        $plans = CustomerPlan::query()
            ->with('plan:id,name,lockup_days')
            ->where('user_id', $userId)
            ->get()
            ->map(function (CustomerPlan $cp) {
                $available = Balances::availableForPlan($cp->id);
                $eligible  = $this->isWithdrawEligible($cp, $available);

                return [
                    'id'                => $cp->id,
                    'plan_name'         => $cp->plan?->name,
                    'status'            => $cp->status,
                    'activated_on'      => $cp->activated_on,
                    'lockup_days'       => $cp->chosen_lockup_days ?? $cp->plan?->lockup_days,
                    'available'         => $available,
                    'withdraw_eligible' => $eligible,
                ];
            });

        // ====== Per-page independentes (defaults) ======
        $depPerPage = max(5, (int) request()->integer('dep_per_page', 10));
        $txPerPage  = max(5, (int) request()->integer('tx_per_page', 10));

        // ====== Aportes (apenas TYPE_DEPOSIT) paginados ======
        $deposits = MoneyTransaction::query()
            ->with(['customerPlan.plan:id,name'])
            ->whereHas('customerPlan', fn ($q) => $q->where('user_id', $userId))
            ->where('type', MoneyTransaction::TYPE_DEPOSIT)
            ->orderByDesc('effective_date')
            ->orderByDesc('id')
            ->paginate($depPerPage, ['*'], 'dep_page')
            ->withQueryString();

        // ====== Extrato (APROVADAS) paginado ======
        $statement = MoneyTransaction::query()
            ->with(['customerPlan.plan:id,name'])
            ->whereHas('customerPlan', fn ($q) => $q->where('user_id', $userId))
            ->where('status', MoneyTransaction::STATUS_APPROVED)
            ->orderByDesc('effective_date')
            ->orderByDesc('id')
            ->paginate($txPerPage, ['*'], 'tx_page')
            ->withQueryString();

        // (Opcional) Se quiser manter o seu "transactions" dos últimos 180 dias para outra seção:
        // $transactions = ... (pode remover se a lista paginada já atende)

        return Inertia::render('Customer/Deposits/Index', [
            'plans'     => $plans,      // para mostrar botões "Solicitar saque"
            'deposits'  => $deposits,   // Tabela 1 (Aportes)
            'statement' => $statement,  // Tabela 2 (Extrato)
            'filters'   => [
                'dep_per_page' => $depPerPage,
                'tx_per_page'  => $txPerPage,
            ],
        ]);
    }

    //    public function availableBalance(int $customerPlanId): float
    //    {
    //        // aprovado até hoje
    //        $approved = DB::table('money_transactions')
    //            ->where('customer_plan_id', $customerPlanId)
    //            ->where('status', MoneyTransaction::STATUS_APPROVED)
    //            ->whereDate('effective_date', '<=', now()->toDateString())
    //            ->selectRaw('
    //                COALESCE(SUM(CASE WHEN type = ? THEN amount END),0) as deposits,
    //                COALESCE(SUM(CASE WHEN type = ? THEN amount END),0) as yields,
    //                COALESCE(SUM(CASE WHEN type = ? THEN amount END),0) as withdraws
    //            ', [
    //                MoneyTransaction::TYPE_DEPOSIT,
    //                MoneyTransaction::TYPE_YIELD,
    //                MoneyTransaction::TYPE_WITHDRAWAL,
    //            ])
    //            ->first();
    //
    //        $pendingWithdraw = (float) DB::table('money_transactions')
    //            ->where('customer_plan_id', $customerPlanId)
    //            ->where('status', MoneyTransaction::STATUS_PENDING)
    //            ->where('type', MoneyTransaction::TYPE_WITHDRAWAL)
    //            ->sum('amount');
    //
    //        //        dd($approved, $pendingWithdraw);
    //
    //        $base = (float) $approved->deposits + (float) $approved->yields - (float) $approved->withdraws;
    //
    //        return max(0, $base - $pendingWithdraw);
    //    }

    public function isWithdrawEligible(CustomerPlan $cp, float $available): bool
    {
        if ($cp->status !== 'active') {
            return false;
        }

        if ($available <= 0) {
            return false;
        }

        $lockup = $cp->chosen_lockup_days ?? $cp->plan?->lockup_days ?? 0;

        if (! $cp->activated_on) {
            return false;
        }

        return now()->greaterThanOrEqualTo(
            now()->parse($cp->activated_on)->addDays($lockup)->endOfDay()
        );
    }
}
