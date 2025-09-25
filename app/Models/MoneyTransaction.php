<?php

declare(strict_types = 1);

namespace App\Models;

use App\Traits\Models\Filterable;
use Carbon\CarbonImmutable;
use Database\Factories\MoneyTransactionFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $customer_plan_id
 * @property string $type
 * @property string $amount
 * @property CarbonImmutable|null $effective_date
 * @property string $status
 * @property string|null $origin
 * @property array<array-key, mixed>|null $meta
 * @property int|null $created_by
 * @property int|null $approved_by
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read User|null $approver
 * @property-read User|null $creator
 * @property-read CustomerPlan $customerPlan
 * @method static Builder<static>|MoneyTransaction approved()
 * @method static Builder<static>|MoneyTransaction deposits()
 * @method static MoneyTransactionFactory factory($count = null, $state = [])
 * @method static Builder<static>|MoneyTransaction newModelQuery()
 * @method static Builder<static>|MoneyTransaction newQuery()
 * @method static Builder<static>|MoneyTransaction query()
 * @method static Builder<static>|MoneyTransaction whereAmount($value)
 * @method static Builder<static>|MoneyTransaction whereApprovedBy($value)
 * @method static Builder<static>|MoneyTransaction whereCreatedAt($value)
 * @method static Builder<static>|MoneyTransaction whereCreatedBy($value)
 * @method static Builder<static>|MoneyTransaction whereCustomerPlanId($value)
 * @method static Builder<static>|MoneyTransaction whereEffectiveDate($value)
 * @method static Builder<static>|MoneyTransaction whereId($value)
 * @method static Builder<static>|MoneyTransaction whereMeta($value)
 * @method static Builder<static>|MoneyTransaction whereOrigin($value)
 * @method static Builder<static>|MoneyTransaction whereStatus($value)
 * @method static Builder<static>|MoneyTransaction whereType($value)
 * @method static Builder<static>|MoneyTransaction whereUpdatedAt($value)
 * @method static Builder<static>|MoneyTransaction yields()
 * @mixin Eloquent
 */
class MoneyTransaction extends Model
{
    use HasFactory;
    use Filterable;

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
