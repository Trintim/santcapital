<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Admin; // duplique para Employee mudando o namespace

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\WithdrawalResource;
use App\Models\MoneyTransaction;
use App\Support\Balances; // o helper que centraliza o saldo disponível
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WithdrawalController extends Controller
{
    public function index(Request $request): Response
    {
        $status  = $request->string('status', 'pending'); // pending|approved|rejected
        $perPage = max(10, (int) $request->integer('per_page', 15));

        $query = MoneyTransaction::query()
            ->with(['customerPlan.plan', 'customerPlan.customer'])
            ->where('type', MoneyTransaction::TYPE_WITHDRAWAL)
            ->when($status, fn ($q) => $q->where('status', $status))
            ->orderByDesc('effective_date')
            ->orderByDesc('id');

        return Inertia::render('Admin/Withdrawals/Index', [
            'filters' => [
                'status'   => $status,
                'per_page' => $perPage,
            ],
            'withdrawals' => WithdrawalResource::collection(
                $query->paginate($perPage)->withQueryString()
            ),
        ]);
    }

    public function approve(Request $request, MoneyTransaction $transaction): RedirectResponse
    {
        // Somente se ainda pendente
        if ($transaction->status !== MoneyTransaction::STATUS_PENDING || $transaction->type !== MoneyTransaction::TYPE_WITHDRAWAL) {
            return back()->with('error', 'Esta solicitação não está pendente.');
        }

        return DB::transaction(function () use ($transaction) {
            // Revalida saldo disponível no ato da aprovação
            $cpId      = $transaction->customer_plan_id;
            $available = Balances::availableForPlan($cpId);

            if ($transaction->amount > $available) {
                return back()->with('error', 'Saldo insuficiente no momento da aprovação.');
            }

            $transaction->update([
                'status'         => MoneyTransaction::STATUS_APPROVED,
                'approved_by'    => auth()->id(),
                'effective_date' => now()->toDateString(), // ou mantenha a data original se preferir
            ]);

            // Notificar cliente
            optional($transaction->customerPlan?->customer)->notify(
                new \App\Notifications\WithdrawalApprovedNotification($transaction)
            );

            return back()->with('success', 'Saque aprovado.');
        });
    }

    public function reject(Request $request, MoneyTransaction $transaction): RedirectResponse
    {
        if ($transaction->status !== MoneyTransaction::STATUS_PENDING || $transaction->type !== MoneyTransaction::TYPE_WITHDRAWAL) {
            return back()->with('error', 'Esta solicitação não está pendente.');
        }

        $reason = $request->string('reason')->toString(); // opcional

        $transaction->update([
            'status'      => MoneyTransaction::STATUS_REJECTED,
            'approved_by' => auth()->id(), // ou um campo 'handled_by'
            'meta'        => array_merge((array) $transaction->meta, ['reject_reason' => $reason]),
        ]);

        // Notificar cliente
        optional($transaction->customerPlan?->customer)->notify(
            new \App\Notifications\WithdrawalRejectedNotification($transaction, $reason)
        );

        return back()->with('success', 'Saque rejeitado.');
    }
}
