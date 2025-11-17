<?php

declare(strict_types = 1);

use App\Jobs\ApplyWeeklyYieldJob;
use App\Models\CustomerPlan;
use App\Models\InvestmentPlan;
use App\Models\MoneyTransaction;
use App\Models\WeeklyYield;
use Illuminate\Support\Facades\DB;

describe('ApplyWeeklyYieldJob', function () {
    it('applies yield for active customer plans with positive balance', function () {
        $plan = InvestmentPlan::factory()->create([
            'expected_return_min_decimal' => 0.01,
            'expected_return_max_decimal' => 0.10,
        ]);
        $user         = App\Models\User::factory()->create();
        $customerPlan = CustomerPlan::factory()->create([
            'investment_plan_id' => $plan->id,
            'status'             => 'active',
            'activated_on'       => now()->subWeek(),
            'user_id'            => $user->id,
        ]);
        MoneyTransaction::factory()->create([
            'customer_plan_id' => $customerPlan->id,
            'type'             => MoneyTransaction::TYPE_DEPOSIT,
            'amount'           => 1000,
            'status'           => MoneyTransaction::STATUS_APPROVED,
            'effective_date'   => now()->subWeek(),
        ]);
        $weeklyYield = WeeklyYield::factory()->create([
            'investment_plan_id' => $plan->id,
            'period'             => now()->startOfWeek()->toDateString(),
            'percent_decimal'    => 0.05,
            'recorded_by'        => $user->id,
        ]);
        (new ApplyWeeklyYieldJob($plan->id, now()->startOfWeek()->toDateString()))->handle();
        $yieldTx = MoneyTransaction::where('customer_plan_id', $customerPlan->id)
            ->where('type', MoneyTransaction::TYPE_YIELD)
            ->where('effective_date', now()->endOfWeek()->toDateString())
            ->first();
        expect($yieldTx)->not->toBeNull();
        expect($yieldTx->amount)->toBe(50.0);
    });

    it('does not apply yield for plans with zero or negative balance', function () {
        $plan         = InvestmentPlan::factory()->create();
        $user         = App\Models\User::factory()->create();
        $customerPlan = CustomerPlan::factory()->create([
            'investment_plan_id' => $plan->id,
            'status'             => 'active',
            'activated_on'       => now()->subWeek(),
            'user_id'            => $user->id,
        ]);
        MoneyTransaction::factory()->create([
            'customer_plan_id' => $customerPlan->id,
            'type'             => MoneyTransaction::TYPE_DEPOSIT,
            'amount'           => 0,
            'status'           => MoneyTransaction::STATUS_APPROVED,
            'effective_date'   => now()->subWeek(),
        ]);
        $weeklyYield = WeeklyYield::factory()->create([
            'investment_plan_id' => $plan->id,
            'period'             => now()->startOfWeek()->toDateString(),
            'percent_decimal'    => 0.05,
            'recorded_by'        => $user->id,
        ]);
        (new ApplyWeeklyYieldJob($plan->id, now()->startOfWeek()->toDateString()))->handle();
        $yieldTx = MoneyTransaction::where('customer_plan_id', $customerPlan->id)
            ->where('type', MoneyTransaction::TYPE_YIELD)
            ->where('effective_date', now()->endOfWeek()->toDateString())
            ->first();
        expect($yieldTx)->toBeNull();
    });

    it('applies custom yield rate if present', function () {
        $plan = InvestmentPlan::factory()->create([
            'expected_return_min_decimal' => 0.01,
            'expected_return_max_decimal' => 0.10,
        ]);
        $user         = App\Models\User::factory()->create();
        $customerPlan = CustomerPlan::factory()->create([
            'investment_plan_id' => $plan->id,
            'status'             => 'active',
            'activated_on'       => now()->subWeek(),
            'user_id'            => $user->id,
        ]);
        MoneyTransaction::factory()->create([
            'customer_plan_id' => $customerPlan->id,
            'type'             => MoneyTransaction::TYPE_DEPOSIT,
            'amount'           => 2000,
            'status'           => MoneyTransaction::STATUS_APPROVED,
            'effective_date'   => now()->subWeek(),
        ]);
        $weeklyYield = WeeklyYield::factory()->create([
            'investment_plan_id' => $plan->id,
            'period'             => now()->startOfWeek()->toDateString(),
            'percent_decimal'    => 0.05,
            'recorded_by'        => $user->id,
        ]);
        DB::table('customer_plan_custom_yields')->insert([
            'customer_plan_id' => $customerPlan->id,
            'period'           => now()->startOfWeek()->toDateString(),
            'percent_decimal'  => 0.10,
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);
        (new ApplyWeeklyYieldJob($plan->id, now()->startOfWeek()->toDateString()))->handle();
        $yieldTx = MoneyTransaction::where('customer_plan_id', $customerPlan->id)
            ->where('type', MoneyTransaction::TYPE_YIELD)
            ->where('effective_date', now()->endOfWeek()->toDateString())
            ->first();
        expect($yieldTx)->not->toBeNull();
        expect($yieldTx->amount)->toBe(200.0);
    });

    it('does not apply yield if already applied for the period', function () {
        $plan         = InvestmentPlan::factory()->create();
        $user         = App\Models\User::factory()->create();
        $customerPlan = CustomerPlan::factory()->create([
            'investment_plan_id' => $plan->id,
            'status'             => 'active',
            'activated_on'       => now()->subWeek(),
            'user_id'            => $user->id,
        ]);
        MoneyTransaction::factory()->create([
            'customer_plan_id' => $customerPlan->id,
            'type'             => MoneyTransaction::TYPE_DEPOSIT,
            'amount'           => 1000,
            'status'           => MoneyTransaction::STATUS_APPROVED,
            'effective_date'   => now()->subWeek(),
        ]);
        $weeklyYield = WeeklyYield::factory()->create([
            'investment_plan_id' => $plan->id,
            'period'             => now()->startOfWeek()->toDateString(),
            'percent_decimal'    => 0.05,
            'recorded_by'        => $user->id,
        ]);
        MoneyTransaction::factory()->create([
            'customer_plan_id' => $customerPlan->id,
            'type'             => MoneyTransaction::TYPE_YIELD,
            'amount'           => 50.0,
            'status'           => MoneyTransaction::STATUS_APPROVED,
            'effective_date'   => now()->endOfWeek()->toDateString(),
        ]);
        (new ApplyWeeklyYieldJob($plan->id, now()->startOfWeek()->toDateString()))->handle();
        $yieldTxs = MoneyTransaction::where('customer_plan_id', $customerPlan->id)
            ->where('type', MoneyTransaction::TYPE_YIELD)
            ->where('effective_date', now()->endOfWeek()->toDateString())
            ->get();
        expect($yieldTxs)->toHaveCount(1);
    });
});
