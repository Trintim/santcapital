<?php

declare(strict_types = 1);

namespace App\Http\Requests;

use App\Enums\Auth\Role;
use App\Models\CustomerPlan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreDepositRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(Role::Employee) ?? false;
    }

    public function rules(): array
    {
        return [
            'customer_plan_id' => ['required', Rule::exists(CustomerPlan::class, 'id')],
            'amount'           => ['required', 'numeric', 'min:0.01'],
            'effective_date'   => ['nullable', 'date'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $cpId = (int) $this->input('customer_plan_id');
            $cp   = $cpId ? CustomerPlan::with('plan')->find($cpId) : null;

            if (! $cp || ! $cp->plan) {
                return;
            }

            $min    = (float) $cp->plan->minimum_deposit_amount;
            $amount = (float) $this->input('amount');

            if ($amount < $min) {
                $v->errors()->add('amount', 'Valor mínimo para este plano é R$ ' . number_format($min, 2, ',', '.'));
            }
        });
    }
}
