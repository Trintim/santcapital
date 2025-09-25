<?php

declare(strict_types = 1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\MonthlyYieldFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $investment_plan_id
 * @property string $period
 * @property string $percent_decimal
 * @property int|null $recorded_by
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read InvestmentPlan|null $plan
 * @method static MonthlyYieldFactory factory($count = null, $state = [])
 * @method static Builder<static>|MonthlyYield newModelQuery()
 * @method static Builder<static>|MonthlyYield newQuery()
 * @method static Builder<static>|MonthlyYield query()
 * @method static Builder<static>|MonthlyYield whereCreatedAt($value)
 * @method static Builder<static>|MonthlyYield whereId($value)
 * @method static Builder<static>|MonthlyYield whereInvestmentPlanId($value)
 * @method static Builder<static>|MonthlyYield wherePercentDecimal($value)
 * @method static Builder<static>|MonthlyYield wherePeriod($value)
 * @method static Builder<static>|MonthlyYield whereRecordedBy($value)
 * @method static Builder<static>|MonthlyYield whereUpdatedAt($value)
 * @mixin Eloquent
 */
class MonthlyYield extends Model
{
    use HasFactory;

    public function plan(): BelongsTo
    {
        return $this->belongsTo(InvestmentPlan::class);
    }
}
