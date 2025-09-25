<?php

declare(strict_types = 1);

namespace App\Http\Requests\Admin\Employee;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('Admin') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $digitsOnly = fn ($v) => $v === null ? null : (preg_replace('/\D+/', '', (string)$v) ?: null);

        $this->merge([
            'phone'    => $digitsOnly($this->input('phone')),
            'document' => $digitsOnly($this->input('document')),
        ]);
    }

    public function rules(): array
    {
        $id = $this->route('employee')?->id ?? $this->route('id');

        return [
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($id)],
            'password'  => ['nullable', 'string', 'min:8'],
            'phone'     => ['nullable', 'string', 'size:11', Rule::unique('users', 'phone')->ignore($id)],
            'document'  => ['nullable', 'string', 'size:14', Rule::unique('users', 'document')->ignore($id)],
            'birthdate' => ['nullable', 'date'],
            'pix_key'   => ['nullable', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],

            'additional'                => ['nullable', 'array'],
            'additional.bank_name'      => ['nullable', 'string', 'max:255'],
            'additional.bank_code'      => ['nullable', 'string', 'max:255'],
            'additional.agency_number'  => ['nullable', 'string', 'max:255'],
            'additional.account_number' => ['nullable', 'string', 'max:255'],

            'reset_password' => ['sometimes', 'boolean'],
        ];
    }
}
