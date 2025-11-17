<?php

declare(strict_types = 1);

namespace App\Notifications;

use App\Models\MoneyTransaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WithdrawalApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public MoneyTransaction $tx)
    {
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $valor = number_format((float) $this->tx->amount, 2, ',', '.');

        return (new MailMessage())
            ->subject('Seu saque foi aprovado')
            ->line("Olá, seu saque de R$ {$valor} foi aprovado.")
            ->line('Em breve o valor será enviado conforme dados informados na solicitação.');
    }
}
