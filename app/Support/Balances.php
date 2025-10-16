<?php

declare(strict_types = 1);

namespace App\Support;

use App\Models\MoneyTransaction;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class Balances
{
    /**
     * Saldo disponível por vínculo (aprovado até fim do dia - pendente do próprio vínculo)
     */
    public static function availableForPlan(int $customerPlanId, ?CarbonImmutable $at = null): float
    {
        $at = $at?->endOfDay() ?? now()->endOfDay();

        $approved = DB::table('money_transactions')
            ->where('customer_plan_id', $customerPlanId)
            ->where('status', MoneyTransaction::STATUS_APPROVED)
            ->where('effective_date', '<=', $at->toDateTimeString())
            ->selectRaw('
                COALESCE(SUM(CASE WHEN type = ? THEN amount END),0) as deposits,
                COALESCE(SUM(CASE WHEN type = ? THEN amount END),0) as yields,
                COALESCE(SUM(CASE WHEN type = ? THEN amount END),0) as withdraws
            ', [
                MoneyTransaction::TYPE_DEPOSIT,
                MoneyTransaction::TYPE_YIELD,
                MoneyTransaction::TYPE_WITHDRAWAL,
            ])
            ->first();

        $pendingWithdraw = (float) DB::table('money_transactions')
            ->where('customer_plan_id', $customerPlanId)
            ->where('status', MoneyTransaction::STATUS_PENDING)
            ->where('type', MoneyTransaction::TYPE_WITHDRAWAL)
            ->sum('amount');

        $base = (float) $approved->deposits + (float) $approved->yields - (float) $approved->withdraws;

        return max(0, $base - $pendingWithdraw);
    }

    /**
     * Soma dos saldos disponíveis de TODOS os vínculos do usuário (mesma regra do availableForPlan).
     */
    public static function totalAvailableForUser(int $userId, ?CarbonImmutable $at = null): float
    {
        $at = $at?->endOfDay() ?? now()->endOfDay();

        // Pega todos os cp do user
        $planIds = DB::table('customer_plans')
            ->where('user_id', $userId)
            ->pluck('id');

        $total = 0.0;

        foreach ($planIds as $cpId) {
            $total += self::availableForPlan((int) $cpId, $at);
        }

        return $total;
    }
}
