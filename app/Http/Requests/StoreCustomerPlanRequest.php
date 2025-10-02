<?php

declare(strict_types = 1);

namespace App\Http\Requests;

use App\Enums\Auth\Role;
use App\Models\InvestmentPlan;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreCustomerPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole([Role::Admin, Role::Employee]) ?? false;
    }

    public function rules(): array
    {
        return [
            'user_id'            => ['required', Rule::exists(User::class, 'id')],
            'investment_plan_id' => ['required', Rule::exists(InvestmentPlan::class, 'id')],
            'chosen_lockup_days' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $planId = (int) $this->input('investment_plan_id');

            if (! $planId) {
                return;
            }

            $plan = InvestmentPlan::with('lockupOptions')->find($planId);

            if (! $plan) {
                return;
            }

            $chosen = $this->input('chosen_lockup_days');

            if ($chosen === null || $chosen === '') {
                return;
            }

            $allowed = collect($plan->lockupOptions)->pluck('lockup_days')
                ->push($plan->lockup_days)
                ->unique()
                ->all();

            if (! in_array((int) $chosen, $allowed, true)) {
                $v->errors()->add('chosen_lockup_days', 'Carência escolhida não é válida para este plano.');
            }
        });
    }
}
