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
        $start = now()->subMonths(6)->startOfWeek();
        $end   = now()->endOfWeek();
        $plans = CustomerPlan::all();

        for ($date = $start->copy(); $date->lte($end); $date->addWeek()) {
            foreach ($plans as $plan) {
                // Apenas alguns planos/clientes recebem custom yield para simular casos reais
                if (rand(0, 1)) {
                    CustomerPlanCustomYield::factory()->create([
                        'customer_plan_id' => $plan->id,
                        'period'           => $date->toDateString(),
                        'percent_decimal'  => rand(-5, 10), // valor real, ex: 5 para 5%
                        'recorded_by'      => 1,
                    ]);
                }
            }
        }
    }
}
