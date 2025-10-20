<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Plan\IndexRequest;
use App\Http\Requests\Admin\StoreInvestmentPlanRequest;
use App\Http\Requests\Admin\UpdateInvestmentPlanRequest;
use App\Http\Resources\Admin\PlanResource;
use App\Models\InvestmentPlan;
use App\Models\MoneyTransaction;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

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

    public function show(InvestmentPlan $plan): Response
    {
        // Carrega opções de carência
        $plan->load('lockupOptions');

        // Métricas do plano
        // 1) Vínculos ativos e totais
        $counts = DB::table('customer_plans')
            ->selectRaw("
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
                COUNT(*) as total_count
            ")
            ->where('investment_plan_id', $plan->id)
            ->first();

        $activeCount = (int) ($counts->active_count ?? 0);
        $totalCount  = (int) ($counts->total_count ?? 0);

        // 2) Total investido atrelado a este plano (somente aprovadas)
        $totals = DB::table('money_transactions as t')
            ->join('customer_plans as cp', 'cp.id', '=', 't.customer_plan_id')
            ->where('cp.investment_plan_id', $plan->id)
            ->where('t.status', MoneyTransaction::STATUS_APPROVED)
            ->selectRaw('
                COALESCE(SUM(CASE WHEN t.type = ? THEN t.amount END), 0) as deposits,
                COALESCE(SUM(CASE WHEN t.type = ? THEN t.amount END), 0) as yields,
                COALESCE(SUM(CASE WHEN t.type = ? THEN t.amount END), 0) as withdraws
            ', [
                MoneyTransaction::TYPE_DEPOSIT,
                MoneyTransaction::TYPE_YIELD,
                MoneyTransaction::TYPE_WITHDRAWAL,
            ])
            ->first();

        $totalInvested = (float) $totals->deposits + (float) $totals->yields - (float) $totals->withdraws;

        // 3) Últimas movimentações (opcional — ajuda a dar contexto)
        $recent = DB::table('money_transactions as t')
            ->join('customer_plans as cp', 'cp.id', '=', 't.customer_plan_id')
            ->leftJoin('users as u', 'u.id', '=', 'cp.user_id')
            ->where('cp.investment_plan_id', $plan->id)
            ->orderByDesc('t.effective_date')
            ->orderByDesc('t.id')
            ->limit(10)
            ->get([
                't.id', 't.type', 't.status', 't.amount', 't.effective_date',
                'u.name as customer_name',
            ]);

        return Inertia::render('Admin/Plans/Show', [
            'plan'    => PlanResource::make($plan)->resolve(),
            'metrics' => [
                'activeCount'   => $activeCount,
                'totalCount'    => $totalCount,
                'totalInvested' => $totalInvested,
            ],
            'recentActivity' => $recent,
        ]);
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
