<?php

declare(strict_types = 1);

namespace App\Jobs;

use App\Models\CustomerPlan;
use App\Models\MoneyTransaction;
use App\Models\MonthlyYield;
use Carbon\CarbonImmutable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class ApplyMonthlyYieldJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        public int $investmentPlanId,
        public string $period // 'YYYY-MM'
    ) {}

    public function handle(): void
    {
        $monthly = MonthlyYield::query()
            ->where('investment_plan_id', $this->investmentPlanId)
            ->where('period', $this->period)
            ->firstOrFail();

        $dt        = CarbonImmutable::parse($this->period . '-01');
        $periodEnd = $dt->endOfMonth()->toDateString();

        $customerPlanIds = CustomerPlan::query()
            ->where('investment_plan_id', $this->investmentPlanId)
            ->where('status', 'active')
            ->whereDate('activated_on', '<=', $periodEnd)
            ->pluck('id');

        if ($customerPlanIds->isEmpty()) {
            return;
        }

        // MVP: chunks pequenos
        $idChunks = array_chunk($customerPlanIds->all(), 100); // <= 100 IDs por bloco

        foreach ($idChunks as $ids) {
            // agrega saldo por vínculo (1 query por chunk)
            $balances = DB::table('money_transactions')
                ->selectRaw('customer_plan_id,
                SUM(CASE
                    WHEN type = ? THEN amount
                    WHEN type = ? THEN amount
                    WHEN type = ? THEN -amount
                    ELSE 0 END) AS balance',
                    [
                        MoneyTransaction::TYPE_DEPOSIT,
                        MoneyTransaction::TYPE_YIELD,
                        MoneyTransaction::TYPE_WITHDRAWAL,
                    ])
                ->whereIn('customer_plan_id', $ids)
                ->where('status', MoneyTransaction::STATUS_APPROVED)
                ->whereDate('effective_date', '<=', $periodEnd)
                ->groupBy('customer_plan_id')
                ->pluck('balance', 'customer_plan_id');

            if ($balances->isEmpty()) {
                continue;
            }

            // idempotência (1 query por chunk)
            $alreadyYielded = DB::table('money_transactions')
                ->whereIn('customer_plan_id', $ids)
                ->where('type', MoneyTransaction::TYPE_YIELD)
                ->whereDate('effective_date', $periodEnd)
                ->pluck('customer_plan_id')
                ->all();

            $alreadySet = array_flip($alreadyYielded);

            $rows = [];
            $rate = (float) $monthly->percent_decimal;

            foreach ($balances as $cpId => $base) {
                $base = (float) $base;

                if ($base <= 0) {
                    continue;
                }

                if (isset($alreadySet[$cpId])) {
                    continue;
                }

                $amount = round($base * $rate, 2);

                if ($amount <= 0) {
                    continue;
                }

                $rows[] = [
                    'customer_plan_id' => (int) $cpId,
                    'type'             => MoneyTransaction::TYPE_YIELD,
                    'amount'           => $amount,
                    'effective_date'   => $periodEnd,
                    'status'           => MoneyTransaction::STATUS_APPROVED,
                    'origin'           => 'system',
                    'created_by'       => $monthly->recorded_by,
                    'approved_by'      => $monthly->recorded_by,
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ];
            }

            if (empty($rows)) {
                continue;
            }

            // MVP: inserts em blocos de 25
            foreach (array_chunk($rows, 25) as $chunk) {
                DB::table('money_transactions')->insert($chunk);
            }
        }
    }
}
