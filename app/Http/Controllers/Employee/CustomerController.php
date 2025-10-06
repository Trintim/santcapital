<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Employee;

use App\Enums\Auth\Role;
use App\Enums\Auth\Role as RoleEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Client\IndexRequest;
use App\Http\Requests\Admin\Client\StoreCustomerRequest;
use App\Http\Resources\Admin\ClientResource;
use App\Models\User;
use App\Notifications\WelcomeCustomerNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class CustomerController extends Controller
{
    public function index(IndexRequest $request): Response
    {
        $sortBy    = $request->validated('sort-by', 'id');
        $direction = $request->validated('direction', 'asc');
        $search    = $request->validated('search');
        $perPage   = $request->validated('per-page', 15);

        $customers = ClientResource::collection(
            User::query()
                ->select(['id', 'name', 'email', 'phone', 'document', 'is_active'])
                ->with('customerAdditionalInformation')
                ->role(Role::Customer)
                ->filters(['name' => $search])
                ->orderBy($sortBy, $direction)
                ->paginate($perPage)
                ->onEachSide(1)
                ->withQueryString()
        );

        return Inertia::render('Employee/Customer/Index', [
            'pagination' => $customers,
            'filters'    => [
                'search'    => $search,
                'per-page'  => $perPage,
                'sort-by'   => $sortBy,
                'direction' => $direction,
            ],
        ]);
    }

    public function show(User $customer): Response
    {
        // carrega dados úteis p/ a ficha
        $customer->load([
            'customerAdditionalInformation',
            'customerPlans.plan',
        ]);

        return Inertia::render('Employee/Customer/Show', [
            'customer' => ClientResource::make($customer),
        ]);
    }

    public function create()
    {
        return Inertia::render('Employee/Customer/Create');
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $password = Str::password(16);

        try {
            DB::transaction(static function () use ($validated, $password) {
                /** @var User $user */
                $user = User::create([
                    'name'      => Arr::get($validated, 'name'),
                    'email'     => Arr::get($validated, 'email'),
                    'phone'     => Arr::get($validated, 'phone'),
                    'document'  => Arr::get($validated, 'document'),
                    'birthdate' => Arr::get($validated, 'birthdate'),
                    'pix_key'   => Arr::get($validated, 'pix_key'),
                    'password'  => Hash::make($password),
                    'is_active' => Arr::get($validated, 'is_active', true),
                ]);

                $role = \App\Models\Role::query()
                    ->select(['id'])
                    ->where('name', RoleEnum::Customer) // @phpstan-ignore-line
                    ->firstOrFail();

                $user->roles()->syncWithoutDetaching([$role->id]);

                if (filled(Arr::get($validated, 'additional'))) {
                    $user->customerAdditionalInformation()->create(Arr::get($validated, 'additional'));
                }

                DB::afterCommit(static function () use ($user, $password) {
                    $user->notify(new WelcomeCustomerNotification(password: $password));
                });
            });

            return to_route('employee.customers.index')->with('success', 'Cliente criado com sucesso');
        } catch (Throwable $e) {
            return to_route('employee.customers.index')->with('error', 'Erro ao criar cliente: ' . $e->getMessage());
        }
    }

    public function toggleActive(User $customer): RedirectResponse
    {
        $customer->update(['is_active' => ! $customer->is_active]);

        return back()->with('success', $customer->is_active ? 'Cliente ativado.' : 'Cliente desativado.');
    }
}
