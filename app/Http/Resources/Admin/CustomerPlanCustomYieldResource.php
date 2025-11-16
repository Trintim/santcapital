<?php

declare(strict_types = 1);

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class CustomerPlanCustomYieldResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'customer_plan_id' => $this->customer_plan_id,
            'period'           => $this->period,
            'percent_decimal'  => $this->percent_decimal, // já convertido pelo accessor
            'recorded_by'      => $this->recorded_by,
            'created_at'       => $this->created_at,
            'updated_at'       => $this->updated_at,
            'customer_plan'    => $this->whenLoaded('customerPlan'),
        ];
    }
}
