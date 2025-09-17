<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Admin;

use App\Enums\Auth\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Client\IndexRequest;
use App\Models\User;
use App\Resources\Admin\ClientResource;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(IndexRequest $request): Response
    {
        $sortBy    = $request->validated('sort-by', 'name');
        $direction = $request->validated('direction', 'asc');
        $search    = $request->validated('search');
        $perPage   = $request->validated('per-page', 15);

        $clients = ClientResource::collection(
            User::query()
                ->select(['id', 'name', 'email', 'phone', 'document', 'is_active'])
                ->role(Role::Customer) // @phpstan-ignore-line
                ->filters([
                    'name' => $search,
                ])
                ->orderBy(column: $sortBy, direction: $direction)
                ->paginate($perPage)
                ->onEachSide(1)
                ->withQueryString(),
        );

        return inertia('Admin/Clients/Index', [
            'pagination' => $clients,
            'filters'    => [
                'search'    => $search,
                'per-page'  => $perPage,
                'sort-by'   => $sortBy,
                'direction' => $direction,
            ],
        ]);
    }
}
