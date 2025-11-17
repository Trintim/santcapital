<?php

declare(strict_types = 1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration
{
    public function up(): void
    {
        Schema::create('customer_plan_custom_yields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_plan_id')->constrained('customer_plans')->cascadeOnDelete();
            $table->date('period'); // primeiro dia da semana
            $table->decimal('percent_decimal', 6, 4); // -0.012 = -1,2%, 0.012 = 1,2%
            $table->foreignId('recorded_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->unique(['customer_plan_id', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_plan_custom_yields');
    }
};
