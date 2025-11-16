<?php

declare(strict_types = 1);

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule): void
    {
        // Executa o job semanalmente (domingo à noite)
        $schedule->call(function () {
            // Para cada plano ativo, aplica o rendimento semanal
            foreach (\App\Models\InvestmentPlan::where('is_active', 1)->get() as $plan) {
                $period = now()->startOfWeek()->toDateString();
                (new \App\Jobs\ApplyWeeklyYieldJob($plan->id, $period))->handle();
            }
        })->weekly()->sundays()->at('23:00');
    }

    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
