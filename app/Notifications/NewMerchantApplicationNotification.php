<?php

namespace App\Notifications;

use App\Models\Merchant;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewMerchantApplicationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public User $user,
        public Merchant $merchant
    ) {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Merchant Application Submitted - PA Insurance Marketplace')
            ->greeting('Hello Admin,')
            ->line('A new merchant application has been submitted and requires your review.')
            ->line("**Business Name:** {$this->merchant->business_name}")
            ->line("**Applicant:** {$this->user->name}")
            ->line("**Email:** {$this->user->email}")
            ->line('**Business Type:** '.ucfirst(str_replace('_', ' ', $this->merchant->business_type)))
            ->line("**Application Date:** {$this->merchant->created_at->format('M j, Y g:i A')}")
            ->action('Review Application', url("/admin/merchants/{$this->merchant->id}"))
            ->line('Please review the application and approve or reject it as soon as possible.')
            ->line('Thank you for maintaining the quality of our marketplace!');
    }

    /**
     * Get the database representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'merchant_application',
            'merchant_id' => $this->merchant->id,
            'user_id' => $this->user->id,
            'business_name' => $this->merchant->business_name,
            'applicant_name' => $this->user->name,
            'applicant_email' => $this->user->email,
            'message' => "New merchant application from {$this->user->name} ({$this->merchant->business_name})",
            'action_url' => "/admin/merchants/{$this->merchant->id}",
        ];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return $this->toDatabase($notifiable);
    }
}
