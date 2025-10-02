<?php

declare(strict_types = 1);

namespace Database\Seeders;

use App\Enums\Auth\Role as RoleEnum;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $roleAdmin    = Role::where('name', RoleEnum::Admin)->firstOrFail();
        $roleEmployee = Role::where('name', RoleEnum::Employee)->firstOrFail();
        $roleCustomer = Role::where('name', RoleEnum::Customer)->firstOrFail();

        // Admin (documento fixo e único)
        $admin = User::updateOrCreate(
            ['email' => 'admin@sant.test'],
            [
                'name'      => 'Admin',
                'phone'     => '11999990000',
                'document'  => '00000000000000',
                'password'  => Hash::make('password'),
                'is_active' => true,
            ]
        );
        $admin->roles()->syncWithoutDetaching([$roleAdmin->id]);

        // Funcionário (documento em faixa 0000...10001 para não colidir com clientes)
        $employee = User::updateOrCreate(
            ['email' => 'employee@sant.test'],
            [
                'name'      => 'Employee',
                'phone'     => '11999990001',
                'document'  => '00000000010001',
                'password'  => Hash::make('password'),
                'is_active' => true,
            ]
        );
        $employee->roles()->syncWithoutDetaching([$roleEmployee->id]);

        // Clientes em outra faixa (ex.: 0000...20001, 0000...20002, ...)
        for ($i = 1; $i <= 5; $i++) {
            $email    = "customer{$i}@sant.test";
            $document = str_pad((string) (20000 + $i), 14, '0', STR_PAD_LEFT); // 00000000020001, 00000000020002...

            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name'      => "Customer {$i}",
                    'phone'     => '119' . str_pad((string) (1230000 + $i), 7, '0', STR_PAD_LEFT),
                    'document'  => $document,
                    'password'  => Hash::make('password'),
                    'is_active' => true,
                ]
            );
            $user->roles()->syncWithoutDetaching([$roleCustomer->id]);
        }
    }
}
