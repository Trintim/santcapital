<?php

declare(strict_types = 1);

test('weekly yield can be created and applied with negative and custom rates', function () {
    $plan = App\Models\InvestmentPlan::factory()->create([
        'expected_return_min_decimal' => -0.05,
        'expected_return_max_decimal' => 0.10,
    ]);
    $user         = App\Models\User::factory()->create();
    $customerPlan = App\Models\CustomerPlan::factory()->create([
        'investment_plan_id' => $plan->id,
        'status'             => 'active',
        'activated_on'       => now()->subWeek(),
        'user_id'            => $user->id,
    ]);
    App\Models\MoneyTransaction::factory()->create([
        'customer_plan_id' => $customerPlan->id,
        'type'             => 'deposit',
        'amount'           => 1000000,
        'status'           => 'approved',
        'effective_date'   => now()->subWeek(),
    ]);
    $weeklyYield = App\Models\WeeklyYield::factory()->create([
        'investment_plan_id' => $plan->id,
        'period'             => now()->startOfWeek()->toDateString(),
        'percent_decimal'    => 0.08,
        'recorded_by'        => $user->id,
    ]);
    // Custom rate para cliente específico
    DB::table('customer_plan_custom_yields')->insert([
        'customer_plan_id' => $customerPlan->id,
        'period'           => now()->startOfWeek()->toDateString(),
        'percent_decimal'  => 0.10,
        'created_at'       => now(),
        'updated_at'       => now(),
    ]);
    (new App\Jobs\ApplyWeeklyYieldJob($plan->id, now()->startOfWeek()->toDateString()))->handle();
    $yieldTx = App\Models\MoneyTransaction::where('customer_plan_id', $customerPlan->id)
        ->where('type', 'yield')
        ->where('effective_date', now()->endOfWeek()->toDateString())
        ->first();
    expect($yieldTx)->not->toBeNull();
    expect($yieldTx->amount)->toBe(100000);
});
