<?php

declare(strict_types = 1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()
            ->asAdmin()
            ->create([
                'name'  => 'Admin',
                'email' => 'test@example.com',
            ]);

        User::factory(5)->asEmployee()->create();
        User::factory(100)->asCustomer()->create();
    }
}
