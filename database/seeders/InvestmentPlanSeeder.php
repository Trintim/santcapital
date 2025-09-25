<?php

declare(strict_types = 1);

namespace Database\Seeders;

use App\Models\InvestmentPlan;
use App\Models\InvestmentPlanLockupOption;
use Illuminate\Database\Seeder;

class InvestmentPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plan1 = InvestmentPlan::factory()->create([
            'name'                                   => 'Plano 1 — Faixa fixa + bônus',
            'description'                            => 'Carência de 30 dias, aporte mínimo R$ 50.000, prazo 24 meses. Rendimento esperado de 2,65% a 3,92% + 1,5% sobre o capital.',
            'lockup_days'                            => 30,
            'minimum_deposit_amount'                 => 50000.00,
            'contract_term_months'                   => 24,
            'expected_return_min_decimal'            => 0.0265,
            'expected_return_max_decimal'            => 0.0392,
            'extra_bonus_percent_on_capital_decimal' => 0.015000,
            'withdrawal_only_at_maturity'            => false,
            'guaranteed_min_multiplier_after_24m'    => null,
            'is_active'                              => true,
        ]);

        InvestmentPlanLockupOption::factory()->for($plan1)->create([
            'lockup_days' => 30,
            'is_default'  => true,
        ]);

        $plan2 = InvestmentPlan::factory()->create([
            'name'                                   => 'Plano 2 — 12 meses, 2,10% a 5,02%',
            'description'                            => 'Carência de 120 dias, aporte mínimo R$ 5.000, prazo 12 meses. Rendimento esperado de 2,10% a 5,02%.',
            'lockup_days'                            => 120,
            'minimum_deposit_amount'                 => 5000.00,
            'contract_term_months'                   => 12,
            'expected_return_min_decimal'            => 0.0210,
            'expected_return_max_decimal'            => 0.0502,
            'extra_bonus_percent_on_capital_decimal' => null,
            'withdrawal_only_at_maturity'            => false,
            'guaranteed_min_multiplier_after_24m'    => null,
            'is_active'                              => true,
        ]);

        InvestmentPlanLockupOption::factory()->for($plan2)->create([
            'lockup_days' => 120,
            'is_default'  => true,
        ]);

        $plan3 = InvestmentPlan::factory()->create([
            'name'                                   => 'Plano 3 — Somente no vencimento, 51,46% a 228%',
            'description'                            => 'Sem retiradas parciais; saque apenas no fim do contrato. Aporte mínimo R$ 100.000. Opções de carência: 12, 18 ou 24 meses. Na opção de 24 meses, garantia mínima de 2x o capital.',
            'lockup_days'                            => 360, // display padrão; opções abaixo
            'minimum_deposit_amount'                 => 100000.00,
            'contract_term_months'                   => null, // variável
            'expected_return_min_decimal'            => 0.5146,
            'expected_return_max_decimal'            => 2.2800,
            'extra_bonus_percent_on_capital_decimal' => null,
            'withdrawal_only_at_maturity'            => true,
            'guaranteed_min_multiplier_after_24m'    => 2.00,
            'is_active'                              => true,
        ]);

        InvestmentPlanLockupOption::factory()->for($plan3)->createMany([
            [
                'lockup_days' => 360,
                'is_default'  => false,
            ],
            [
                'lockup_days' => 540,
                'is_default'  => false,
            ],
            [
                'lockup_days' => 720,
                'is_default'  => true,
            ],
        ]);
    }
}
