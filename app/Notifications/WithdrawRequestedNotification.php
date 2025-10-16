<?php

declare(strict_types = 1);

namespace App\Notifications;

use App\Models\CustomerPlan;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WithdrawRequestedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public CustomerPlan $customerPlan,
        public float $amount,
        public array $bankData, // pix/account info (sanitized)
    ) {
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $c    = $this->customerPlan->customer; // se tiver relação 'customer' -> User
        $plan = $this->customerPlan->plan;

        return (new MailMessage())
            ->subject('Nova solicitação de saque')
            ->greeting('Olá, equipe!')
            ->line("Cliente: {$c?->name} ({$c?->email})")
            ->line("Plano: {$plan?->name} / CP #{$this->customerPlan->id}")
            ->line('Valor solicitado: R$ ' . number_format($this->amount, 2, ',', '.'))
            ->line('Dados para pagamento:')
            ->line(json_encode($this->bankData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT))
            ->action('Abrir depósitos/saques', url()->route('admin.deposits.index')) // ajuste se tiver filtro
            ->line('Aguardando aprovação/reprovação no painel.');
    }
}
