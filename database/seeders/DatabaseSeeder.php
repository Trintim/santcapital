<?php

declare(strict_types = 1);

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
//            RolesPermissionsSeeder::class,
//            UserSeeder::class,
//            InvestmentPlanSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            InvestmentPlanSeeder::class,
            MonthlyYieldSeeder::class,
            CustomerPlanAndTransactionsSeeder::class,
        ]);
    }
}
