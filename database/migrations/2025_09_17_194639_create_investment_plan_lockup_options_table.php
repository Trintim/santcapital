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
        Schema::create('investment_plan_lockup_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('investment_plan_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('lockup_days');    // ex.: 30, 120, 360, 540, 720 (aprox.)
            $table->boolean('is_default')->default(false);
            $table->timestamps();
            $table->unique(['investment_plan_id', 'lockup_days'], 'ipl_lockup_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('investment_plan_lockup_options');
    }
};
