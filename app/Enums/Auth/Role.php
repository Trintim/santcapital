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
}
