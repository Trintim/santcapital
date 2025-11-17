<?php

declare(strict_types = 1);

namespace App\Models;

use App\Traits\Models\Filterable;
use Carbon\CarbonImmutable;
use Database\Factories\InvestmentPlanFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property int $lockup_days
 * @property string $minimum_deposit_amount
 * @property int|null $contract_term_months
 * @property string|null $expected_return_min_decimal
 * @property string|null $expected_return_max_decimal
 * @property string|null $extra_bonus_percent_on_capital_decimal
 * @property int $withdrawal_only_at_maturity
 * @property string|null $guaranteed_min_multiplier_after_24m
 * @property int $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, InvestmentPlanLockupOption> $lockupOptions
 * @property-read int|null $lockup_options_count
 *
 * @method static InvestmentPlanFactory factory($count = null, $state = [])
 * @method static Builder<static>|InvestmentPlan filters(array $params)
 * @method static Builder<static>|InvestmentPlan newModelQuery()
 * @method static Builder<static>|InvestmentPlan newQuery()
 * @method static Builder<static>|InvestmentPlan query()
 * @method static Builder<static>|InvestmentPlan whereContractTermMonths($value)
 * @method static Builder<static>|InvestmentPlan whereCreatedAt($value)
 * @method static Builder<static>|InvestmentPlan whereDescription($value)
 * @method static Builder<static>|InvestmentPlan whereExpectedReturnMaxDecimal($value)
 * @method static Builder<static>|InvestmentPlan whereExpectedReturnMinDecimal($value)
 * @method static Builder<static>|InvestmentPlan whereExtraBonusPercentOnCapitalDecimal($value)
 * @method static Builder<static>|InvestmentPlan whereGuaranteedMinMultiplierAfter24m($value)
 * @method static Builder<static>|InvestmentPlan whereId($value)
 * @method static Builder<static>|InvestmentPlan whereIsActive($value)
 * @method static Builder<static>|InvestmentPlan whereLockupDays($value)
 * @method static Builder<static>|InvestmentPlan whereMinimumDepositAmount($value)
 * @method static Builder<static>|InvestmentPlan whereName($value)
 * @method static Builder<static>|InvestmentPlan whereUpdatedAt($value)
 * @method static Builder<static>|InvestmentPlan whereWithdrawalOnlyAtMaturity($value)
 *
 * @mixin Eloquent
 */
class InvestmentPlan extends Model
{
    use Filterable;
    use HasFactory;

    public function lockupOptions(): HasMany
    {
        return $this->hasMany(InvestmentPlanLockupOption::class);
    }

    public function weeklyYields(): HasMany
    {
        return $this->hasMany(WeeklyYield::class, 'investment_plan_id');
    }
}
