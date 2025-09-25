<?php

declare(strict_types = 1);

namespace App\Http\Requests\Admin\Client;

use App\Enums\Auth\Role;
use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(Role::Admin) ?? false;
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
        return [
            // users
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone'     => ['nullable', 'string', 'size:11', 'unique:users,phone'],
            'document'  => ['nullable', 'string', 'size:14', 'unique:users,document'],
            'birthdate' => ['nullable', 'date'],
            'pix_key'   => ['nullable', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],

            // additional_employee_information
            'additional'                => ['nullable', 'array'],
            'additional.bank_name'      => ['nullable', 'string', 'max:255'],
            'additional.bank_code'      => ['nullable', 'string', 'max:255'],
            'additional.agency_number'  => ['nullable', 'string', 'max:255'],
            'additional.account_number' => ['nullable', 'string', 'max:255'],

            'send_welcome' => ['sometimes', 'boolean'],
        ];
    }
}
