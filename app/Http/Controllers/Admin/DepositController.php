<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Deposit\IndexRequest;
use App\Http\Requests\StoreDepositRequest;
use App\Http\Resources\MoneyTransactionResource;
use App\Models\CustomerPlan;
use App\Models\MoneyTransaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DepositController extends Controller
{
    public function index(IndexRequest $request)
    {
        $sortBy    = $request->validated('sort-by', 'type');
        $direction = $request->validated('direction', 'asc');
        $search    = $request->validated('search');
        $perPage   = $request->validated('per-page', 15);

        $pagination = MoneyTransactionResource::collection(
            MoneyTransaction::query()
                ->with(['customerPlan.customer', 'customerPlan.plan'])
                ->where('type', MoneyTransaction::TYPE_DEPOSIT)
                // ->filters(['name' => $search]) // reative se já tiver seu scope
                ->orderBy($sortBy, $direction)
                ->paginate($perPage)
                ->onEachSide(1)
                ->withQueryString()
        );

        return Inertia::render('Admin/Deposit/Index', [
            'pagination' => $pagination,
            'filters'    => [
                'search'    => $search,
                'per-page'  => $perPage,
                'sort-by'   => $sortBy,
                'direction' => $direction,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Deposit/Create', [
            'customerPlans' => CustomerPlan::with(['customer:id,name', 'plan:id,name'])
                ->select('id', 'user_id', 'investment_plan_id', 'status')
                // permitir aportar em pré-ativo (1º aprovado ativa)
                ->whereIn('status', ['pre_active', 'active'])
                ->orderByDesc('id')
                ->get(),
        ]);
    }

    public function store(StoreDepositRequest $request)
    {
        $data = $request->validated();

        $cp  = CustomerPlan::with('plan')->findOrFail($data['customer_plan_id']);
        $min = (float) $cp->plan->minimum_deposit_amount;

        // (Regra já validada no withValidator do request; aqui fica como proteção extra)
        if ((float) $data['amount'] < $min) {
            return back()
                ->withErrors(['amount' => 'Valor mínimo para este plano é R$ ' . number_format($min, 2, ',', '.')])
                ->withInput();
        }

        MoneyTransaction::create([
            'customer_plan_id' => $cp->id,
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
        abort_unless($transaction->type === MoneyTransaction::TYPE_DEPOSIT, 404);

        DB::transaction(function () use ($transaction) {
            $transaction->update([
                'status'      => MoneyTransaction::STATUS_APPROVED,
                'approved_by' => auth()->id(),
            ]);

            // ativa vínculo se for a 1ª aprovação
            $cp = $transaction->customerPlan()->lockForUpdate()->first();
            if ($cp && $cp->status === 'pre_active') {
                $cp->update([
                    'status'       => 'active',
                    'activated_on' => $transaction->effective_date ?? now()->toDateString(),
                ]);
            }
        });

        return back()->with('success', 'Aporte aprovado.');
    }

    public function reject(MoneyTransaction $transaction)
    {
        abort_unless($transaction->type === MoneyTransaction::TYPE_DEPOSIT, 404);

        $transaction->update([
            'status'      => MoneyTransaction::STATUS_REJECTED,
            'approved_by' => auth()->id(),
        ]);

        return back()->with('success', 'Aporte rejeitado.');
    }

    public function destroy(MoneyTransaction $transaction)
    {
        abort_unless($transaction->type === MoneyTransaction::TYPE_DEPOSIT, 404);

        // regra: não excluir depósito aprovado (mesmo admin, se quiser mudar jogue a regra para o Request/Policy)
        if ($transaction->status === MoneyTransaction::STATUS_APPROVED) {
            // Se quiser permitir apenas Admin, troque a checagem:
            // if ($transaction->status === MoneyTransaction::STATUS_APPROVED && !auth()->user()?->hasRole(RoleEnum::Admin)) { ... }
            return back()->withErrors([
                'transaction' => 'Não é possível remover um aporte aprovado.',
            ]);
        }

        $transaction->delete();

        return back()->with('success', 'Aporte removido.');
    }
}
