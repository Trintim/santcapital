<?php

declare(strict_types = 1);

namespace Database\Seeders;

use App\Models\CustomerPlan;
use App\Models\InvestmentPlan;
use App\Models\MoneyTransaction;
use App\Models\User;
use Illuminate\Database\Seeder;
use App\Enums\Auth\Role as RoleEnum;
use Illuminate\Support\Facades\DB;

class CustomerPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plan1 = InvestmentPlan::where('name', 'Plano 1 — Faixa fixa + bônus')->firstOrFail();
        $plan2 = InvestmentPlan::where('name', 'Plano 2 — 12 meses, 2,10% a 5,02%')->firstOrFail();
        $plan3 = InvestmentPlan::where('name', 'Plano 3 — Somente no vencimento, 51,46% a 228%')->firstOrFail();

        $adminId = (int) User::whereRelation('roles', fn ($q) => $q->where('name', RoleEnum::Admin))->value('id');

        $customers = User::whereRelation('roles', fn ($q) => $q->where('name', RoleEnum::Customer))
            ->where('is_active', true)
            ->orderBy('id')
            ->get();

        if ($customers->isEmpty()) {
            return;
        }

        $now = now()->toImmutable();

        DB::transaction(function () use ($customers, $plan1, $plan2, $plan3, $adminId, $now) {
            foreach ($customers as $idx => $user) {
                $scenario = $idx % 3;

                if ($scenario === 0) {
                    // === Elegível a saque ===
                    // Plano 1 (lockup 30d), ativado há 60d, saldo > 0, sem chosen_lockup (usa do plano)
                    $cp = CustomerPlan::create([
                        'user_id'            => $user->id,
                        'investment_plan_id' => $plan1->id,
                        'status'             => 'active',
                        'chosen_lockup_days' => null,
                        'activated_on'       => $now->subDays(60)->toDateString(),
                    ]);

                    // Depósito aprovado
                    MoneyTransaction::create([
                        'customer_plan_id' => $cp->id,
                        'type'             => MoneyTransaction::TYPE_DEPOSIT,
                        'amount'           => 80_000.00,
                        'effective_date'   => $now->subDays(58)->toDateString(),
                        'status'           => MoneyTransaction::STATUS_APPROVED,
                        'origin'           => 'seed',
                        'created_by'       => $adminId,
                        'approved_by'      => $adminId,
                    ]);

                    // Rendimento aprovado
                    MoneyTransaction::create([
                        'customer_plan_id' => $cp->id,
                        'type'             => MoneyTransaction::TYPE_YIELD,
                        'amount'           => 2_000.00,
                        'effective_date'   => $now->subDays(25)->toDateString(),
                        'status'           => MoneyTransaction::STATUS_APPROVED,
                        'origin'           => 'seed',
                        'created_by'       => $adminId,
                        'approved_by'      => $adminId,
                    ]);

                    // (Opcional) Saque pendente — para ver o desconto no saldo disponível
                    MoneyTransaction::create([
                        'customer_plan_id' => $cp->id,
                        'type'             => MoneyTransaction::TYPE_WITHDRAWAL,
                        'amount'           => 1_500.00,
                        'effective_date'   => $now->toDateString(),
                        'status'           => MoneyTransaction::STATUS_PENDING,
                        'origin'           => 'customer_request',
                        'created_by'       => $user->id,
                        'meta'             => ['method' => 'pix', 'pix_key' => 'customer1@sant.test'],
                    ]);
                }

                if ($scenario === 1) {
                    // === NÃO elegível por carência ===
                    // Plano 2 (lockup 120d), ativado há 10d
                    $cp = CustomerPlan::create([
                        'user_id'            => $user->id,
                        'investment_plan_id' => $plan2->id,
                        'status'             => 'active',
                        'chosen_lockup_days' => null, // usa lockup do plano (120d)
                        'activated_on'       => $now->subDays(10)->toDateString(),
                    ]);

                    // Depósito aprovado
                    MoneyTransaction::create([
                        'customer_plan_id' => $cp->id,
                        'type'             => MoneyTransaction::TYPE_DEPOSIT,
                        'amount'           => 6_000.00,
                        'effective_date'   => $now->subDays(9)->toDateString(),
                        'status'           => MoneyTransaction::STATUS_APPROVED,
                        'origin'           => 'seed',
                        'created_by'       => $adminId,
                        'approved_by'      => $adminId,
                    ]);
                }

                if ($scenario === 2) {
                    // === Plano só no vencimento ===
                    // Plano 3 (withdrawal_only_at_maturity = true)
                    $cp = CustomerPlan::create([
                        'user_id'            => $user->id,
                        'investment_plan_id' => $plan3->id,
                        'status'             => 'active',
                        // escolhe uma das opções (360/540/720); aqui 720 (padrão)
                        'chosen_lockup_days' => 720,
                        'activated_on'       => $now->subDays(100)->toDateString(),
                    ]);

                    MoneyTransaction::create([
                        'customer_plan_id' => $cp->id,
                        'type'             => MoneyTransaction::TYPE_DEPOSIT,
                        'amount'           => 120_000.00,
                        'effective_date'   => $now->subDays(98)->toDateString(),
                        'status'           => MoneyTransaction::STATUS_APPROVED,
                        'origin'           => 'seed',
                        'created_by'       => $adminId,
                        'approved_by'      => $adminId,
                    ]);

                    MoneyTransaction::create([
                        'customer_plan_id' => $cp->id,
                        'type'             => MoneyTransaction::TYPE_YIELD,
                        'amount'           => 3_000.00,
                        'effective_date'   => $now->subDays(12)->toDateString(),
                        'status'           => MoneyTransaction::STATUS_APPROVED,
                        'origin'           => 'seed',
                        'created_by'       => $adminId,
                        'approved_by'      => $adminId,
                    ]);
                }
            }
        });
    }
}
