<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\CustomerPlanCustomYieldResource;
use App\Models\CustomerPlanCustomYield;
use App\Models\InvestmentPlan;
use Illuminate\Http\Request;

class WeeklyYieldController extends Controller
{
    public function index(Request $request)
    {
        $sortBy    = $request->input('sort-by', 'period');
        $direction = $request->input('direction', 'desc');
        $search    = $request->input('search');
        $perPage   = $request->input('per-page', 15);

        $query = \App\Models\CustomerPlanCustomYield::with(['customerPlan.customer', 'customerPlan.plan']);

        if ($search) {
            $query->whereHas('customerPlan.customer', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }
        $customYields = CustomerPlanCustomYieldResource::collection(
            $query->orderBy($sortBy, $direction)
                ->paginate($perPage)
                ->onEachSide(1)
                ->withQueryString()
        );

        return \Inertia\Inertia::render('Admin/WeeklyYields/Index', [
            'customYields' => $customYields,
            'filters'      => [
                'search'    => $search,
                'per-page'  => $perPage,
                'sort-by'   => $sortBy,
                'direction' => $direction,
            ],
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
            CustomerPlanCustomYield::query()->updateOrCreate([
                'customer_plan_id' => $custom['customer_plan_id'],
                'period'           => $data['period'],
            ], [
                'percent_decimal' => $custom['percent_decimal'], // mutator faz conversão
                'recorded_by'     => $data['recorded_by'],
            ]);
        }

        return redirect()->route('admin.weekly-yields.index')->with('success', 'Rendimento personalizado registrado!');
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
        $customYield = CustomerPlanCustomYield::query()->where('id', $id)->first();

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
            'customYield'   => $customYield->toArray(),
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

        $customYield = CustomerPlanCustomYield::query()->findOrFail($id);
        $customYield->fill([
            'customer_plan_id' => $data['customer_plan_id'],
            'period'           => $data['period'],
            'percent_decimal'  => $data['percent_decimal'], // mutator será aplicado
        ]);
        $customYield->save();

        return redirect()->route('admin.weekly-yields.index')->with('success', 'Rendimento personalizado atualizado!');
    }

    public function runJob(Request $request)
    {
        // Para teste, pega o primeiro plano ativo e a semana atual
        $plan   = InvestmentPlan::where('is_active', true)->first();
        $period = now()->startOfWeek()->toDateString();

        if ($plan) {
            \App\Jobs\ApplyWeeklyYieldJob::dispatch($plan->id, $period);

            return back()->with('success', 'Job semanal disparado para plano ' . $plan->name . ' e período ' . $period);
        }

        return back()->with('error', 'Nenhum plano ativo encontrado para testar o job.');
    }

    public function destroy($id)
    {
        \DB::table('customer_plan_custom_yields')->where('id', $id)->delete();

        return back()->with('success', 'Rendimento personalizado removido!');
    }
}
