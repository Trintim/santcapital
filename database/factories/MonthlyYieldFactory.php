<?php

declare(strict_types = 1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MonthlyYield>
 */
class MonthlyYieldFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $now  = now()->toImmutable();
        $date = $now->subMonths(rand(0, 11))->startOfMonth();

        return [
            // "YYYY-MM-01"
            'period'          => $date->format('Y-m-01'),
            'percent_decimal' => $this->faker->randomFloat(4, 0.005, 0.03), // 0.5% a 3%
            'recorded_by'     => 1,
        ];
    }
}
