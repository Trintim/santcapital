<?php

declare(strict_types = 1);

namespace Database\Factories;

use App\Models\CustomerPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CustomerPlan>
 */
class CustomerPlanFactory extends Factory
{
    protected $model = CustomerPlan::class;

    public function definition(): array
    {
        $status      = fake()->randomElement(['pre_active', 'active']);
        $activatedOn = $status === 'active' ? now()->subDays(rand(10, 300))->toDateString() : null;

        return [
            'chosen_lockup_days' => fake()->randomElement([null, 90, 180, 360]),
            'status'             => $status,
            'activated_on'       => $activatedOn,
        ];
    }
}
