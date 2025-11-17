<?php

declare(strict_types = 1);

namespace App\Mail;

use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomerYieldPdf extends Mailable implements ShouldQueue
{
    use Queueable;
    use SerializesModels;

    protected User $user;

    protected array $data;

    protected string $filename;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, array $data, string $filename)
    {
        $this->user     = $user;
        $this->data     = $data;
        $this->filename = $filename;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Seu relatório de rendimentos mensais',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'mail.customer.yield_pdf',
            with: [
                'user' => $this->user,
                'data' => $this->data,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromData(
                fn () => Pdf::loadView('pdf.customer_yields', $this->data)->output(),
                $this->filename
            )
                ->withMime('application/pdf'),
        ];
    }
}
