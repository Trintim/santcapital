<?php

declare(strict_types = 1);

namespace App\Enums;

use Illuminate\Support\Collection;

trait HasCollect
{
    public static function collect(): Collection
    {
        return collect(self::cases());
    }
}
