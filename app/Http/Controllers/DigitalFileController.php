<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DigitalFileController extends Controller
{
    /**
     * Download a digital file (only for purchased products)
     */
    public function download(Request $request, string $productId, string $filename)
    {
        $user = $request->user();

        if (! $user) {
            abort(401, 'Authentication required');
        }

        // Find the product
        $product = Product::findOrFail($productId);

        // Check if user has purchased this product
        $hasPurchased = OrderItem::whereHas('order', function ($query) use ($user) {
            $query->where('user_id', $user->id)
                ->where('status', 'completed');
        })
            ->where('product_id', $product->id)
            ->exists();

        // Allow merchants to download their own product files
        $isOwner = $user->isMerchant() &&
                   $user->store &&
                   $user->store->id === $product->store_id;

        if (! $hasPurchased && ! $isOwner) {
            abort(403, 'You must purchase this product to download its files');
        }

        // Find the file in the product's digital_files array
        $digitalFiles = $product->digital_files ?? [];
        $file = collect($digitalFiles)->firstWhere('filename', $filename);

        if (! $file) {
            abort(404, 'File not found');
        }

        $filePath = $file['path'];

        if (! Storage::disk('local')->exists($filePath)) {
            abort(404, 'File not found on storage');
        }

        // Return a streamed download response
        return Storage::disk('local')->download($filePath, $file['original_name']);
    }

    /**
     * Preview a digital file (for merchants only)
     */
    public function preview(Request $request, string $productId, string $filename)
    {
        $user = $request->user();

        if (! $user || ! $user->isMerchant()) {
            abort(403, 'Only merchants can preview files');
        }

        $product = Product::findOrFail($productId);

        // Check if user owns this product
        if (! $user->store || $user->store->id !== $product->store_id) {
            abort(403, 'You can only preview your own product files');
        }

        // Find the file
        $digitalFiles = $product->digital_files ?? [];
        $file = collect($digitalFiles)->firstWhere('filename', $filename);

        if (! $file || ! Storage::disk('local')->exists($file['path'])) {
            abort(404, 'File not found');
        }

        // For preview, we'll just return file info as JSON
        return response()->json([
            'filename' => $file['filename'],
            'original_name' => $file['original_name'],
            'size' => $file['size'],
            'mime_type' => $file['mime_type'],
            'download_url' => route('digital-files.download', [
                'productId' => $productId,
                'filename' => $filename,
            ]),
        ]);
    }
}
