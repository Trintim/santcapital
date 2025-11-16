<?php

declare(strict_types = 1);

use App\Console\Commands\ApplyWeeklyYieldsCommand;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\Artisan;

Artisan::command(ApplyWeeklyYieldsCommand::class, function (Schedule $schedule) {
    $schedule->command(ApplyWeeklyYieldsCommand::class)->everyMinute();
    //        ->weeklyOn(Schedule::SUNDAY, '23:00');
});
