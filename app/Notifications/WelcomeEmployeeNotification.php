<?php

declare(strict_types = 1);

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeEmployeeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $password
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('Bem-vindo(a) à equipe ' . config('app.name') . '!')
            ->markdown('mail.welcome-employee', [
                'name'          => $notifiable->name,
                'email'         => $notifiable->email,
                'plainPassword' => $this->password,
                'loginUrl'      => config('app.url') . '/login',
            ]);
    }
}
