<?php

declare(strict_types = 1);

namespace App\Notifications;

use App\Models\MoneyTransaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WithdrawalRejectedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public MoneyTransaction $tx, public ?string $reason = null)
    {
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $valor = number_format($this->tx->amount, 2, ',', '.');

        $mail = (new MailMessage())
            ->subject('Seu saque foi rejeitado')
            ->line("Seu pedido de saque de R$ {$valor} foi rejeitado.");

        if ($this->reason) {
            $mail->line("Motivo: {$this->reason}");
        }

        return $mail->line('Qualquer dúvida, responda este e-mail.');
    }
}
