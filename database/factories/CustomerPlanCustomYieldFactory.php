<?php

declare(strict_types = 1);

namespace Database\Factories;

use App\Models\CustomerPlan;
use App\Models\CustomerPlanCustomYield;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerPlanCustomYieldFactory extends Factory
{
    protected $model = CustomerPlanCustomYield::class;

    public function definition(): array
    {
        return [
            'customer_plan_id' => CustomerPlan::factory(),
            'period'           => $this->faker->date('Y-m-d'),
            'percent_decimal'  => $this->faker->randomFloat(4, -0.05, 0.10),
            'recorded_by'      => User::factory(),
        ];
    }
}
