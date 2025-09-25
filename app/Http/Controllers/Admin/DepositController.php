<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomerPlan;
use App\Models\MoneyTransaction;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DepositController extends Controller
{
    public function index()
    {
        $items = MoneyTransaction::with(['customerPlan.customer:id,name,email', 'customerPlan.plan:id,name'])
            ->where('type', 'deposit')->orderByDesc('id')->paginate(20);

        return Inertia::render('Admin/Deposit/Index', ['items' => $items]);
    }

    public function create()
    {
        return Inertia::render('Admin/Deposit/Create', [
            'customerPlans' => CustomerPlan::with(['customer:id,name', 'plan:id,name'])
                ->select('id', 'user_id', 'investment_plan_id', 'status')->where('status', 'active')->orderByDesc('id')->get(),
        ]);
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'customer_plan_id' => ['required', Rule::exists(CustomerPlan::class, 'id')],
            'amount'           => ['required', 'numeric', 'min:0.01'],
            'effective_date'   => ['nullable', 'date'],
        ]);

        $plan = CustomerPlan::findOrFail($data['customer_plan_id']);
        // valida mínimo do plano
        $min = $plan->plan->minimum_deposit_amount;

        if ($data['amount'] < $min) {
            return back()->withErrors(['amount' => 'Valor mínimo para este plano é R$ ' . number_format($min, 2, ',', '.')])->withInput();
        }

        MoneyTransaction::create([
            'customer_plan_id' => $plan->id,
            'type'             => MoneyTransaction::TYPE_DEPOSIT,
            'amount'           => $data['amount'],
            'effective_date'   => $data['effective_date'] ?? now()->toDateString(),
            'status'           => MoneyTransaction::STATUS_PENDING,
            'origin'           => 'manual',
            'created_by'       => auth()->id(),
        ]);

        return to_route('admin.deposits.index')->with('success', 'Aporte criado como pendente.');
    }

    public function approve(MoneyTransaction $transaction)
    {
        abort_unless($transaction->type === 'deposit', 404);
        $transaction->update([
            'status'      => MoneyTransaction::STATUS_APPROVED,
            'approved_by' => auth()->id(),
        ]);

        return back()->with('success', 'Aporte aprovado.');
    }

    public function reject(MoneyTransaction $transaction)
    {
        abort_unless($transaction->type === 'deposit', 404);
        $transaction->update(['status' => MoneyTransaction::STATUS_REJECTED, 'approved_by' => auth()->id()]);

        return back()->with('success', 'Aporte rejeitado.');
    }
}
