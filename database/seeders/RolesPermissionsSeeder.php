<?php

declare(strict_types = 1);

namespace Database\Seeders;

use App\Enums\Auth\Can;
use App\Enums\Auth\Role as RoleEnum;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        foreach (RoleEnum::cases() as $role) {
            Role::query()->create(['name' => $role]);
        }

        foreach (Can::cases() as $permission) {
            Permission::query()->create(['name' => $permission]);
        }

        $userAdmin = Role::query()->where('name', RoleEnum::Admin)->first();

        $userAdmin->permissions()->attach(Permission::query()->where('name', Can::ViewDashboard)->first());
    }
}
