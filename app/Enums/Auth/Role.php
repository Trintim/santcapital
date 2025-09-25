<?php

declare(strict_types = 1);

namespace App\Enums\Auth;

use App\Enums\HasCollect;

enum Role: string
{
    use HasCollect;

    case Admin = 'admin';

    case Employee = 'employee';

    case Customer = 'customer';

    public function isAdmin(): bool
    {
        return $this === Role::Admin;
    }

    public function routeByRole(): string
    {
        return match ($this) {
            Role::Admin    => route('admin.dashboard', absolute: false),
            Role::Employee => route('employee.dashboard', absolute: false),
            Role::Customer => route('customer.dashboard', absolute: false),
        };
    }
}
