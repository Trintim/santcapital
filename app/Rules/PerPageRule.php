<?php

declare(strict_types = 1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class PerPageRule implements ValidationRule
{
    protected array $allowedValues = [5, 15, 25, 50, 75, 100];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! in_array($value, $this->allowedValues)) {
            $fail(__('validation.in', ['attribute' => $attribute]));
        }
    }
}
