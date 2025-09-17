<?php

declare(strict_types = 1);

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user || ! $user->hasAnyRole($roles)) {
            abort(Response::HTTP_NOT_FOUND);
        }

        return $next($request);
    }
}
