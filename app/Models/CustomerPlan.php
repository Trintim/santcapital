<?php

declare(strict_types = 1);

namespace App\Models;

use App\Traits\Models\Filterable;
use Carbon\CarbonImmutable;
use Database\Factories\CustomerPlanFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int $investment_plan_id
 * @property int|null $chosen_lockup_days
 * @property string|null $activated_on
 * @property string $status
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read User|null $customer
 * @property-read InvestmentPlan|null $plan
 * @property-read Collection<int, MoneyTransaction> $transactions
 * @property-read int|null $transactions_count
 * @method static Builder<static>|CustomerPlan active()
 * @method static CustomerPlanFactory factory($count = null, $state = [])
 * @method static Builder<static>|CustomerPlan filters(array $params)
 * @method static Builder<static>|CustomerPlan newModelQuery()
 * @method static Builder<static>|CustomerPlan newQuery()
 * @method static Builder<static>|CustomerPlan query()
 * @method static Builder<static>|CustomerPlan whereActivatedOn($value)
 * @method static Builder<static>|CustomerPlan whereChosenLockupDays($value)
 * @method static Builder<static>|CustomerPlan whereCreatedAt($value)
 * @method static Builder<static>|CustomerPlan whereId($value)
 * @method static Builder<static>|CustomerPlan whereInvestmentPlanId($value)
 * @method static Builder<static>|CustomerPlan whereStatus($value)
 * @method static Builder<static>|CustomerPlan whereUpdatedAt($value)
 * @method static Builder<static>|CustomerPlan whereUserId($value)
 * @mixin Eloquent
 */
class CustomerPlan extends Model
{
    use Filterable;
    use HasFactory;

    public function plan(): BelongsTo
    {
        return $this->belongsTo(InvestmentPlan::class, 'investment_plan_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(MoneyTransaction::class);
    }

    public function scopeActive($q)
    {
        return $q->where('status', 'active');
    }

    public function lockupEndsAt(): ?Carbon
    {
        if (! $this->activated_on) {
            return null;
        }

        $days = $this->chosen_lockup_days
            ?: optional($this->plan)->lockup_days;

        return $days ? $this->activated_on->copy()->addDays($days) : null;
    }

    public function currentBalance(): float
    {
        return (float) $this->transactions()
            ->approved()
            ->selectRaw("
                COALESCE(SUM(CASE WHEN type IN ('deposit','yield','adjustment') THEN amount ELSE 0 END),0)
              - COALESCE(SUM(CASE WHEN type = 'withdrawal' THEN amount ELSE 0 END),0) AS balance
            ")
            ->value('balance');
    }
}
