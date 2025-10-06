<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\CustomerAdditionalInformationResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin User */
class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                              => $this->id,
            'name'                            => $this->name,
            'email'                           => $this->email,
            'phone'                           => $this->phone,
            'document'                        => $this->document,
            'is_active'                       => $this->is_active,
            'customer_additional_information' => CustomerAdditionalInformationResource::make($this->whenLoaded('customerAdditionalInformation')),
            'customer_plans'                  => CustomerPlanResource::collection($this->whenLoaded('customerPlans')),
        ];
    }
}

