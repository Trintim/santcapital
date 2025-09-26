<?php

namespace Database\Seeders;

use App\Enums\Auth\Role as RoleEnum;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        foreach (RoleEnum::collect() as $name) {
            Role::firstOrCreate(['name' => $name]);
        }
    }
}
