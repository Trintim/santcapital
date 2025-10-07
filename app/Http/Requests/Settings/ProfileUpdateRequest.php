<?php

declare(strict_types = 1);

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'  => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'phone'     => ['nullable', 'string'],
            'document'  => ['nullable', 'string', 'max:20'],
            'birthdate' => ['nullable', 'date', 'before:today'],
            'pix_key'   => ['nullable', 'string', 'max:255'],
            // Customer additional
            'beneficiary_name'       => ['nullable', 'string', 'max:255'],
            'beneficiary_document'   => ['nullable', 'string', 'max:20'],
            'beneficiary_phone'      => ['nullable', 'string'],
            'beneficiary_2_name'     => ['nullable', 'string', 'max:255'],
            'beneficiary_2_document' => ['nullable', 'string', 'max:20'],
            'beneficiary_2_phone'    => ['nullable', 'string'],
            // Employee additional
            'bank_name'      => ['nullable', 'string', 'max:255'],
            'bank_code'      => ['nullable', 'string', 'max:20'],
            'agency_number'  => ['nullable', 'string', 'max:20'],
            'account_number' => ['nullable', 'string', 'max:20'],
        ];
    }
}
