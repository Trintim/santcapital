<?php

declare(strict_types = 1);

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

        Route::get('/clients', [ClientController::class, 'index'])->name('clients.index');
    });

Route::middleware(['auth', 'role:admin,employee'])
    ->prefix('employee')
    ->name('employee.')
    ->group(function () {
        Route::get('dashboard', fn () => Inertia::render('employee/dashboard'))
            ->name('dashboard');
        // Ex.: rotas de clientes, aportes, aprovar/reprovar saques, etc.
    });

Route::middleware(['auth', 'role:customer'])
    ->prefix('customer')
    ->name('customer.')
    ->group(function () {
        Route::get('dashboard', fn () => Inertia::render('customer/dashboard'))
            ->name('dashboard');

        // Ex.: lista de aportes do cliente
        // Route::get('aportes', [Cliente\AporteController::class, 'index'])->name('aportes.index');
    });

require __DIR__ . '/settings.php';

require __DIR__ . '/auth.php';
