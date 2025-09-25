<?php

declare(strict_types = 1);

namespace App\Http\Requests\Admin\CustomerPlan;

use App\Enums\SortDirection;
use App\Rules\PerPageRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'search'    => ['nullable', 'string'],
            'per-page'  => ['nullable', 'integer', new PerPageRule()],
            'sort-by'   => ['sometimes', 'string', Rule::in(['name', 'email'])],
            'direction' => ['sometimes', 'string', Rule::enum(SortDirection::class)],
        ];
    }

    public function attributes(): array
    {
        return [
            'per-page' => 'per page',
            'sort-by'  => 'sort by',
        ];
    }
}
