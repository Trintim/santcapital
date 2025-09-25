<?php

declare(strict_types = 1);

namespace App\Enums;

enum SortDirection: string
{
    case Ascending  = 'asc';
    case Descending = 'desc';
}
