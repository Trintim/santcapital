<?php
declare(strict_types = 1);

namespace Database\Seeders;

use App\Models\CustomerPlan;
use App\Models\CustomerPlanCustomYield;
use Illuminate\Database\Seeder;

class CustomerPlanCustomYieldSeeder extends Seeder
{
    public function run(): void
    {
        $plans = CustomerPlan::all();

        foreach ($plans as $plan) {
            CustomerPlanCustomYield::factory()->create([
                'customer_plan_id' => $plan->id,
                'period'           => now()->startOfWeek()->toDateString(),
                'percent_decimal'  => 0.05,
                'recorded_by'      => 1,
            ]);
        }
    }
}
