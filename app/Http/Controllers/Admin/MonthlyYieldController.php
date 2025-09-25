<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InvestmentPlan;
use App\Models\MonthlyYield;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MonthlyYieldController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/monthly-yields/index', [
            'plans'  => InvestmentPlan::select('id', 'name')->orderBy('name')->get(),
            'yields' => MonthlyYield::with('plan:id,name')->orderByDesc('period')->paginate(15),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'investment_plan_id' => ['required', 'exists:investment_plans,id'],
            'period'             => ['required', 'regex:/^\d{4}-\d{2}$/'], // YYYY-MM
            'percent_decimal'    => ['required', 'numeric'],
        ]);
        $data['recorded_by'] = auth()->id();
        MonthlyYield::create($data);

        return back()->with('success', 'Rendimento mensal registrado.');
    }

    public function apply(Request $request)
    {
        $data = $request->validate([
            'investment_plan_id' => ['required', 'exists:investment_plans,id'],
            'period'             => ['required', 'regex:/^\d{4}-\d{2}$/'],
        ]);

        dispatch(new ApplyMonthlyYieldJob((int)$data['investment_plan_id'], (string)$data['period']));

        return back()->with('success', 'Aplicação de rendimento enviada para processamento.');
    }
}
