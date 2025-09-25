<?php

declare(strict_types = 1);

namespace App\Models;

use App\Enums\Auth\Role as RoleEnum;
use Carbon\CarbonImmutable;
use Eloquent;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property int $id
 * @property RoleEnum $name
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 * @property-read Collection<int, Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read Collection<int, User> $users
 * @property-read int|null $users_count
 *
 * @method static Builder<static>|Role admin()
 * @method static Builder<static>|Role customer()
 * @method static Builder<static>|Role employee()
 * @method static Builder<static>|Role newModelQuery()
 * @method static Builder<static>|Role newQuery()
 * @method static Builder<static>|Role query()
 * @method static Builder<static>|Role whereCreatedAt($value)
 * @method static Builder<static>|Role whereId($value)
 * @method static Builder<static>|Role whereName($value)
 * @method static Builder<static>|Role whereUpdatedAt($value)
 *
 * @mixin Eloquent
 */
class Role extends Model
{
    protected function casts(): array
    {
        return [
            'name' => RoleEnum::class,
        ];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class);
    }

    #[Scope]
    public function admin(Builder $query): Builder
    {
        return $query->where('name', RoleEnum::Admin);
    }

    #[Scope]
    public function employee(Builder $query): Builder
    {
        return $query->where('name', RoleEnum::Employee);
    }

    #[Scope]
    public function customer(Builder $query): Builder
    {
        return $query->where('name', RoleEnum::Customer);
    }
}
