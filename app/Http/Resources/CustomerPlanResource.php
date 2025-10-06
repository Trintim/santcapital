<?php

declare(strict_types = 1);

namespace App\Http\Resources;

use App\Http\Resources\Admin\ClientResource;
use App\Http\Resources\Admin\PlanResource;
use App\Models\CustomerPlan;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin CustomerPlan */
class CustomerPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'user_id'            => $this->user_id,
            'plan_id'            => $this->investment_plan_id,
            'status'             => $this->status,
            'activated_on'       => $this->activated_on,
            'chosen_lockup_days' => $this->chosen_lockup_days,
            'customer'           => ClientResource::make($this->whenLoaded('customer')),
            'plan'               => PlanResource::make($this->whenLoaded('plan')),
        ];
    }
}
