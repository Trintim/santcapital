<?php

declare(strict_types = 1);

namespace App\Http\Resources\Admin;

use App\Models\InvestmentPlan;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin InvestmentPlan */
class PlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                                     => $this->id,
            'name'                                   => $this->name,
            'description'                            => $this->description,
            'lockup_days'                            => $this->lockup_days,
            'minimum_deposit_amount'                 => $this->minimum_deposit_amount,
            'is_active'                              => (bool) $this->is_active,
            'contract_term_months'                   => $this->contract_term_months,
            'expected_return_max_decimal'            => $this->expected_return_max_decimal,
            'expected_return_min_decimal'            => $this->expected_return_min_decimal,
            'extra_bonus_percent_on_capital_decimal' => $this->extra_bonus_percent_on_capital_decimal,
            'guaranteed_min_multiplier_after_24m'    => $this->guaranteed_min_multiplier_after_24m,
            'withdrawal_only_at_maturity'            => $this->withdrawal_only_at_maturity,
            'lockup_options'                         => InvestmentPlanLockupOptionResource::collection($this->whenLoaded('lockupOptions')),
        ];
    }
}
