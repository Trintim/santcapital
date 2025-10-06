<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Admin;

use App\Enums\Auth\Role as RoleEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Client\IndexRequest;
use App\Http\Requests\Admin\Client\StoreCustomerRequest;
use App\Http\Requests\Admin\Client\UpdateCustomerRequest;
use App\Http\Resources\Admin\CustomerResource;
use App\Models\CustomerPlan;
use App\Models\MoneyTransaction;
use App\Models\Role;
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
        $sortBy    = $request->validated('sort-by', 'name');
        $direction = $request->validated('direction', 'asc');
        $search    = $request->validated('search');
        $perPage   = $request->validated('per-page', 15);

        $clients = CustomerResource::collection(
            User::query()
                ->select(['id', 'name', 'email', 'phone', 'document', 'is_active'])
                ->with(['customerAdditionalInformation'])
                ->role(RoleEnum::Customer) // @phpstan-ignore-line
                ->filters([
                    'name' => $search,
                ])
                ->orderBy(column: $sortBy, direction: $direction)
                ->paginate($perPage)
                ->onEachSide(1)
                ->withQueryString(),
        );

        return inertia('Admin/Customer/Index', [
            'pagination' => $clients,
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
        return Inertia::render('Admin/Customer/Create');
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

                $role = Role::query()
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

            return to_route('admin.customers.index')->with('success', 'Cliente criado com sucesso');
        } catch (Throwable $e) {
            return to_route('admin.customers.index')->with('error', 'Erro ao criar cliente: ' . $e->getMessage());
        }
    }

    public function edit(User $customer)
    {
        return Inertia::render('Admin/Customer/Edit', [
            'customer' => CustomerResource::make($customer->load(['customerAdditionalInformation'])),
        ]);
    }

    public function update(UpdateCustomerRequest $request, User $customer): RedirectResponse
    {
        $validated = $request->validated();

        try {
            DB::transaction(static function () use ($validated, $customer) {
                $customer->update([
                    'name'      => Arr::get($validated, 'name'),
                    'email'     => Arr::get($validated, 'email'),
                    'phone'     => Arr::get($validated, 'phone'),
                    'document'  => Arr::get($validated, 'document'),
                    'birthdate' => Arr::get($validated, 'birthdate'),
                    'pix_key'   => Arr::get($validated, 'pix_key'),
                    'is_active' => Arr::get($validated, 'is_active', true),
                ]);

                if (filled(Arr::get($validated, 'password'))) {
                    $customer->update([
                        'password' => Hash::make(Arr::get($validated, 'password')),
                    ]);
                }

                if (filled(Arr::get($validated, 'additional'))) {
                    $customer->customerAdditionalInformation()->updateOrCreate([
                        'user_id' => $customer->id,
                    ], Arr::get($validated, 'additional'));
                }
            });

            return to_route('admin.customers.index')->with('success', 'Cliente atualizado com sucesso');
        } catch (Throwable $e) {
            return to_route('admin.customers.index')->with('error', 'Erro ao atualizar cliente: ' . $e->getMessage());
        }
    }

    public function destroy(User $customer): RedirectResponse
    {
        try {
            \DB::transaction(function () use ($customer) {
                // Bloqueia se houver transações aprovadas
                $hasApproved = MoneyTransaction::query()
                    ->whereHas('customerPlan', fn ($q) => $q->where('user_id', $customer->id))
                    ->where('status', MoneyTransaction::STATUS_APPROVED)
                    ->exists();

                if ($hasApproved) {
                    throw new \RuntimeException('Não é possível excluir: existem transações aprovadas para este cliente.');
                }

                // Remove transações pendentes/rejeitadas (se existirem)
                MoneyTransaction::query()
                    ->whereHas('customerPlan', fn ($q) => $q->where('user_id', $customer->id))
                    ->delete();

                // Remove vínculos de planos
                CustomerPlan::query()
                    ->where('user_id', $customer->id)
                    ->delete();

                // Infos adicionais (clientes)
                $customer->customerAdditionalInformation()?->delete();

                // Detach das roles para não violar o FK do pivot
                $customer->roles()->detach();

                // Por fim, o usuário
                $customer->delete();
            });

            return to_route('admin.customers.index')->with('success', 'Cliente excluído com sucesso.');
        } catch (\RuntimeException $e) {
            return back()->withErrors(['customer' => $e->getMessage()]);
        } catch (Throwable $e) {
            report($e);

            return back()->withErrors(['customer' => 'Erro ao excluir cliente.']);
        }
    }

    public function toggleActive(User $customer): RedirectResponse
    {
        $customer->update(['is_active' => ! $customer->is_active]);

        return back()->with(
            'success',
            $customer->is_active ? 'Cliente ativado.' : 'Cliente desativado.'
        );
    }
}
