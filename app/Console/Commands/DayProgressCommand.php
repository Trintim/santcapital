<?php

declare(strict_types = 1);

namespace App\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Number;

class DayProgressCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'day:progress';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Exibe a porcentagem do dia já passada.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now              = Carbon::now();
        $minutesPassed    = $now->hour * 60 + $now->minute;
        $totalMinutes     = 24 * 60;
        $percent          = ($minutesPassed / $totalMinutes) * 100;
        $percentFormatted = Number::percentage($percent, 3);
        $this->info("Porcentagem do dia já passada: {$percentFormatted}%");
        Log::info("DayProgressCommand: Porcentagem do dia já passada: {$percentFormatted}%");
    }
}
