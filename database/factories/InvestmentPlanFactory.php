<?php

declare(strict_types = 1);

namespace Database\Factories;

use App\Models\InvestmentPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InvestmentPlan>
 */
class InvestmentPlanFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'                                   => fake()->word(),
            'description'                            => fake()->sentence(),
            'lockup_days'                            => fake()->numberBetween(30, 720),
            'minimum_deposit_amount'                 => fake()->randomFloat(2, 100, 10000),
            'contract_term_months'                   => fake()->numberBetween(1, 24),
            'expected_return_min_decimal'            => fake()->randomFloat(4, 0.01, 0.05),
            'expected_return_max_decimal'            => fake()->randomFloat(4, 0.05, 0.10),
            'extra_bonus_percent_on_capital_decimal' => fake()->randomFloat(6, 0.001, 0.02),
            'withdrawal_only_at_maturity'            => fake()->boolean(),
            'guaranteed_min_multiplier_after_24m'    => fake()->randomFloat(2, 1.0, 3.0),
            'is_active'                              => fake()->boolean(80), // 80% chance to be true
        ];
    }
}
