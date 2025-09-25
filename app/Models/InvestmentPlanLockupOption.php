<?php

declare(strict_types = 1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\InvestmentPlanLockupOptionFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $investment_plan_id
 * @property int $lockup_days
 * @property int $is_default
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read InvestmentPlan $investmentPlan
 * @method static InvestmentPlanLockupOptionFactory factory($count = null, $state = [])
 * @method static Builder<static>|InvestmentPlanLockupOption newModelQuery()
 * @method static Builder<static>|InvestmentPlanLockupOption newQuery()
 * @method static Builder<static>|InvestmentPlanLockupOption query()
 * @method static Builder<static>|InvestmentPlanLockupOption whereCreatedAt($value)
 * @method static Builder<static>|InvestmentPlanLockupOption whereId($value)
 * @method static Builder<static>|InvestmentPlanLockupOption whereInvestmentPlanId($value)
 * @method static Builder<static>|InvestmentPlanLockupOption whereIsDefault($value)
 * @method static Builder<static>|InvestmentPlanLockupOption whereLockupDays($value)
 * @method static Builder<static>|InvestmentPlanLockupOption whereUpdatedAt($value)
 * @mixin Eloquent
 */
class InvestmentPlanLockupOption extends Model
{
    use HasFactory;

    public function investmentPlan(): BelongsTo
    {
        return $this->belongsTo(InvestmentPlan::class);
    }
}
