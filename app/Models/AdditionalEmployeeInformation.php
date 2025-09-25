<?php

declare(strict_types = 1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\AdditionalEmployeeInformationFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string|null $bank_name
 * @property string|null $bank_code
 * @property string|null $agency_number
 * @property string|null $account_number
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read User $user
 * @method static AdditionalEmployeeInformationFactory factory($count = null, $state = [])
 * @method static Builder<static>|AdditionalEmployeeInformation newModelQuery()
 * @method static Builder<static>|AdditionalEmployeeInformation newQuery()
 * @method static Builder<static>|AdditionalEmployeeInformation query()
 * @method static Builder<static>|AdditionalEmployeeInformation whereAccountNumber($value)
 * @method static Builder<static>|AdditionalEmployeeInformation whereAgencyNumber($value)
 * @method static Builder<static>|AdditionalEmployeeInformation whereBankCode($value)
 * @method static Builder<static>|AdditionalEmployeeInformation whereBankName($value)
 * @method static Builder<static>|AdditionalEmployeeInformation whereCreatedAt($value)
 * @method static Builder<static>|AdditionalEmployeeInformation whereId($value)
 * @method static Builder<static>|AdditionalEmployeeInformation whereUpdatedAt($value)
 * @method static Builder<static>|AdditionalEmployeeInformation whereUserId($value)
 * @mixin Eloquent
 */
class AdditionalEmployeeInformation extends Model
{
    /** @use HasFactory<AdditionalEmployeeInformationFactory> */
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
