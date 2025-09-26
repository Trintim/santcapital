<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\ApplyMonthlyYieldJob;
use App\Models\InvestmentPlan;
use App\Models\MonthlyYield;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class MonthlyYieldController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/MonthlyYields/Index', [
            'plans'  => InvestmentPlan::select('id', 'name')->where('is_active', true)->orderBy('name')->get(),
            'yields' => MonthlyYield::with('plan:id,name')->orderByDesc('period')->paginate(15)->onEachSide(1)->withQueryString(),
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
