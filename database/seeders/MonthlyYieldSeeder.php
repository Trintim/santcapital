<?php

declare(strict_types = 1);

namespace Database\Seeders;

use App\Models\InvestmentPlan;
use App\Models\MonthlyYield;
use Illuminate\Database\Seeder;

class MonthlyYieldSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = InvestmentPlan::all();

        foreach ($plans as $plan) {
            // cria 12 meses (incluindo alguns aleatórios zerados para variar)
            for ($i = 0; $i < 12; $i++) {
                // formato YYYY-MM-01
                $period = now()->copy()->subMonths($i)->startOfMonth()->format('Y-m-01');

                // ~80% dos meses terão lançamento
                if (mt_rand(1, 100) <= 80) {
                    MonthlyYield::firstOrCreate(
                        ['investment_plan_id' => $plan->id, 'period' => $period],
                        [
                            'percent_decimal' => mt_rand(6, 25) / 1000, // 0.6% a 2.5%
                            'recorded_by'     => 1,
                        ]
                    );
                }
            }
        }
    }
}
