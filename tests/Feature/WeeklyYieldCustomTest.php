<?php

declare(strict_types = 1);

namespace Tests\Feature;

use App\Models\CustomerPlan;
use App\Models\CustomerPlanCustomYield;
use App\Models\InvestmentPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WeeklyYieldCustomTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Garante que o papel admin existe
        if (! \App\Models\Role::where('name', \App\Enums\Auth\Role::Admin)->exists()) {
            \App\Models\Role::create(['name' => \App\Enums\Auth\Role::Admin]);
        }
    }

    public function test_create_and_update_custom_yield_for_same_week_and_customer_plan(): void
    {
        $admin     = User::factory()->create();
        $roleAdmin = \App\Models\Role::where('name', \App\Enums\Auth\Role::Admin)->first();
        $admin->roles()->attach($roleAdmin);
        $customerPlan = CustomerPlan::factory()->create();
        $period       = '2025-11-15';

        // Cria rendimento personalizado
        $this->actingAs($admin)
            ->post('/admin/rendimentos-semanais', [
                'period'        => $period,
                'custom_yields' => [
                    [
                        'customer_plan_id' => $customerPlan->id,
                        'percent_decimal'  => '5',
                    ],
                ],
                'recorded_by' => $admin->id,
            ])
            ->assertSessionHas('success');

        $this->assertDatabaseHas('customer_plan_custom_yields', [
            'customer_plan_id' => $customerPlan->id,
            'period'           => $period,
            'percent_decimal'  => '5.0000',
        ]);

        // Atualiza rendimento para mesma semana e cliente/plano
        $this->actingAs($admin)
            ->post('/admin/rendimentos-semanais', [
                'period'        => $period,
                'custom_yields' => [
                    [
                        'customer_plan_id' => $customerPlan->id,
                        'percent_decimal'  => '-2.5',
                    ],
                ],
                'recorded_by' => $admin->id,
            ])
            ->assertSessionHas('success');

        $this->assertDatabaseHas('customer_plan_custom_yields', [
            'customer_plan_id' => $customerPlan->id,
            'period'           => $period,
            'percent_decimal'  => '-2.5000',
        ]);
    }

    public function test_create_custom_yield_for_different_weeks(): void
    {
        $admin = User::factory()->asAdmin()->create();

        $customer       = User::factory()->asCustomer()->create();
        $investmentPlan = InvestmentPlan::factory()->create();

        $customerPlan = CustomerPlan::factory()
            ->create(
                [
                    'user_id'            => $customer->id,
                    'investment_plan_id' => $investmentPlan->id,
                ]
            );
        $period1 = '2025-11-15';
        $period2 = '2025-11-22';
        // Cria rendimento personalizado para a primeira semana
        $this->actingAs($admin)
            ->post('/admin/rendimentos-semanais', [
                'period'        => $period1,
                'custom_yields' => [
                    [
                        'customer_plan_id' => $customerPlan->id,
                        'percent_decimal'  => '3.5',
                    ],
                ],
                'recorded_by' => $admin->id,
            ])
            ->assertSessionHas('success');
        $this->assertDatabaseHas('customer_plan_custom_yields', [
            'customer_plan_id' => $customerPlan->id,
            'period'           => $period1,
            'percent_decimal'  => '3.5000',
        ]);
        // Cria rendimento personalizado para a segunda semana
        $this->actingAs($admin)
            ->post('/admin/rendimentos-semanais', [
                'period'        => $period2,
                'custom_yields' => [
                    [
                        'customer_plan_id' => $customerPlan->id,
                        'percent_decimal'  => '4.0',
                    ],
                ],
                'recorded_by' => $admin->id,
            ])
            ->assertSessionHas('success');
        $this->assertDatabaseHas('customer_plan_custom_yields', [
            'customer_plan_id' => $customerPlan->id,
            'period'           => $period2,
            'percent_decimal'  => '4.0000',
        ]);

        // Verifica que existem dois yields distintos para o mesmo customer_plan
        $this->assertEquals(2, CustomerPlanCustomYield::where('customer_plan_id', $customerPlan->id)->count());
    }
}
