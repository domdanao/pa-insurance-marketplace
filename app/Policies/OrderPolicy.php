<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Order $order): bool
    {
        // Allow buyers to view their own orders
        if ($user->id === $order->user_id) {
            return true;
        }

        // Allow merchants to view orders containing their products
        if ($user->isMerchant() && $user->store) {
            return $order->orderItems()->where('store_id', $user->store->id)->exists();
        }

        // Allow admins to view all orders
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Order $order): bool
    {
        // Only buyers can update their own orders (e.g., cancel)
        if ($user->id === $order->user_id) {
            return true;
        }

        // Merchants can update orders containing their products
        if ($user->isMerchant() && $user->store) {
            return $order->orderItems()->where('store_id', $user->store->id)->exists();
        }

        // Admins can update all orders
        return $user->isAdmin();
    }

    public function delete(User $user, Order $order): bool
    {
        // Allow buyers to delete their own pending orders
        if ($user->id === $order->user_id && $order->status === 'pending') {
            return true;
        }

        // Admins can delete any order
        return $user->isAdmin();
    }

    public function restore(User $user, Order $order): bool
    {
        return $user->isAdmin();
    }

    public function forceDelete(User $user, Order $order): bool
    {
        return $user->isAdmin();
    }
}
