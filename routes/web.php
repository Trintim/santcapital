<?php

declare(strict_types = 1);

use App\Http\Controllers\Admin;
use App\Http\Controllers\Admin\InvestmentPlanController;
use App\Http\Controllers\Admin\InvestmentPlanLockupOptionController;
use App\Http\Controllers\Admin\MonthlyYieldController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/login');

Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('dashboard', Admin\DashboardController::class)->name('dashboard');

        // Plans
        Route::prefix('planos')
            ->name('plans.')
            ->group(function () {
                Route::get('/', [InvestmentPlanController::class, 'index'])->name('index');
                Route::get('create', [InvestmentPlanController::class, 'create'])->name('create');
                Route::post('/', [InvestmentPlanController::class, 'store'])->name('store');
                Route::get('{plan}/edit', [InvestmentPlanController::class, 'edit'])->name('edit');
                Route::put('{plan}', [InvestmentPlanController::class, 'update'])->name('update');
                Route::patch('{plan}/toggle', [InvestmentPlanController::class, 'toggleActive'])->name('toggle-active');
                Route::delete('{plan}', [InvestmentPlanController::class, 'destroy'])->name('destroy');
                Route::post('{plan}/lockups', [InvestmentPlanLockupOptionController::class, 'store'])->name('lockups.store');
                Route::delete('{plan}/lockups/{option}/delete', [InvestmentPlanLockupOptionController::class, 'destroy'])->name('lockups.destroy');
            });

        // Monthly yields
        Route::get('monthly-yields', [MonthlyYieldController::class, 'index'])->name('monthly-yields.index');
        Route::post('monthly-yields', [MonthlyYieldController::class, 'store'])->name('monthly-yields.store');
        Route::post('monthly-yields/apply', [MonthlyYieldController::class, 'apply'])->name('monthly-yields.apply');

        // region Employees
        Route::prefix('funcionarios')
            ->name('employees.')
            ->group(function () {
                Route::get('/', [Admin\EmployeeController::class, 'index'])->name('index');
                Route::get('create', [Admin\EmployeeController::class, 'create'])->name('create');
                Route::post('/', [Admin\EmployeeController::class, 'store'])->name('store');
                Route::get('{employee}/edit', [Admin\EmployeeController::class, 'edit'])->name('edit');
                Route::put('{employee}', [Admin\EmployeeController::class, 'update'])->name('update');
                Route::patch('{employee}/toggle', [Admin\EmployeeController::class, 'toggleActive'])->name('toggle-active');
                Route::delete('{employee}', [Admin\EmployeeController::class, 'destroy'])->name('destroy');
            });
        // endregion

        // region Customers
        Route::prefix('clientes')
            ->name('customers.')
            ->group(function () {
                Route::get('/', [Admin\CustomerController::class, 'index'])->name('index');
                Route::get('create', [Admin\CustomerController::class, 'create'])->name('create');
                Route::post('/', [Admin\CustomerController::class, 'store'])->name('store');
                Route::get('{customer}/edit', [Admin\CustomerController::class, 'edit'])->name('edit');
                Route::put('{customer}', [Admin\CustomerController::class, 'update'])->name('update');
                //                Route::patch('{customer}/toggle', [Admin\CustomerController::class, 'toggleActive'])->name('toggle-active');
                Route::delete('{customer}', [Admin\CustomerController::class, 'destroy'])->name('destroy');
            });
        // endregion

        // region Customer Plans
        Route::prefix('planos-cliente')
            ->name('customer-plans.')
            ->group(function () {
                Route::get('/', [Admin\CustomerPlanController::class, 'index'])->name('index');
                Route::get('create', [Admin\CustomerPlanController::class, 'create'])->name('create');
                Route::post('/', [Admin\CustomerPlanController::class, 'store'])->name('store');
                Route::post('{customerPlan}/activate', [Admin\CustomerPlanController::class, 'activate'])->name('activate');
                Route::delete('customer-plans/{customerPlan}', [Admin\CustomerPlanController::class, 'destroy'])->name('destroy');
            });
        // endregion

        // region Deposits
        Route::prefix('depositos')
            ->name('deposits.')
            ->group(function () {
                Route::get('/', [Admin\DepositController::class, 'index'])->name('index');
                Route::get('/create', [Admin\DepositController::class, 'create'])->name('create');
                Route::post('/', [Admin\DepositController::class, 'store'])->name('store');
                Route::post('{transaction}/approve', [Admin\DepositController::class, 'approve'])->name('approve');
                Route::post('{transaction}/reject', [Admin\DepositController::class, 'reject'])->name('reject');
                Route::delete('deposits/{transaction}', [Admin\DepositController::class, 'destroy'])->name('destroy'); // remove aporte (não aprovado)
            });
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
