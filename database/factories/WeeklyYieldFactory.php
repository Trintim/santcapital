<?php

declare(strict_types = 1);

namespace Database\Factories;

use App\Models\WeeklyYield;
use Illuminate\Database\Eloquent\Factories\Factory;

class WeeklyYieldFactory extends Factory
{
    protected $model = WeeklyYield::class;

    public function definition(): array
    {
        return [
            'investment_plan_id' => 1, // Ajuste conforme necessário
            'period'             => now()->startOfWeek()->toDateString(),
            'percent_decimal'    => $this->faker->randomFloat(4, -0.05, 0.10),
            'recorded_by'        => 1, // Ajuste conforme necessário
        ];
    }
}
