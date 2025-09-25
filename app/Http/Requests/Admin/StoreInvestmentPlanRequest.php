<?php

declare(strict_types = 1);

namespace App\Http\Requests\Admin;

use App\Enums\Auth\Role;
use Illuminate\Foundation\Http\FormRequest;

class StoreInvestmentPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->hasRole(Role::Admin);
    }

    public function rules(): array
    {
        return [
            'name'                                   => ['required', 'string', 'max:255'],
            'description'                            => ['nullable', 'string'],
            'lockup_days'                            => ['required', 'integer', 'min:0'],
            'minimum_deposit_amount'                 => ['required', 'numeric', 'min:0.01'],
            'contract_term_months'                   => ['nullable', 'integer', 'min:1'],
            'expected_return_min_decimal'            => ['nullable', 'numeric'],
            'expected_return_max_decimal'            => ['nullable', 'numeric'],
            'extra_bonus_percent_on_capital_decimal' => ['nullable', 'numeric'],
            'withdrawal_only_at_maturity'            => ['required', 'boolean'],
            'guaranteed_min_multiplier_after_24m'    => ['nullable', 'numeric'],
            'is_active'                              => ['required', 'boolean'],
        ];
    }
}
