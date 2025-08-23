<?php

declare(strict_types = 1);

use App\Enums\Auth\Role;
use App\Http\Controllers\Admin\ClientController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('dashboard');
        })->name('dashboard');

        Route::get('clients', [ClientController::class, 'index'])->name('clients');
    });

require __DIR__ . '/settings.php';

require __DIR__ . '/auth.php';
