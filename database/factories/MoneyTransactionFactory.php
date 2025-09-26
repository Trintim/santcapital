<?php

declare(strict_types = 1);

namespace Database\Factories;

use App\Models\MoneyTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MoneyTransaction>
 */
class MoneyTransactionFactory extends Factory
{
    protected $model = MoneyTransaction::class;

    public function definition(): array
    {
        $type = fake()->randomElement([
            MoneyTransaction::TYPE_DEPOSIT,
            MoneyTransaction::TYPE_YIELD,
            MoneyTransaction::TYPE_WITHDRAWAL,
        ]);

        $amount = match ($type) {
            MoneyTransaction::TYPE_WITHDRAWAL => fake()->randomFloat(2, 50, 1000),
            MoneyTransaction::TYPE_YIELD      => fake()->randomFloat(2, 5, 500),
            default                           => fake()->randomFloat(2, 100, 5000),
        };

        return [
            'type'           => $type,
            'amount'         => $amount,
            'effective_date' => fake()->dateTimeBetween('-11 months', 'now')->format('Y-m-d'),
            'status'         => fake()->randomElement([
                MoneyTransaction::STATUS_APPROVED,
                MoneyTransaction::STATUS_APPROVED,
                MoneyTransaction::STATUS_PENDING,
            ]),
            'origin'      => fake()->randomElement(['manual', 'system']),
            'created_by'  => 1,
            'approved_by' => fake()->boolean(70) ? 1 : null,
        ];
    }
}
