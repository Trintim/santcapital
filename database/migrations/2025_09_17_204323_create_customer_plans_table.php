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
        Schema::create('customer_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('investment_plan_id')->constrained('investment_plans');
            $table->date('activated_on')->nullable(); // set on first approved deposit
            $table->enum('status', ['pre_active', 'active', 'inactive'])->default('pre_active');
            $table->timestamps();
            $table->index(['user_id', 'investment_plan_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_plans');
    }
};
