<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $cartItems = Cart::where('user_id', $request->user()->id)
            ->with(['product.store', 'product.category'])
            ->get();

        $cartTotal = $cartItems->sum('total_price');
        $cartCount = $cartItems->sum('quantity');

        return Inertia::render('Cart/Index', [
            'cartItems' => $cartItems,
            'cartTotal' => $cartTotal,
            'cartCount' => $cartCount,
            'formattedTotal' => '₱'.number_format($cartTotal / 100, 2),
        ]);
    }

    public function add(Request $request, Product $product)
    {
        $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        if (! $product->isPublished()) {
            return back()->with('error', 'Product is no longer available.');
        }

        if (! $product->digital_product && $product->quantity < $request->quantity) {
            return back()->with('error', 'Not enough stock available.');
        }

        $cartItem = Cart::where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->first();

        if ($cartItem) {
            $newQuantity = $cartItem->quantity + $request->quantity;

            if (! $product->digital_product && $newQuantity > $product->quantity) {
                return back()->with('error', 'Not enough stock available.');
            }

            $cartItem->update(['quantity' => $newQuantity]);
        } else {
            Cart::create([
                'user_id' => $request->user()->id,
                'product_id' => $product->id,
                'quantity' => $request->quantity,
            ]);
        }

        return redirect()->back()->with('success', 'Product added to cart!');
    }

    public function update(Request $request, Cart $cart)
    {
        $this->authorize('update', $cart);

        $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        if (! $cart->product->digital_product && $request->quantity > $cart->product->quantity) {
            return back()->with('error', 'Not enough stock available.');
        }

        $cart->update(['quantity' => $request->quantity]);

        return back()->with('success', 'Cart updated!');
    }

    public function remove(Cart $cart)
    {
        $this->authorize('delete', $cart);

        $cart->delete();

        return back()->with('success', 'Item removed from cart!');
    }

    public function clear(Request $request)
    {
        Cart::where('user_id', $request->user()->id)->delete();

        return back()->with('success', 'Cart cleared!');
    }

    public function count(Request $request)
    {
        $count = Cart::where('user_id', $request->user()->id)->sum('quantity');

        return response()->json(['count' => $count]);
    }
}
