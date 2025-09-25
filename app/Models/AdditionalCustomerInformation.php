<?php

declare(strict_types = 1);

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\AdditionalCustomerInformationFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string|null $beneficiary_name
 * @property string|null $beneficiary_document
 * @property string|null $beneficiary_phone
 * @property string|null $beneficiary_2_name
 * @property string|null $beneficiary_2_document
 * @property string|null $beneficiary_2_phone
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read User $user
 * @method static AdditionalCustomerInformationFactory factory($count = null, $state = [])
 * @method static Builder<static>|AdditionalCustomerInformation newModelQuery()
 * @method static Builder<static>|AdditionalCustomerInformation newQuery()
 * @method static Builder<static>|AdditionalCustomerInformation query()
 * @method static Builder<static>|AdditionalCustomerInformation whereBeneficiary2Document($value)
 * @method static Builder<static>|AdditionalCustomerInformation whereBeneficiary2Name($value)
 * @method static Builder<static>|AdditionalCustomerInformation whereBeneficiary2Phone($value)
 * @method static Builder<static>|AdditionalCustomerInformation whereBeneficiaryDocument($value)
 * @method static Builder<static>|AdditionalCustomerInformation whereBeneficiaryName($value)
 * @method static Builder<static>|AdditionalCustomerInformation whereBeneficiaryPhone($value)
 * @method static Builder<static>|AdditionalCustomerInformation whereCreatedAt($value)
 * @method static Builder<static>|AdditionalCustomerInformation whereId($value)
 * @method static Builder<static>|AdditionalCustomerInformation whereUpdatedAt($value)
 * @method static Builder<static>|AdditionalCustomerInformation whereUserId($value)
 * @mixin Eloquent
 */
class AdditionalCustomerInformation extends Model
{
    /** @use HasFactory<AdditionalCustomerInformationFactory> */
    use HasFactory;

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
