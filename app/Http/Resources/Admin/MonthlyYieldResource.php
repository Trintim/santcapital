<?php

declare(strict_types = 1);

namespace App\Http\Resources\Admin;

use App\Models\MonthlyYield;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/* @mixin MonthlyYield */
class MonthlyYieldResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'investment_plan_id' => $this->investment_plan_id,
            'period'             => $this->period,
            'percent_decimal'    => $this->percent_decimal,
            'recorded_by'        => $this->recorded_by,
            'created_at'         => $this->created_at,
            'updated_at'         => $this->updated_at,
            'plan'               => PlanResource::make($this->whenLoaded('plan')),
        ];
    }
}
