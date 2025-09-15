<?php

namespace App\Listeners;

use App\Events\MerchantApplicationSubmitted;
use App\Models\User;
use App\Notifications\NewMerchantApplicationNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Notification;

class NotifyAdminsOfMerchantApplication implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(MerchantApplicationSubmitted $event): void
    {
        // Get all admin users
        $admins = User::where('role', 'admin')->get();

        // Send notification to all admins
        Notification::send($admins, new NewMerchantApplicationNotification($event->user, $event->merchant));
    }
}
