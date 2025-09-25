<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Admin;

use App\Enums\Auth\Role;
use App\Http\Controllers\Controller;
use App\Models\CustomerPlan;
use App\Models\InvestmentPlan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CustomerPlanController extends Controller
{
    public function index()
    {
        $customerPlans = CustomerPlan::query()
            ->with(['customer', 'plan'])
            ->paginate(15)
            ->onEachSide(1)
            ->withQueryString();

        return inertia('Admin/CustomerPlans/Index', [
            'pagination' => $customerPlans,
        ]);
    }

    public function create()
    {
        $customers = User::query()->role(Role::Customer)->orderBy('name')->get();
        $plans     = InvestmentPlan::query()
            ->select('id', 'name', 'lockup_days')
            ->with('lockupOptions:id,investment_plan_id,lockup_days,is_default')
            ->where('is_active', true)
            ->orderBy('name')->get();

        return inertia('Admin/CustomerPlans/Create', [
            'customers' => $customers,
            'plans'     => $plans,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id'            => ['required', Rule::exists(User::class, 'id')],
            'investment_plan_id' => ['required', Rule::exists(InvestmentPlan::class, 'id')],
            'chosen_lockup_days' => ['nullable', 'integer', 'min:1'],
            'activated_on'       => ['nullable', 'date'],
        ]);

        $status = ['status' => 'pre-active'];
        $data   = array_merge($data, $status);

        CustomerPlan::query()->create($data);

        return to_route('admin.customer-plans.index');
    }

    public function activate(CustomerPlan $customerPlan)
    {
        if ($customerPlan->status !== 'pre-active') {
            return back()->with('error', 'Apenas planos em pré-ativos podem ser ativados.');
        }

        $customerPlan->update([
            'status'       => 'active',
            'activated_on' => now(),
        ]);

        return back()->with('success', 'Plano ativado com sucesso.');
    }
}
