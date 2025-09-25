<?php

declare(strict_types = 1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MoneyTransaction extends Model
{
    /** @use HasFactory<\Database\Factories\MoneyTransactionFactory> */
    use HasFactory;

    public const TYPE_DEPOSIT    = 'deposit';
    public const TYPE_YIELD      = 'yield';
    public const TYPE_WITHDRAWAL = 'withdrawal';
    public const TYPE_ADJUSTMENT = 'adjustment';

    public const STATUS_PENDING  = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'customer_plan_id',
        'type',
        'amount',
        'effective_date',
        'status',
        'origin',
        'meta',
        'created_by',
        'approved_by',
    ];

    protected function casts(): array
    {
        return [
            'effective_date' => 'date',
            'meta'           => 'array',
        ];
    }

    /* Relationships */
    public function customerPlan(): BelongsTo
    {
        return $this->belongsTo(CustomerPlan::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /* Scopes */
    public function scopeApproved($q)
    {
        return $q->where('status', self::STATUS_APPROVED);
    }

    public function scopeDeposits($q)
    {
        return $q->where('type', self::TYPE_DEPOSIT);
    }

    public function scopeYields($q)
    {
        return $q->where('type', self::TYPE_YIELD);
    }
}
