<?php

declare(strict_types = 1);

namespace App\Http\Controllers\Customer;

use App\Enums\Auth\Role as RoleEnum;
use App\Http\Controllers\Controller;
use App\Models\CustomerPlan;
use App\Models\MoneyTransaction;
use App\Models\User;
use App\Notifications\WithdrawalRequestedCustomerReceipt;
use App\Notifications\WithdrawRequestedNotification;
use App\Support\Balances;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;

class WithdrawalController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $userId = (int) auth()->id();

        $data = $request->validate([
            'customer_plan_id' => [
                'required',
                Rule::exists('customer_plans', 'id')->where(fn ($q) => $q->where('user_id', $userId)),
            ],
            'amount' => ['required', 'numeric', 'min:0.01'],
            // Dados para TED/PIX — MVP: todos opcionais, mas ao menos 1 método precisa estar presente
            'method'          => ['required', Rule::in(['pix', 'ted'])],
            'pix_key'         => [Rule::requiredIf(fn () => $request->input('method') === 'pix'), 'string', 'max:255'],
            'bank_name'       => [Rule::requiredIf(fn () => $request->input('method') === 'ted'), 'string', 'max:255'],
            'bank_code'       => [Rule::requiredIf(fn () => $request->input('method') === 'ted'), 'string', 'max:10'],
            'agency_number'   => [Rule::requiredIf(fn () => $request->input('method') === 'ted'), 'string', 'max:255'],
            'account_number'  => [Rule::requiredIf(fn () => $request->input('method') === 'ted'), 'string', 'max:255'],
            'holder_name'     => [Rule::requiredIf(fn () => $request->input('method') === 'ted'), 'string', 'max:255'],
            'holder_cpf_cnpj' => [Rule::requiredIf(fn () => $request->input('method') === 'ted'), 'string', 'max:20'],
        ]);

        // Regra simples: se method=pix, pix_key obrigatório; se bank, conta obrigatória
        if ($data['method'] === 'pix' && blank($data['pix_key'])) {
            return back()->withErrors(['pix_key' => 'Informe a chave PIX.'])->withInput();
        }

        if ($data['method'] === 'bank' && (blank($data['bank_name']) || blank($data['account_number']))) {
            return back()->withErrors(['bank_name' => 'Dados bancários incompletos.'])->withInput();
        }

        $cp = CustomerPlan::with('plan:id,name,lockup_days', 'customer:id,name,email')
            ->where('id', $data['customer_plan_id'])
            ->where('user_id', $userId)
            ->firstOrFail();

        // Reaproveita seus métodos já existentes no DepositController (pode extrair para um service/helper compartilhado)
        $available = Balances::availableForPlan($cp->id);
        $eligible  = app(DepositController::class)->isWithdrawEligible($cp, $available);

        if (! $eligible) {
            return back()->with('error', 'Este vínculo ainda não está elegível para saque.');
        }

        $amount = (float) $data['amount'];

        if ($amount > $available) {
            return back()->withErrors(['amount' => 'Valor superior ao saldo disponível.'])->withInput();
        }

        $meta = [
            'method'          => Arr::get($data, 'method'),
            'pix_key'         => Arr::get($data, 'pix_key'),
            'bank_name'       => Arr::get($data, 'bank_name'),
            'bank_code'       => Arr::get($data, 'bank_code'),
            'agency'          => Arr::get($data, 'agency_number'),
            'account'         => Arr::get($data, 'account_number'),
            'holder_name'     => Arr::get($data, 'holder_name'),
            'holder_cpf_cnpj' => Arr::get($data, 'holder_cpf_cnpj'),
        ];

        DB::transaction(function () use ($cp, $data, $userId, $meta) {
            MoneyTransaction::create([
                'customer_plan_id' => $cp->id,
                'type'             => MoneyTransaction::TYPE_WITHDRAWAL,
                'amount'           => (float) $data['amount'],
                'effective_date'   => now()->toDateString(), // será aprovado com esta data (ou ajustado pelo admin)
                'status'           => MoneyTransaction::STATUS_PENDING,
                'origin'           => 'customer_request',
                'created_by'       => $userId,
                'meta'             => $meta,
            ]);

            // Notifica equipe (config: MAIL_WITHDRAWALS_TO="ops@empresa.com,financeiro@empresa.com")
            $teamRecipients = User::query()
                ->whereRelation('roles', fn ($q) => $q->whereIn('name', [RoleEnum::Admin, RoleEnum::Employee]))
                ->where('is_active', true)
                ->get();

            if ($teamRecipients->isNotEmpty()) {
                Notification::send($teamRecipients, new WithdrawRequestedNotification($cp, (float) Arr::get($data, 'amount'), Arr::only($data, array_keys($meta))));
            }

            $cp->customer?->notify(new WithdrawalRequestedCustomerReceipt((float) Arr::get($data, 'amount')));
        });

        return back()->with('success', 'Solicitação de saque enviada. Aguarde a análise da equipe.');
    }
}
