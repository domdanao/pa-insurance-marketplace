<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Merchant\StoreStoreRequest;
use App\Http\Requests\Merchant\UpdateStoreRequest;
use App\Models\Category;
use App\Models\Store;
use Inertia\Inertia;

class StoreController extends Controller
{
    public function create()
    {
        $categories = Category::orderBy('name')->get();

        return Inertia::render('Merchant/Store/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreStoreRequest $request)
    {
        $user = $request->user();

        // Check if user has an approved merchant account
        if (! $user->hasApprovedMerchant()) {
            return redirect()->route('merchant.dashboard')
                ->with('error', 'You need an approved merchant account to create a store.');
        }

        if ($user->merchant->store) {
            return redirect()->route('merchant.dashboard')
                ->with('error', 'You already have a store.');
        }

        $store = Store::create([
            'user_id' => $user->id,
            'merchant_id' => $user->merchant->id,
            'name' => $request->name,
            'slug' => str($request->name)->slug(),
            'description' => $request->description,
            'category_id' => $request->category_id,
            'contact_email' => $request->contact_email,
            'contact_phone' => $request->contact_phone,
            'address' => $request->address,
            'status' => 'pending',
        ]);

        return redirect()->route('merchant.dashboard')
            ->with('success', 'Your store has been submitted for review.');
    }

    public function edit()
    {
        $user = auth()->user();

        // Check if user has an approved merchant account
        if (! $user->hasApprovedMerchant()) {
            return redirect()->route('merchant.dashboard')
                ->with('error', 'You need an approved merchant account to manage a store.');
        }

        $store = $user->merchant->store;

        if (! $store) {
            return redirect()->route('merchant.store.create');
        }

        $categories = Category::orderBy('name')->get();

        return Inertia::render('Merchant/Store/Edit', [
            'store' => $store,
            'categories' => $categories,
        ]);
    }

    public function update(UpdateStoreRequest $request)
    {
        $user = $request->user();

        // Check if user has an approved merchant account
        if (! $user->hasApprovedMerchant()) {
            return redirect()->route('merchant.dashboard')
                ->with('error', 'You need an approved merchant account to manage a store.');
        }

        $store = $user->merchant->store;

        if (! $store) {
            return redirect()->route('merchant.store.create');
        }

        $store->update([
            'name' => $request->name,
            'slug' => str($request->name)->slug(),
            'description' => $request->description,
            'category_id' => $request->category_id,
            'contact_email' => $request->contact_email,
            'contact_phone' => $request->contact_phone,
            'address' => $request->address,
        ]);

        return redirect()->route('merchant.dashboard')
            ->with('success', 'Store updated successfully.');
    }
}
