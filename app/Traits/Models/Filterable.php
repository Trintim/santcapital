<?php

declare(strict_types = 1);

namespace App\Traits\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;

trait Filterable
{
    #[Scope]
    public function filters(Builder $query, array $params): void
    {
        $filteredParams = collect($params)->filter(fn ($value) => $value !== null);

        if ($filteredParams->isEmpty()) {
            return;
        }

        $query->where(function (Builder $query) use ($filteredParams) {
            foreach ($filteredParams as $key => $value) {
                if (is_string($value)) {
                    $query->whereLike($key, "%$value%");
                } else {
                    $query->where($key, '=', $value);
                }
            }
        });
    }
}
