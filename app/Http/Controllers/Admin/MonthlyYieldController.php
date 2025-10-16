<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\MonthlyYieldResource;
use App\Jobs\ApplyMonthlyYieldJob;
use App\Models\InvestmentPlan;
use App\Models\MonthlyYield;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class MonthlyYieldController extends Controller
{
    public function index(Request $request)
    {
        $perPage = max(10, (int) $request->integer('per_page', 15));

        $plans = InvestmentPlan::select(['id', 'name', 'description'])
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $query = MonthlyYield::with('plan')
            ->orderByDesc('period');

        return Inertia::render('Admin/MonthlyYields/Index', [
            'plans'   => $plans,
            'filters' => [
                'per_page' => $perPage,
            ],
            'yields' => MonthlyYieldResource::collection(
                $query->paginate($perPage)->withQueryString()
            ),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'investment_plan_id' => ['required', 'exists:investment_plans,id'],
            'period'             => ['required', 'date',
                Rule::unique(MonthlyYield::class, 'period')
                    ->where(fn ($q) => $q->where('investment_plan_id', $request->investment_plan_id))],
            'percent_decimal' => ['required', 'numeric'],
        ]);

        $data['recorded_by'] = auth()->id();

        MonthlyYield::create($data);

        return back()->with('success', 'Rendimento mensal registrado.');
    }

    public function apply(Request $request)
    {
        $data = $request->validate([
            'investment_plan_id' => ['required', 'exists:investment_plans,id'],
            'period'             => ['required', 'date'],
        ]);

        ApplyMonthlyYieldJob::dispatch(
            (int) Arr::get($data, 'investment_plan_id'),
            (string) Arr::get($data, 'period')
        );

        return back()->with('success', 'Aplicação de rendimento enviada para processamento.');
    }

    public function destroy(MonthlyYield $monthlyYield)
    {
        $monthlyYield->delete();

        return back()->with('success', 'Rendimento removido.');
    }
}
