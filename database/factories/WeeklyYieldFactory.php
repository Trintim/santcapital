<?php

declare(strict_types = 1);

namespace Database\Factories;

use App\Models\InvestmentPlan;
use App\Models\WeeklyYield;
use Illuminate\Database\Eloquent\Factories\Factory;

class WeeklyYieldFactory extends Factory
{
    protected $model = WeeklyYield::class;

    public function definition(): array
    {
        return [
            'investment_plan_id' => InvestmentPlan::factory(),
            'period'             => $this->faker->date('Y-m-d'), // primeiro dia da semana
            'percent_decimal'    => $this->faker->randomFloat(4, -0.05, 0.10), // -5% a 10%
            'recorded_by'        => 1,
        ];
    }
}
