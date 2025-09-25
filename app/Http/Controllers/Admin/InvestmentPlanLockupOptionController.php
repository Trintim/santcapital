<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InvestmentPlan;
use App\Models\InvestmentPlanLockupOption;
use Illuminate\Http\Request;

class InvestmentPlanLockupOptionController extends Controller
{
    public function store(Request $request, InvestmentPlan $plan)
    {
        $data = $request->validate([
            'lockup_days' => ['required', 'integer', 'min:1'],
            'is_default'  => ['required', 'boolean'],
        ]);

        if ($data['is_default']) {
            InvestmentPlanLockupOption::where('investment_plan_id', $plan->id)
                ->update(['is_default' => false]);
        }

        InvestmentPlanLockupOption::updateOrCreate(
            [
                'investment_plan_id' => $plan->id,
                'lockup_days'        => $data['lockup_days'],
            ],
            [
                'is_default' => $data['is_default'],
            ]
        );

        return back()->with('success', 'Opção de carência salva.');
    }

    public function destroy(InvestmentPlan $plan, InvestmentPlanLockupOption $option)
    {
        abort_unless($option->investment_plan_id === $plan->id, 404);
        $option->delete();

        return back()->with('success', 'Opção de carência removida.');
    }
}
