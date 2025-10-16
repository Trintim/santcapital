<?php

declare(strict_types = 1);

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WithdrawalRequestedCustomerReceipt extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public float $amount)
    {
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('Solicitação de saque recebida')
            ->greeting("Olá, {$notifiable->name}!")
            ->line('Recebemos sua solicitação de saque.')
            ->line('Valor: R$ ' . number_format($this->amount, 2, ',', '.'))
            ->line('A equipe irá analisar e você será notificado após a decisão.')
            ->line(config('app.name'));
    }
}
