<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\DraftPolicyApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DraftPolicyApplicationController extends Controller
{
    public function save(Request $request)
    {
        $request->validate([
            'current_step' => 'required|integer|min:1|max:6',
            'form_data' => 'required|array',
        ]);

        $user = Auth::user();

        // Get current cart items
        $cartItems = Cart::where('user_id', $user->id)
            ->with(['product'])
            ->get()
            ->toArray();

        // Find existing draft or create new one
        $draft = DraftPolicyApplication::forUser($user)
            ->incomplete()
            ->recent()
            ->first();

        if (! $draft) {
            $draft = DraftPolicyApplication::create([
                'user_id' => $user->id,
                'email' => $user->email,
                'current_step' => $request->current_step,
                'form_data' => $request->form_data,
                'cart_data' => $cartItems,
                'last_accessed_at' => now(),
            ]);
        } else {
            $draft->update([
                'current_step' => $request->current_step,
                'form_data' => $request->form_data,
                'cart_data' => $cartItems,
                'last_accessed_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'draft_id' => $draft->id,
            'message' => 'Application draft saved successfully',
        ]);
    }

    public function load()
    {
        $user = Auth::user();

        $draft = DraftPolicyApplication::forUser($user)
            ->incomplete()
            ->recent()
            ->first();

        if (! $draft || $draft->isExpired()) {
            return response()->json([
                'success' => false,
                'message' => 'No recent draft found',
            ]);
        }

        $draft->updateLastAccessed();

        return response()->json([
            'success' => true,
            'draft' => [
                'id' => $draft->id,
                'current_step' => $draft->current_step,
                'form_data' => $draft->form_data,
                'cart_data' => $draft->cart_data,
                'last_accessed_at' => $draft->last_accessed_at->toISOString(),
            ],
        ]);
    }

    public function delete()
    {
        $user = Auth::user();

        $draft = DraftPolicyApplication::forUser($user)
            ->incomplete()
            ->recent()
            ->first();

        if ($draft) {
            $draft->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Draft deleted successfully',
        ]);
    }

    public function checkForResume()
    {
        $user = Auth::user();

        $draft = DraftPolicyApplication::forUser($user)
            ->incomplete()
            ->recent()
            ->first();

        if (! $draft || $draft->isExpired()) {
            return response()->json([
                'has_draft' => false,
            ]);
        }

        return response()->json([
            'has_draft' => true,
            'draft_info' => [
                'current_step' => $draft->current_step,
                'last_accessed_at' => $draft->last_accessed_at->format('M j, Y g:i A'),
                'form_progress' => $this->calculateProgress($draft->current_step),
            ],
        ]);
    }

    private function calculateProgress(int $currentStep): string
    {
        $totalSteps = 6;
        $completedSteps = max(1, $currentStep - 1); // Previous steps are considered complete
        $percentage = round(($completedSteps / $totalSteps) * 100);

        return "{$percentage}% complete";
    }
}
