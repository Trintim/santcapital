<?php

declare(strict_types = 1);

namespace App\Console\Commands;

use App\Jobs\ApplyWeeklyYieldJob;
use App\Models\InvestmentPlan;
use App\Models\WeeklyYield;
use Illuminate\Console\Command;

class ApplyWeeklyYieldsCommand extends Command
{
    protected $signature = 'weekly-yields:apply';

    protected $description = 'Dispara os jobs de rendimento semanal para todos os planos ativos e período atual.';

    public function handle(): int
    {
        $now              = now()->toImmutable();
        $period           = $now->startOfWeek()->toDateString();
        $planIdsWithYield = WeeklyYield::where('period', $period)
            ->pluck('investment_plan_id')
            ->toArray();
        $plans = InvestmentPlan::where('is_active', true)
            ->whereIn('id', $planIdsWithYield)
            ->get(['id']);
        $count = 0;

        foreach ($plans as $plan) {
            ApplyWeeklyYieldJob::dispatch($plan->id, $period);
            $count++;
        }

        $allPlans = InvestmentPlan::where('is_active', true)->get(['id', 'name']);
        $missing = [];
        foreach ($allPlans as $plan) {
            if (!in_array($plan->id, $planIdsWithYield)) {
                $missing[] = $plan->name . " (ID: $plan->id)";
            }
        }
        if ($missing) {
            $this->warn("Os seguintes planos ativos não possuem WeeklyYield para o período {$period}:");
            foreach ($missing as $msg) {
                $this->line("- " . $msg);
            }
        }

        if ($count > 0) {
            $this->info("Disparados {$count} jobs de rendimento semanal para o período {$period}.");
        } else {
            $this->warn("Nenhum rendimento semanal encontrado para o período {$period}. Nenhum job disparado.");
        }

        return 0;
    }
}
