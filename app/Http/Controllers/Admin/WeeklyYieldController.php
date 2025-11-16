<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InvestmentPlan;
use Illuminate\Http\Request;

class WeeklyYieldController extends Controller
{
    public function index(Request $request)
    {
        $perPage      = max(10, (int) $request->integer('per_page', 15));
        $customYields = \App\Models\CustomerPlanCustomYield::with(['customerPlan.customer', 'customerPlan.plan'])
            ->orderByDesc('period')
            ->paginate($perPage);

        return \Inertia\Inertia::render('Admin/WeeklyYields/Index', [
            'customYields' => $customYields,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'period'                           => 'required|date',
            'custom_yields'                    => 'required|array|min:1',
            'custom_yields.*.customer_plan_id' => 'required|exists:customer_plans,id',
            'custom_yields.*.percent_decimal'  => 'required|numeric',
            'recorded_by'                      => 'required|exists:users,id',
        ]);

        // Salva rendimentos personalizados para clientes
        foreach ($data['custom_yields'] as $custom) {
            \DB::table('customer_plan_custom_yields')->updateOrInsert([
                'customer_plan_id' => $custom['customer_plan_id'],
                'period'           => $data['period'],
            ], [
                'percent_decimal' => $custom['percent_decimal'],
                'updated_at'      => now(),
                'created_at'      => now(),
                'recorded_by'     => $data['recorded_by'],
            ]);
        }

        return back()->with('success', 'Rendimento personalizado registrado!');
    }

    public function create(Request $request)
    {
        $user          = $request->user();
        $plans         = InvestmentPlan::select(['id', 'name'])->where('is_active', true)->orderBy('name')->get();
        $customerPlans = \App\Models\CustomerPlan::with(['customer:id,name', 'plan:id,name'])
            ->where('status', 'active')
            ->get()
            ->map(function ($cp) {
                return [
                    'id'            => $cp->id,
                    'customer_name' => $cp->customer->name ?? $cp->id,
                    'plan_id'       => $cp->plan->id ?? null,
                    'plan_name'     => $cp->plan->name ?? null,
                ];
            });

        return \Inertia\Inertia::render('Admin/WeeklyYields/Form', [
            'plans'         => $plans,
            'customerPlans' => $customerPlans,
            'userId'        => $user->id,
        ]);
    }

    public function edit($id)
    {
        $customYield = \DB::table('customer_plan_custom_yields')->where('id', $id)->first();

        if (! $customYield) {
            abort(404);
        }
        $customerPlans = \App\Models\CustomerPlan::with(['customer:id,name', 'plan:id,name'])
            ->where('status', 'active')
            ->get()
            ->map(function ($cp) {
                return [
                    'id'            => $cp->id,
                    'customer_name' => $cp->customer->name ?? $cp->id,
                    'plan_id'       => $cp->plan->id ?? null,
                    'plan_name'     => $cp->plan->name ?? null,
                ];
            });

        return \Inertia\Inertia::render('Admin/WeeklyYields/Edit', [
            'customYield'   => $customYield,
            'customerPlans' => $customerPlans,
        ]);
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'customer_plan_id' => 'required|exists:customer_plans,id',
            'period'           => 'required|date',
            'percent_decimal'  => 'required|numeric',
        ]);
        \DB::table('customer_plan_custom_yields')->where('id', $id)->update([
            'customer_plan_id' => $data['customer_plan_id'],
            'period'           => $data['period'],
            'percent_decimal'  => $data['percent_decimal'],
            'updated_at'       => now(),
        ]);

        return back()->with('success', 'Rendimento personalizado atualizado!');
    }
}
