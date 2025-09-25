<?php

declare(strict_types = 1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('investment_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');                                // exibe PT-BR
            $table->text('description')->nullable();               // exibe PT-BR
            $table->unsignedInteger('lockup_days');                // carência padrão em dias
            $table->decimal('minimum_deposit_amount', 18, 2);      // aporte mínimo (BRL)
            $table->unsignedSmallInteger('contract_term_months')->nullable(); // prazo (meses)
            // faixas informativas (não usadas no cálculo mensal)
            $table->decimal('expected_return_min_decimal', 8, 4)->nullable(); // 0.0265 = 2,65%
            $table->decimal('expected_return_max_decimal', 8, 4)->nullable(); // 0.0392 = 3,92%
            $table->decimal('extra_bonus_percent_on_capital_decimal', 7, 6)->nullable(); // 0.015000 = +1,5%
            $table->boolean('withdrawal_only_at_maturity')->default(false);   // saque só no vencimento?
            $table->decimal('guaranteed_min_multiplier_after_24m', 6, 2)->nullable();    // 2.00 = dobra
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('investment_plans');
    }
};
