<?php

declare(strict_types = 1);

namespace App\Resources\Admin;

use App\Models\InvestmentPlanLockupOption;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin InvestmentPlanLockupOption */
class InvestmentPlanLockupOptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'investment_plan_id' => $this->investment_plan_id,
            'lockup_days'        => $this->lockup_days,
            'is_default'         => $this->is_default,
        ];
    }
}
