<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Admin;

use App\Enums\Auth\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CustomerPlan\IndexRequest;
use App\Http\Requests\StoreCustomerPlanRequest;
use App\Http\Resources\CustomerPlanResource;
use App\Models\CustomerPlan;
use App\Models\InvestmentPlan;
use App\Models\User;
use Inertia\Inertia;

class CustomerPlanController extends Controller
{
    public function index(IndexRequest $request)
    {
        $sortBy    = $request->validated('sort-by', 'status');
        $direction = $request->validated('direction', 'asc');
        $search    = $request->validated('search');
        $perPage   = $request->validated('per-page', 15);

        $pagination = CustomerPlanResource::collection(
            CustomerPlan::query()
                ->with(['customer', 'plan'])
//                ->filters(['name' => $search]) // mantém seu scope/trait, se existir
                ->orderBy($sortBy, $direction)
                ->paginate($perPage)
                ->onEachSide(1)
                ->withQueryString()
        );

        return Inertia::render('Admin/CustomerPlans/Index', [
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
        $customers = User::query()
            ->role(Role::Customer)
            ->select(['id', 'name', 'email'])
            ->orderBy('name')
            ->get();

        $plans = InvestmentPlan::query()
            ->select('id', 'name', 'lockup_days')
            ->with('lockupOptions:id,investment_plan_id,lockup_days,is_default')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/CustomerPlans/Create', [
            'customers' => $customers,
            'plans'     => $plans,
        ]);
    }

    public function store(StoreCustomerPlanRequest $request)
    {
        $data   = $request->validated();
        $plan   = InvestmentPlan::with('lockupOptions')->findOrFail($data['investment_plan_id']);
        $chosen = $data['chosen_lockup_days'] ?? $plan->lockup_days;

        CustomerPlan::query()->create([
            'user_id'            => $data['user_id'],
            'investment_plan_id' => $data['investment_plan_id'],
            'chosen_lockup_days' => $chosen,
            'status'             => 'pre_active',
            'activated_on'       => null,
        ]);

        return to_route('admin.customer-plans.index')
            ->with('success', 'Vínculo criado (pré-ativo). Será ativado no 1º aporte aprovado.');
    }

    public function activate(CustomerPlan $customerPlan)
    {
        if ($customerPlan->status !== 'pre_active') {
            return back()->with('error', 'Apenas planos pré-ativos podem ser ativados.');
        }

        $customerPlan->update([
            'status'       => 'active',
            'activated_on' => now()->toDateString(),
        ]);

        return back()->with('success', 'Plano ativado com sucesso.');
    }

    public function destroy(CustomerPlan $customerPlan)
    {
        $hasApproved = $customerPlan->transactions()
            ->where('status', 'approved')
            ->exists();

        if ($hasApproved) {

            return back()->withErrors([
                'customer_plan' => 'Não é possível remover: existem transações aprovadas neste vínculo.',
            ]);
        }

        $customerPlan->delete();

        return back()->with('success', 'Vínculo removido.');
    }
}
