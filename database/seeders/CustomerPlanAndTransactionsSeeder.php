<?php

declare(strict_types = 1);

namespace Database\Seeders;

use App\Enums\Auth\Role;
use App\Models\CustomerPlan;
use App\Models\InvestmentPlan;
use App\Models\MoneyTransaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class CustomerPlanAndTransactionsSeeder extends Seeder
{
    public function run(): void
    {
        $customers = User::whereHas('roles', fn ($q) => $q->where('name', Role::Customer))->get();
        $plans     = InvestmentPlan::with('lockupOptions')->get();

        foreach ($customers as $cust) {
            // cada cliente pega 1–2 planos
            $attachCount = rand(1, min(2, max(1, $plans->count())));
            $pickPlans   = $plans->random($attachCount);

            foreach ($pickPlans as $plan) {
                $cp = CustomerPlan::factory()->create([
                    'user_id'            => $cust->id,
                    'investment_plan_id' => $plan->id,
                    'chosen_lockup_days' => $plan->lockupOptions()->inRandomOrder()->value('lockup_days') ?? $plan->lockup_days,
                ]);

                // cria 2–6 transações aprovadas, distribuídas no tempo
                $txCount = rand(2, 6);

                for ($i = 0; $i < $txCount; $i++) {
                    $type = [MoneyTransaction::TYPE_DEPOSIT, MoneyTransaction::TYPE_DEPOSIT, MoneyTransaction::TYPE_YIELD, MoneyTransaction::TYPE_WITHDRAWAL][array_rand([0, 1, 2, 3])];
                    MoneyTransaction::factory()->create([
                        'customer_plan_id' => $cp->id,
                        'type'             => $type,
                        'status'           => MoneyTransaction::STATUS_APPROVED,
                        'origin'           => $type === MoneyTransaction::TYPE_YIELD ? 'system' : 'manual',
                        'approved_by'      => 1,
                    ]);
                }
            }
        }
    }
}
