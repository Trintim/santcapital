<?php

declare(strict_types = 1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class CustomerPlan extends Model
{
    use HasFactory;

    public function plan(): BelongsTo
    {
        return $this->belongsTo(InvestmentPlan::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
