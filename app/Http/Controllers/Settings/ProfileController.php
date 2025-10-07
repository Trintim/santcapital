<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user       = $request->user()->load(['customerAdditionalInformation', 'employeeAdditionalInformation', 'roles']);
        $role       = $user->roles->first()?->name->value ?? 'admin';
        $additional = null;

        if ($role === 'customer') {
            $additional = $user->customerAdditionalInformation;
        } elseif ($role === 'employee') {
            $additional = $user->employeeAdditionalInformation;
        }

        return Inertia::render('settings/profile', [
            'user'       => $user->only(['id', 'name', 'email', 'phone', 'document', 'birthdate', 'pix_key']),
            'role'       => $role,
            'additional' => $additional,
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user()->load(['customerAdditionalInformation', 'employeeAdditionalInformation', 'roles']);
        $role = $user->roles->first()?->name ?? 'admin';
        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        // Atualiza informações adicionais conforme o tipo
        if ($role === 'customer' && $user->customerAdditionalInformation) {
            $user->customerAdditionalInformation->fill($request->only([
                'beneficiary_name',
                'beneficiary_document',
                'beneficiary_phone',
                'beneficiary_2_name',
                'beneficiary_2_document',
                'beneficiary_2_phone',
            ]));
            $user->customerAdditionalInformation->save();
        } elseif ($role === 'employee' && $user->employeeAdditionalInformation) {
            $user->employeeAdditionalInformation->fill($request->only([
                'bank_name',
                'bank_code',
                'agency_number',
                'account_number',
            ]));
            $user->employeeAdditionalInformation->save();
        }

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
