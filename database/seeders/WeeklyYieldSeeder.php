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
        $start = now()->subMonths(6)->startOfWeek();
        $end   = now()->endOfWeek();
        $plans = InvestmentPlan::where('is_active', true)->get();

        for ($date = $start->copy(); $date->lte($end); $date->addWeek()) {
            foreach ($plans as $plan) {
                WeeklyYield::factory()->create([
                    'investment_plan_id' => $plan->id,
                    'period'             => $date->toDateString(),
                    'percent_decimal'    => rand(-5, 10) / 100, // valores entre -5% e 10%
                    'recorded_by'        => 1,
                ]);
            }
        }
    }
}
