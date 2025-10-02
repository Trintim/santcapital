<?php

declare(strict_types = 1);

namespace App\Http\Resources;

use App\Models\AdditionalCustomerInformation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin AdditionalCustomerInformation
 */
class CustomerAdditionalInformationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                     => $this->id,
            'user_id'                => $this->user_id,
            'beneficiary_name'       => $this->beneficiary_name,
            'beneficiary_document'   => $this->beneficiary_document,
            'beneficiary_phone'      => $this->beneficiary_phone,
            'beneficiary_2_name'     => $this->beneficiary_2_name,
            'beneficiary_2_document' => $this->beneficiary_2_document,
            'beneficiary_2_phone'    => $this->beneficiary_2_phone,
        ];
    }
}
