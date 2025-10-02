<?php

declare(strict_types = 1);

use App\Http\Controllers\Admin;
use App\Http\Controllers\Admin\InvestmentPlanController;
use App\Http\Controllers\Admin\InvestmentPlanLockupOptionController;
use App\Http\Controllers\Admin\MonthlyYieldController;
use App\Http\Controllers\Employee;
use App\Http\Controllers\Employee\CustomerController;
use App\Http\Controllers\Employee\CustomerPlanController;
use App\Http\Controllers\Employee\DashboardController;
use Illuminate\Support\Facades\Route;

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
        Route::prefix('rendimentos-mensais')
            ->name('monthly-yields.')
            ->group(function () {
                Route::get('/', [MonthlyYieldController::class, 'index'])->name('index');
                Route::post('/', [MonthlyYieldController::class, 'store'])->name('store');
                Route::post('apply', [MonthlyYieldController::class, 'apply'])->name('apply');
                Route::delete('{monthlyYield}', [MonthlyYieldController::class, 'destroy'])
                    ->name('destroy');
            });

        // region Employees
        Route::prefix('funcionarios')
            ->name('employees.')
            ->group(function () {
                Route::get('/', [Admin\EmployeeController::class, 'index'])->name('index');
                Route::get('create', [Admin\EmployeeController::class, 'create'])->name('create');
                Route::post('/', [Admin\EmployeeController::class, 'store'])->name('store');
                Route::get('{employee}/edit', [Admin\EmployeeController::class, 'edit'])->name('edit');
                Route::put('{employee}', [Admin\EmployeeController::class, 'update'])->name('update');
                Route::post('{employee}/toggle', [Admin\EmployeeController::class, 'toggleActive'])->name('toggle-active');
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
                Route::patch('{customer}/toggle', [Admin\CustomerController::class, 'toggleActive'])
                    ->name('toggle-active');
                Route::delete('{customer}', [Admin\CustomerController::class, 'destroy'])->name('destroy');
            });
        // endregion

        // region Customer Plans
        Route::prefix('planos-cliente')->name('customer-plans.')->group(function () {
            Route::get('/', [Admin\CustomerPlanController::class, 'index'])->name('index');
            Route::get('create', [Admin\CustomerPlanController::class, 'create'])->name('create');
            Route::post('/', [Admin\CustomerPlanController::class, 'store'])->name('store');
            Route::post('{customerPlan}/activate', [Admin\CustomerPlanController::class, 'activate'])->name('activate'); // PATCH
            Route::delete('{customerPlan}', [Admin\CustomerPlanController::class, 'destroy'])->name('destroy'); // caminho corrigido
        });
        // endregion

        // region Deposits
        Route::prefix('depositos')->name('deposits.')->group(function () {
            Route::get('/', [Admin\DepositController::class, 'index'])->name('index');
            Route::get('create', [Admin\DepositController::class, 'create'])->name('create');
            Route::post('/', [Admin\DepositController::class, 'store'])->name('store');
            Route::post('{transaction}/approve', [Admin\DepositController::class, 'approve'])->name('approve'); // PATCH
            Route::post('{transaction}/reject', [Admin\DepositController::class, 'reject'])->name('reject');   // PATCH
            Route::delete('{transaction}', [Admin\DepositController::class, 'destroy'])->name('destroy'); // caminho corrigido
        });

        Route::prefix('saques')->name('withdrawals.')->group(function () {
            Route::get('/', [Admin\WithdrawalController::class, 'index'])->name('index');
            Route::post('{transaction}/approve', [Admin\WithdrawalController::class, 'approve'])->name('approve');
            Route::post('{transaction}/reject',  [Admin\WithdrawalController::class, 'reject'])->name('reject');
        });
    });

Route::middleware(['auth', 'role:employee'])
    ->prefix('funcionarios')
    ->name('employee.')
    ->group(function () {
        // mesmo dashboard do admin
        Route::get('dashboard', DashboardController::class)->name('dashboard');

        //  Clientes (sem excluir/editar/criar)
        Route::prefix('clientes')->name('customers.')->group(function () {
            Route::get('/', [CustomerController::class, 'index'])->name('index');
            Route::get('create', [CustomerController::class, 'create'])->name('create');
            Route::post('/', [CustomerController::class, 'store'])->name('store');
            Route::get('{customer}', [CustomerController::class, 'show'])->name('show');
            Route::post('{customer}/toggle', [CustomerController::class, 'toggleActive'])->name('toggle-active');
        });

        // Planos de Cliente (sem destroy)
        Route::prefix('planos-cliente')->name('customer-plans.')->group(function () {
            Route::get('/', [CustomerPlanController::class, 'index'])->name('index');
            Route::get('create', [CustomerPlanController::class, 'create'])->name('create');
            Route::post('/', [CustomerPlanController::class, 'store'])->name('store');
            Route::post('{customerPlan}/activate', [CustomerPlanController::class, 'activate'])->name('activate');
        });

        Route::prefix('depositos')->name('deposits.')->group(function () {
            Route::get('/', [Employee\DepositController::class, 'index'])->name('index');
            Route::get('create', [Employee\DepositController::class, 'create'])->name('create');
            Route::post('/', [Employee\DepositController::class, 'store'])->name('store');
            Route::post('{transaction}/approve', [Employee\DepositController::class, 'approve'])->name('approve'); // PATCH
            Route::post('{transaction}/reject', [Employee\DepositController::class, 'reject'])->name('reject');
        });

        Route::prefix('saques')->name('withdrawals.')->group(function () {
            Route::get('/', [Employee\WithdrawalController::class, 'index'])->name('index');
            Route::post('{transaction}/approve', [Employee\WithdrawalController::class, 'approve'])->name('approve');
            Route::post('{transaction}/reject',  [Employee\WithdrawalController::class, 'reject'])->name('reject');
        });
    });

Route::middleware(['auth', 'role:customer'])
    ->prefix('cliente') // melhor PT-BR e consistente com admin/employee
    ->name('customer.')
    ->group(function () {
        Route::get('dashboard', [App\Http\Controllers\Customer\DashboardController::class, '__invoke'])
            ->name('dashboard');

        // Aportes / Extrato
        Route::get('aportes', [App\Http\Controllers\Customer\DepositController::class, 'index'])
            ->name('deposits.index');

        // Solicitação de saque (cria transação PENDING TYPE_WITHDRAWAL)
        Route::post('saques', [App\Http\Controllers\Customer\WithdrawalController::class, 'store'])
            ->name('withdrawals.store');
    });

require __DIR__ . '/settings.php';

require __DIR__ . '/auth.php';
