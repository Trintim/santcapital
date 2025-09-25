<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Plan\IndexRequest;
use App\Http\Requests\Admin\StoreInvestmentPlanRequest;
use App\Http\Requests\Admin\UpdateInvestmentPlanRequest;
use App\Models\InvestmentPlan;
use App\Resources\Admin\PlanResource;
use Inertia\Inertia;

class InvestmentPlanController extends Controller
{
    public function index(IndexRequest $request)
    {
        $sortBy    = $request->validated('sort-by', 'name');
        $direction = $request->validated('direction', 'asc');
        $search    = $request->validated('search');
        $perPage   = $request->validated('per-page', 15);

        $plans = PlanResource::collection(
            InvestmentPlan::query()
                ->filters([
                    'name' => $search,
                ])
                ->orderBy(column: $sortBy, direction: $direction)
                ->paginate($perPage)
                ->onEachSide(1)
                ->withQueryString(),
        );

        return Inertia::render('Admin/Plans/Index', [
            'pagination' => $plans,
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
        return Inertia::render('Admin/Plans/Create');
    }

    public function store(StoreInvestmentPlanRequest $request)
    {
        InvestmentPlan::create($request->validated());

        return to_route('admin.plans.index')
            ->with('success', 'Plano criado com sucesso.');
    }

    public function edit(InvestmentPlan $plan)
    {
        return Inertia::render('Admin/Plans/Edit', [
            'plan' => PlanResource::make($plan->load('lockupOptions')),
        ]);
    }

    public function update(UpdateInvestmentPlanRequest $request, InvestmentPlan $plan)
    {
        $plan->update($request->validated());

        return to_route('admin.plans.index')
            ->with('success', 'Plano atualizado com sucesso.');
    }

    public function toggleActive(InvestmentPlan $plan)
    {
        $plan->update(['is_active' => ! $plan->is_active]);

        return back()->with('success', $plan->is_active ? 'Plano ativado.' : 'Plano desativado.');
    }

    public function destroy(InvestmentPlan $plan)
    {
        $plan->delete();

        return back()->with('success', 'Plano removido.');
    }
}
