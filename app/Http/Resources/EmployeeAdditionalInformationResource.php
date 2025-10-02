<?php

declare(strict_types = 1);

namespace App\Http\Resources;

use App\Models\AdditionalEmployeeInformation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin AdditionalEmployeeInformation
 */
class EmployeeAdditionalInformationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'user_id'        => $this->user_id,
            'bank_name'      => $this->bank_name,
            'bank_code'      => $this->bank_code,
            'agency_number'  => $this->agency_number,
            'account_number' => $this->account_number,
        ];
    }
}
