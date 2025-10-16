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
        Schema::create('monthly_yields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('investment_plan_id')->constrained('investment_plans')->cascadeOnDelete();
            $table->date('period'); // armazena o primeiro dia do mês (YYYY-MM-01)
            $table->decimal('percent_decimal', 6, 4); // 0.012 = 1,2%
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['investment_plan_id', 'period']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monthly_yields');
    }
};
