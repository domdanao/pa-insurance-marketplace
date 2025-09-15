<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Session;

class CartTransferService
{
    /**
     * Transfer pending cart items from session to authenticated user's cart
     */
    public static function transferPendingCart(User $user): void
    {
        // Check for pending cart additions stored in session
        if (Session::has('pending_cart_items')) {
            $pendingItems = Session::get('pending_cart_items', []);

            \Illuminate\Support\Facades\Log::info('CartTransferService: Starting cart transfer', [
                'user_id' => $user->id,
                'pending_items_count' => count($pendingItems),
                'pending_items' => $pendingItems,
                'session_id' => session()->getId(),
            ]);

            foreach ($pendingItems as $item) {
                \Illuminate\Support\Facades\Log::info('CartTransferService: Processing item', [
                    'user_id' => $user->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                ]);
                self::addToUserCart($user, $item['product_id'], $item['quantity']);
            }

            // Clear the pending items from session
            Session::forget('pending_cart_items');

            \Illuminate\Support\Facades\Log::info('CartTransferService: Cart transfer completed', [
                'user_id' => $user->id,
                'final_cart_count' => $user->cartItems()->count(),
            ]);
        } else {
            \Illuminate\Support\Facades\Log::info('CartTransferService: No pending cart items found', [
                'user_id' => $user->id,
                'session_id' => session()->getId(),
                'session_data' => session()->all(),
            ]);
        }
    }

    /**
     * Add an item to session-based cart for anonymous users
     */
    public static function addToSessionCart(string $productId, int $quantity): void
    {
        $pendingItems = Session::get('pending_cart_items', []);

        // Check if product already exists in pending cart
        $existingIndex = null;
        foreach ($pendingItems as $index => $item) {
            if ($item['product_id'] === $productId) {
                $existingIndex = $index;
                break;
            }
        }

        if ($existingIndex !== null) {
            // Update existing item quantity
            $pendingItems[$existingIndex]['quantity'] += $quantity;
        } else {
            // Add new item
            $pendingItems[] = [
                'product_id' => $productId,
                'quantity' => $quantity,
                'added_at' => now()->toISOString(),
            ];
        }

        Session::put('pending_cart_items', $pendingItems);
    }

    /**
     * Add item to authenticated user's cart
     */
    private static function addToUserCart(User $user, string $productId, int $quantity): void
    {
        $product = Product::find($productId);

        if (! $product || ! $product->isPublished()) {
            return; // Skip invalid or unpublished products
        }

        // Cap quantity at available stock for physical products
        if (! $product->digital_product && $product->quantity < $quantity) {
            $quantity = $product->quantity; // Cap at available stock
        }

        $cartItem = Cart::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->first();

        if ($cartItem) {
            $newQuantity = $cartItem->quantity + $quantity;

            // Check stock again for existing items
            if (! $product->digital_product && $newQuantity > $product->quantity) {
                $newQuantity = $product->quantity; // Cap at available stock
            }

            $cartItem->update(['quantity' => $newQuantity]);
        } else {
            Cart::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
            ]);
        }
    }

    /**
     * Get count of pending cart items
     */
    public static function getPendingCartCount(): int
    {
        $pendingItems = Session::get('pending_cart_items', []);

        return array_sum(array_column($pendingItems, 'quantity'));
    }
}
