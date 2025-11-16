<?php

declare(strict_types = 1);

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerPlanCustomYield extends Model
{
    use HasFactory;

    protected $table = 'customer_plan_custom_yields';

    protected $guarded = [];

    public function customerPlan(): BelongsTo
    {
        return $this->belongsTo(CustomerPlan::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    protected function percentDecimal(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value * 100,
            set: fn ($value) => $value / 100,
        );
    }
}
