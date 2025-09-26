<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Admin;

use App\Enums\Auth\Role as RoleEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Employee\IndexRequest;
use App\Http\Requests\Admin\Employee\StoreEmployeeRequest;
use App\Http\Requests\Admin\Employee\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\Role;
use App\Models\User;
use App\Notifications\WelcomeEmployeeNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(IndexRequest $request): Response
    {
        $sortBy    = $request->validated('sort-by', 'name');
        $direction = $request->validated('direction', 'asc');
        $search    = $request->validated('search');
        $perPage   = $request->validated('per-page', 15);

        $employees = EmployeeResource::collection(
            User::query()
                ->select(['id', 'name', 'email', 'phone', 'document', 'is_active'])
                ->with(['employeeAdditionalInformation'])
                ->role(RoleEnum::Employee) // @phpstan-ignore-line
                ->filters([
                    'name' => $search,
                ])
                ->orderBy(column: $sortBy, direction: $direction)
                ->paginate($perPage)
                ->onEachSide(1)
                ->withQueryString(),
        );

        return Inertia::render('Admin/Employee/Index', [
            'pagination' => $employees,
            'filters'    => [
                'search'    => $search,
                'per-page'  => $perPage,
                'sort-by'   => $sortBy,
                'direction' => $direction,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Employee/Create');
    }

    public function store(StoreEmployeeRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $password = Str::password(16);

        try {
            DB::transaction(static function () use ($validated, $password) {
                $user = User::query()->create([
                    'name'      => Arr::get($validated, 'name'),
                    'email'     => Arr::get($validated, 'email'),
                    'phone'     => Arr::get($validated, 'phone'),
                    'document'  => Arr::get($validated, 'document'),
                    'birthdate' => Arr::get($validated, 'birthdate'),
                    'pix_key'   => Arr::get($validated, 'pix_key'),
                    'password'  => Hash::make($password),
                    'is_active' => Arr::get($validated, 'is_active', true),
                ]);

                $role = Role::query()
                    ->select(['id'])
                    ->where('name', RoleEnum::Employee)
                    ->firstOrFail();

                $user->roles()->syncWithoutDetaching([$role->id]);

                if (filled(Arr::get($validated, 'additional'))) {
                    $user->employeeAdditionalInformation()->create(Arr::get($validated, 'additional'));
                }

                DB::afterCommit(static function () use ($user, $password) {
                    $user->notify(new WelcomeEmployeeNotification(password: $password));
                });
            });

            return to_route('admin.employees.index')->with('success', 'Funcionario criado com sucesso.');
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'Erro ao criar funcionario.');
        }
    }

    public function edit(User $employee)
    {
        return Inertia::render('Admin/Employee/Edit', [
            'employee' => EmployeeResource::make($employee->load('employeeAdditionalInformation')),
        ]);
    }

    public function update(UpdateEmployeeRequest $request, User $employee): RedirectResponse
    {
        $validated = $request->validated();

        try {
            DB::transaction(static function () use ($employee, $validated) {
                $employee->update([
                    'name'      => Arr::get($validated, 'name'),
                    'email'     => Arr::get($validated, 'email'),
                    'phone'     => Arr::get($validated, 'phone'),
                    'document'  => Arr::get($validated, 'document'),
                    'birthdate' => Arr::get($validated, 'birthdate'),
                    'pix_key'   => Arr::get($validated, 'pix_key'),
                    'is_active' => Arr::get($validated, 'is_active', true),
                ]);

                if (filled(Arr::get($validated, 'password'))) {
                    $employee->update([
                        'password' => Hash::make(Arr::get($validated, 'password')),
                    ]);
                }

                if (filled(Arr::get($validated, 'additional'))) {
                    if ($employee->employeeAdditionalInformation) {
                        $employee->employeeAdditionalInformation->update(Arr::get($validated, 'additional'));
                    } else {
                        $employee->employeeAdditionalInformation()->create(Arr::get($validated, 'additional'));
                    }
                }
            });

            return to_route('admin.employees.index')->with('success', 'Funcionario atualizado com sucesso.');
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'Erro ao atualizar funcionario.');
        }
    }

    public function toggleActive(User $employee)
    {
        $employee->update(['is_active' => ! $employee->is_active]);

        return back()->with('success', $employee->is_active ? 'Funcionario ativado.' : 'Funcionario desativado.');

    }

    public function destroy(User $employee): RedirectResponse
    {
        // Desanexa papeis para não violar FK em role_user
        $employee->roles()->detach();

        // Se existir relação extra de employee (ex.: additional info):
        $employee->employeeAdditionalInformation()?->delete();

        $employee->delete();

        return to_route('admin.employees.index')->with('success', 'Funcionario excluido.');
    }
}
