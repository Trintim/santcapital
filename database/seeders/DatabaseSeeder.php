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
            InvestmentPlanSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            CustomerPlanSeeder::class,
            WeeklyYieldSeeder::class,
            CustomerPlanCustomYieldSeeder::class,
            CustomerPlanAndTransactionsSeeder::class,
        ]);
    }
}
