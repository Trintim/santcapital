<?php

declare(strict_types = 1);

namespace Database\Seeders;

use App\Models\InvestmentPlan;
use App\Models\WeeklyYield;
use Illuminate\Database\Seeder;

class WeeklyYieldSeeder extends Seeder
{
    public function run(): void
    {
        $period = now()->startOfWeek()->toDateString();

        $plans = InvestmentPlan::where('is_active', true)->get();

        foreach ($plans as $plan) {
            WeeklyYield::factory()->create([
                'investment_plan_id' => $plan->id,
                'period'             => $period,
                'percent_decimal'    => 5,
                'recorded_by'        => 1,
            ]);
        }
    }
}
