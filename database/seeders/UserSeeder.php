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

        $users = [
            [
                'email' => 'direcao011@outlook.com',
                'name'  => 'Jocimar',
                'role'  => $roleAdmin,
            ],
            [
                'email' => 'direcao012@outlook.com',
                'name'  => 'Patrícia',
                'role'  => $roleAdmin,
            ],
            [
                'email' => 'gestao0225@outlook.com',
                'name'  => 'Eliane',
                'role'  => $roleEmployee,
            ],
            [
                'email' => 'adm22225@outlook.com',
                'name'  => 'Tatiany',
                'role'  => $roleEmployee,
            ],
        ];

        foreach ($users as $userData) {
            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name'      => $userData['name'],
                    'phone'     => '27' . str_pad((string) random_int(900000000, 999999999), 9, '0', STR_PAD_LEFT),
                    'document'  => str_pad((string) random_int(10000000000, 99999999999), 14, '0', STR_PAD_LEFT),
                    'password'  => Hash::make('Santcapital@2025!'),
                    'is_active' => true,
                ]
            );

            $user->roles()->syncWithoutDetaching([$userData['role']->id]);
        }
    }
}
