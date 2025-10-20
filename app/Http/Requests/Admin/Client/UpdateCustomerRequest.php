<?php

declare(strict_types = 1);

namespace App\Http\Requests\Admin\Client;

use App\Enums\Auth\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole([Role::Admin, Role::Employee]) ?? false;
    }

    protected function prepareForValidation(): void
    {
        $digitsOnly = fn ($v) => $v === null ? null : (preg_replace('/\D+/', '', (string) $v) ?: null);

        $this->merge([
            'phone'    => $digitsOnly($this->input('phone')),
            'document' => $digitsOnly($this->input('document')),
        ]);
    }

    public function rules(): array
    {
        $id = $this->route('customer')?->id ?? $this->route('id');

        return [
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($id)],
            'password'  => ['nullable', 'string', 'min:8'],
            'phone'     => ['nullable', 'string', 'size:11', Rule::unique('users', 'phone')->ignore($id)],
            'document'  => ['nullable', 'string', 'min:11', ' max:14', Rule::unique('users', 'document')->ignore($id)],
            'birthdate' => ['nullable', 'date'],
            'pix_key'   => ['nullable', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],

            'additional'                        => ['nullable', 'array'],
            'additional.beneficiary_name'       => ['nullable', 'string', 'max:255'],
            'additional.beneficiary_document'   => ['nullable', 'string', 'max:255'],
            'additional.beneficiary_phone'      => ['nullable', 'string', 'max:255'],
            'additional.beneficiary_2_name'     => ['nullable', 'string', 'max:255'],
            'additional.beneficiary_2_document' => ['nullable', 'string', 'max:255'],
            'additional.beneficiary_2_phone'    => ['nullable', 'string', 'max:255'],

            'reset_password' => ['sometimes', 'boolean'],
        ];
    }
}
