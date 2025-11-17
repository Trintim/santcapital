<?php

declare(strict_types = 1);

namespace App\Jobs;

use App\Models\CustomerPlan;
use App\Models\InvestmentPlan;
use App\Models\MoneyTransaction;
use App\Models\WeeklyYield;
use Carbon\CarbonImmutable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Lottery;
use Schema;

// Arquivo obsoleto: toda lógica de rendimento agora é semanal e automatizada.
class ApplyWeeklyYieldJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;

    public function __construct(
        public int $investmentPlanId,
        public string $period // 'YYYY-MM-DD' (primeiro dia da semana)
    ) {}

    public function handle(): void
    {
        $weekly = WeeklyYield::query()
            ->where('investment_plan_id', $this->investmentPlanId)
            ->where('period', $this->period)
            ->firstOrFail();

        $dt        = CarbonImmutable::parse($this->period);
        $periodEnd = $dt->endOfWeek()->toDateString();

        $customerPlanIds = CustomerPlan::query()
            ->where('investment_plan_id', $this->investmentPlanId)
            ->where('status', 'active')
            ->whereDate('activated_on', '<=', $periodEnd)
            ->pluck('id');

        if ($customerPlanIds->isEmpty()) {
            return;
        }

        $idChunks = array_chunk($customerPlanIds->all(), 100);

        foreach ($idChunks as $ids) {
            $balances = DB::table('money_transactions')
                ->selectRaw(
                    'customer_plan_id,
                    SUM(CASE
                        WHEN type = ? THEN amount
                        WHEN type = ? THEN amount
                        WHEN type = ? THEN -amount
                    ELSE 0 END) AS balance',
                    [
                        MoneyTransaction::TYPE_DEPOSIT,
                        MoneyTransaction::TYPE_YIELD,
                        MoneyTransaction::TYPE_WITHDRAWAL,
                    ]
                )
                ->whereIn('customer_plan_id', $ids)
                ->where('status', MoneyTransaction::STATUS_APPROVED)
                ->whereDate('effective_date', '<=', $periodEnd)
                ->groupBy('customer_plan_id')
                ->get()
                ->pluck('balance', 'customer_plan_id');

            if ($balances->isEmpty()) {
                continue;
            }

            $alreadyYielded = DB::table('money_transactions')
                ->whereIn('customer_plan_id', $ids)
                ->where('type', MoneyTransaction::TYPE_YIELD)
                ->whereDate('effective_date', $periodEnd)
                ->pluck('customer_plan_id')
                ->all();

            $alreadySet = array_flip($alreadyYielded);

            $rows    = [];
            $plan    = InvestmentPlan::findOrFail($this->investmentPlanId);
            $rate    = (float) $weekly->percent_decimal;
            $minRate = $plan->expected_return_min_decimal ? (float) $plan->expected_return_min_decimal : null;
            $maxRate = $plan->expected_return_max_decimal ? (float) $plan->expected_return_max_decimal : null;

            $customRates = [];

            if (Schema::hasTable('customer_plan_custom_yields')) {
                $customRates = DB::table('customer_plan_custom_yields')
                    ->whereIn('customer_plan_id', $ids)
                    ->where('period', $this->period)
                    ->pluck('percent_decimal', 'customer_plan_id')
                    ->all();
            }

            $maxAbsRate = $maxRate !== null ? abs((float) $maxRate) : null;

            foreach ($balances as $cpId => $base) {
                $base = (float) $base;

                if ($base <= 0) {
                    continue;
                }

                if (isset($alreadySet[$cpId])) {
                    continue;
                }
                $appliedRate = $customRates[$cpId] ?? $rate;

                // Loteria: 25% de chance de inverter o sinal do rendimento padrão
                if (! isset($customRates[$cpId])) {
                    if (Lottery::odds(1, 4)->choose()) {
                        $appliedRate *= -1;
                    }
                }

                if ($maxAbsRate !== null && abs((float) $appliedRate) > $maxAbsRate) {
                    $appliedRate = (float) $appliedRate < 0 ? -$maxAbsRate : $maxAbsRate;
                }

                if ($minRate !== null && abs((float) $appliedRate) < abs((float) $minRate)) {
                    $appliedRate = $appliedRate < 0 ? -abs((float) $minRate) : abs((float) $minRate);
                }
                $amount = round($base * $appliedRate, 2);

                if ($amount == 0) {
                    continue;
                }
                $rows[] = [
                    'customer_plan_id' => (int) $cpId,
                    'type'             => MoneyTransaction::TYPE_YIELD,
                    'amount'           => $amount,
                    'effective_date'   => $periodEnd,
                    'status'           => MoneyTransaction::STATUS_APPROVED,
                    'origin'           => 'system',
                    'created_by'       => $weekly->recorded_by,
                    'approved_by'      => $weekly->recorded_by,
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ];
            }

            if (empty($rows)) {
                continue;
            }

            foreach (array_chunk($rows, 25) as $chunk) {
                DB::table('money_transactions')->insert($chunk);
            }
        }
    }
}
