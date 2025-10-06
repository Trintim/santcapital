<?php

declare(strict_types = 1);

namespace App\Http\Resources;

use App\Models\MoneyTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin MoneyTransaction
 */
class MoneyTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'customer_plan_id' => $this->customer_plan_id,
            'type'             => $this->type,
            'amount'           => $this->amount,
            'effective_date'   => $this->effective_date,
            'status'           => $this->status,
            'origin'           => $this->origin,
            'meta'             => $this->meta,
            'created_by'       => $this->created_by,
            'approved_by'      => $this->approved_by,
            'customer_plan'    => CustomerPlanResource::make($this->whenLoaded('customerPlan')),
        ];
    }
}
