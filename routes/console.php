<?php

declare(strict_types = 1);

use App\Console\Commands\ApplyWeeklyYieldsCommand;
use Illuminate\Console\Scheduling\Schedule as ScheduleAlias;
use Illuminate\Support\Facades\Schedule;

Schedule::command(ApplyWeeklyYieldsCommand::class)
    ->weeklyOn(ScheduleAlias::SUNDAY, '00:00') // toda segunda-feira à meia-noite
    ->withoutOverlapping();
