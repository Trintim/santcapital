<?php

declare(strict_types = 1);

namespace Database\Seeders;

use App\Enums\Auth\Role as RoleEnum;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::factory()->create([
            'name'      => 'Admin Demo',
            'email'     => 'admin@example.com',
            'password'  => bcrypt('password'),
            'is_active' => true,
        ]);

        $adminRole    = Role::where('name', RoleEnum::Admin)->firstOrFail();
        $employeeRole = Role::where('name', RoleEnum::Employee)->firstOrFail();
        $customerRole = Role::where('name', RoleEnum::Customer)->firstOrFail();

        $admin->roles()->syncWithoutDetaching([$adminRole->id]);

        // Funcionários
        $employees = User::factory(8)->create();

        foreach ($employees as $u) {
            $u->roles()->syncWithoutDetaching([$employeeRole->id]);
            $u->employeeAdditionalInformation()->create([
                'bank_name'      => 'Banco ' . rand(1, 9),
                'bank_code'      => (string) rand(1, 999),
                'agency_number'  => (string) rand(1000, 9999),
                'account_number' => (string) rand(10000, 99999),
            ]);
        }

        // Clientes
        $customers = User::factory(25)->create();

        foreach ($customers as $u) {
            $u->roles()->syncWithoutDetaching([$customerRole->id]);
            $u->customerAdditionalInformation()->create([
                'beneficiary_name'       => fake()->name(),
                'beneficiary_document'   => fake()->numerify('##############'),
                'beneficiary_phone'      => fake()->numerify('###########'),
                'beneficiary_2_name'     => fake()->boolean(50) ? fake()->name() : null,
                'beneficiary_2_document' => fake()->boolean(50) ? fake()->numerify('##############') : null,
                'beneficiary_2_phone'    => fake()->boolean(50) ? fake()->numerify('###########') : null,
            ]);
        }
    }
}
