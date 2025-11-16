<?php

declare(strict_types = 1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $investment_plan_id
 * @property CarbonImmutable $period
 * @property string $percent_decimal
 * @property int|null $recorded_by
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read InvestmentPlan $plan
 *
 * @method static Builder<static>|WeeklyYield newModelQuery()
 * @method static Builder<static>|WeeklyYield newQuery()
 * @method static Builder<static>|WeeklyYield query()
 * @method static Builder<static>|WeeklyYield whereCreatedAt($value)
 * @method static Builder<static>|WeeklyYield whereId($value)
 * @method static Builder<static>|WeeklyYield whereInvestmentPlanId($value)
 * @method static Builder<static>|WeeklyYield wherePercentDecimal($value)
 * @method static Builder<static>|WeeklyYield wherePeriod($value)
 * @method static Builder<static>|WeeklyYield whereRecordedBy($value)
 * @method static Builder<static>|WeeklyYield whereUpdatedAt($value)
 *
 * @mixin Eloquent
 */
class WeeklyYield extends Model
{
    use HasFactory;

    public function plan(): BelongsTo
    {
        return $this->belongsTo(InvestmentPlan::class, 'investment_plan_id');
    }

    protected function casts(): array
    {
        return [
            'period' => 'date',
        ];
    }
}
