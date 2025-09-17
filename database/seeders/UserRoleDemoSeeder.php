<?php

declare(strict_types = 1);

namespace Database\Seeders;

use App\Enums\Auth\Role as RoleEnum;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserRoleDemoSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(['email' => 'admin@test.local'], [
            'name' => 'Admin', 'password' => Hash::make('senha123'),
        ]);

        $employee = User::firstOrCreate(['email' => 'func@test.local'], [
            'name' => 'Funcionario', 'password' => Hash::make('senha123'),
        ]);

        $customer = User::firstOrCreate(['email' => 'cliente@test.local'], [
            'name' => 'Cliente', 'password' => Hash::make('senha123'),
        ]);

        $rAdmin = Role::firstWhere('name', RoleEnum::Admin);
        $rEmp   = Role::firstWhere('name', RoleEnum::Employee);
        $rCust  = Role::firstWhere('name', RoleEnum::Customer);

        $admin->roles()->syncWithoutDetaching([$rAdmin->id]);
        $employee->roles()->syncWithoutDetaching([$rEmp->id]);
        $customer->roles()->syncWithoutDetaching([$rCust->id]);
    }
}
