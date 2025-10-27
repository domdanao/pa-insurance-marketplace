<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Merchant\StoreProductRequest;
use App\Http\Requests\Merchant\UpdateProductRequest;
use App\Http\Requests\Merchant\UploadDigitalFilesRequest;
use App\Http\Requests\Merchant\UploadProductImagesRequest;
use App\Models\Category;
use App\Models\Product;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProductController extends Controller
{
    use \Illuminate\Foundation\Auth\Access\AuthorizesRequests;

    public function index(Request $request)
    {
        $user = $request->user();

        if (! $user->hasApprovedMerchant()) {
            return redirect()->route('merchant.dashboard')
                ->with('error', 'You need an approved merchant account to manage products.');
        }

        $store = $user->merchant->store;

        if (! $store) {
            return redirect()->route('merchant.store.create');
        }

        $products = Product::where('store_id', $store->id)
            ->with(['category'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->category, function ($query, $category) {
                $query->whereHas('category', function ($q) use ($category) {
                    $q->where('slug', $category);
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate(12)
            ->withQueryString();

        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Merchant/Products/Index', [
            'products' => $products,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'category' => $request->category,
            ],
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        $user = request()->user();
        $store = $user->store;

        if (! $store || ! $store->isApproved()) {
            return redirect()->route('merchant.dashboard')
                ->with('error', 'Your store must be approved before you can add products.');
        }

        $categories = Category::orderBy('name')->get();

        return Inertia::render('Merchant/Products/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        $store = $request->user()->store;

        if (! $store || ! $store->isApproved()) {
            return redirect()->route('merchant.dashboard')
                ->with('error', 'Your store must be approved before you can add products.');
        }

        $product = Product::create([
            'store_id' => $store->id,
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => str($request->name)->slug(),
            'description' => $request->description,
            'price' => $request->price,
            'quantity' => $request->boolean('digital_product', false) ? 0 : $request->quantity,
            'digital_product' => $request->boolean('digital_product', false),
            'download_url' => $request->boolean('digital_product', false) ? $request->download_url : null,
            'images' => $request->input('images', []),
            'status' => 'draft',
        ]);

        return redirect()->route('merchant.products.show', $product)
            ->with('success', 'Product created successfully.');
    }

    public function show(Product $product)
    {
        $this->authorize('view', $product);

        return Inertia::render('Merchant/Products/Show', [
            'product' => $product->load(['category', 'store']),
        ]);
    }

    public function edit(Product $product)
    {
        $this->authorize('update', $product);

        $categories = Category::orderBy('name')->get();

        return Inertia::render('Merchant/Products/Edit', [
            'product' => $product->load('category'),
            'categories' => $categories,
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $this->authorize('update', $product);
        
        // Debug logging
        Log::info('Product update request received', [
            'product_id' => $product->id,
            'request_data' => $request->all(),
            'validation_rules' => $request->rules(),
        ]);

        $product->update([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => str($request->name)->slug(),
            'description' => $request->description,
            'price' => $request->price,
            'quantity' => $request->boolean('digital_product', false) ? 0 : $request->quantity,
            'digital_product' => $request->boolean('digital_product', false),
            'download_url' => $request->boolean('digital_product', false) ? $request->download_url : null,
            'images' => $request->input('images', $product->images ?? []),
        ]);

        return redirect()->route('merchant.products.show', $product)
            ->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);

        $product->delete();

        return redirect()->route('merchant.products.index')
            ->with('success', 'Product deleted successfully.');
    }

    public function publish(Product $product)
    {
        $this->authorize('update', $product);

        $product->update(['status' => 'published']);

        return back()->with('success', 'Product published successfully.');
    }

    public function unpublish(Product $product)
    {
        $this->authorize('update', $product);

        $product->update(['status' => 'draft']);

        return back()->with('success', 'Product unpublished successfully.');
    }

    public function uploadImages(UploadProductImagesRequest $request, FileUploadService $fileUploadService)
    {
        $user = $request->user();
        $store = $user->store;

        // Additional validation
        if (!$store) {
            Log::warning('Image upload attempted without store', ['user_id' => $user->id]);
            return response()->json([
                'success' => false,
                'message' => 'Store not found. Please create a store first.',
            ], 400);
        }

        if (!$store->isApproved()) {
            Log::warning('Image upload attempted with unapproved store', [
                'user_id' => $user->id,
                'store_id' => $store->id,
                'store_status' => $store->status
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Your store must be approved before you can upload images.',
            ], 403);
        }

        $images = $request->file('images');
        if (!$images || !is_array($images)) {
            Log::warning('No images provided in upload request', ['user_id' => $user->id]);
            return response()->json([
                'success' => false,
                'message' => 'No images provided.',
            ], 400);
        }

        Log::info('Image upload started', [
            'user_id' => $user->id,
            'store_id' => $store->id,
            'image_count' => count($images)
        ]);

        try {
            $uploadedImages = $fileUploadService->uploadProductImages($images, $store->id);

            // Prepare enhanced response with storage metadata
            $imageData = [];
            foreach ($uploadedImages as $imageUrl) {
                $imageData[] = [
                    'url' => $imageUrl,
                    'storage_type' => $fileUploadService->isUsingBucketStorage() ? 'bucket' : 'local',
                    'uploaded_at' => now()->toISOString(),
                ];
            }

            Log::info('Images uploaded successfully to bucket storage', [
                'user_id' => $user->id,
                'store_id' => $store->id,
                'uploaded_count' => count($uploadedImages),
                'storage_type' => $fileUploadService->isUsingBucketStorage() ? 'bucket' : 'local',
                'images' => $imageData
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Images uploaded successfully to ' . ($fileUploadService->isUsingBucketStorage() ? 'Laravel Cloud bucket' : 'local storage') . '.',
                'images' => $uploadedImages,
                'metadata' => [
                    'storage_type' => $fileUploadService->isUsingBucketStorage() ? 'bucket' : 'local',
                    'count' => count($uploadedImages),
                    'uploaded_at' => now()->toISOString(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Image upload failed', [
                'user_id' => $user->id,
                'store_id' => $store->id,
                'storage_type' => $fileUploadService->isUsingBucketStorage() ? 'bucket' : 'local',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to upload images to ' . ($fileUploadService->isUsingBucketStorage() ? 'Laravel Cloud bucket' : 'local storage') . ': ' . $e->getMessage(),
            ], 500);
        }
    }

    public function uploadDigitalFiles(UploadDigitalFilesRequest $request, FileUploadService $fileUploadService)
    {
        $user = $request->user();
        $store = $user->store;

        // Additional validation
        if (!$store) {
            Log::warning('Digital file upload attempted without store', ['user_id' => $user->id]);
            return response()->json([
                'success' => false,
                'message' => 'Store not found. Please create a store first.',
            ], 400);
        }

        if (!$store->isApproved()) {
            Log::warning('Digital file upload attempted with unapproved store', [
                'user_id' => $user->id,
                'store_id' => $store->id,
                'store_status' => $store->status
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Your store must be approved before you can upload digital files.',
            ], 403);
        }

        $files = $request->file('files');
        if (!$files || !is_array($files)) {
            Log::warning('No digital files provided in upload request', ['user_id' => $user->id]);
            return response()->json([
                'success' => false,
                'message' => 'No digital files provided.',
            ], 400);
        }

        Log::info('Digital file upload started', [
            'user_id' => $user->id,
            'store_id' => $store->id,
            'file_count' => count($files),
            'storage_type' => $fileUploadService->isUsingBucketStorage() ? 'bucket' : 'local'
        ]);

        try {
            $uploadedFiles = $fileUploadService->uploadDigitalFiles($files, $store->id);

            Log::info('Digital files uploaded successfully to bucket storage', [
                'user_id' => $user->id,
                'store_id' => $store->id,
                'uploaded_count' => count($uploadedFiles),
                'storage_type' => $fileUploadService->isUsingBucketStorage() ? 'bucket' : 'local',
                'files' => array_map(function($file) {
                    return [
                        'filename' => $file['filename'] ?? 'unknown',
                        'size' => $file['size'] ?? 0,
                        'storage_type' => $file['storage_type'] ?? 'unknown'
                    ];
                }, $uploadedFiles)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Digital files uploaded successfully to ' . ($fileUploadService->isUsingBucketStorage() ? 'Laravel Cloud bucket' : 'local storage') . '.',
                'files' => $uploadedFiles,
                'metadata' => [
                    'storage_type' => $fileUploadService->isUsingBucketStorage() ? 'bucket' : 'local',
                    'count' => count($uploadedFiles),
                    'uploaded_at' => now()->toISOString(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Digital file upload failed', [
                'user_id' => $user->id,
                'store_id' => $store->id,
                'storage_type' => $fileUploadService->isUsingBucketStorage() ? 'bucket' : 'local',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to upload digital files to ' . ($fileUploadService->isUsingBucketStorage() ? 'Laravel Cloud bucket' : 'local storage') . ': ' . $e->getMessage(),
            ], 500);
        }
    }

    public function deleteImage(Request $request, FileUploadService $fileUploadService)
    {
        $request->validate([
            'image_url' => 'required|string',
            'product_id' => 'required|exists:products,id',
        ]);

        $product = Product::findOrFail($request->product_id);
        $this->authorize('update', $product);

        try {
            // Use the Product model's removeImage method for better handling
            $product->removeImage($request->image_url);

            // Delete the actual file from storage (bucket or local)
            $fileUploadService->deleteProductImage($request->image_url);

            Log::info('Product image deleted successfully', [
                'product_id' => $product->id,
                'image_url' => $request->image_url,
                'storage_type' => $fileUploadService->isUsingBucketStorage() ? 'bucket' : 'local',
                'user_id' => $request->user()->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Image deleted successfully from ' . ($fileUploadService->isUsingBucketStorage() ? 'Laravel Cloud bucket' : 'local storage') . '.',
                'metadata' => [
                    'storage_type' => $fileUploadService->isUsingBucketStorage() ? 'bucket' : 'local',
                    'deleted_at' => now()->toISOString(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete product image', [
                'product_id' => $product->id,
                'image_url' => $request->image_url,
                'storage_type' => $fileUploadService->isUsingBucketStorage() ? 'bucket' : 'local',
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete image from ' . ($fileUploadService->isUsingBucketStorage() ? 'Laravel Cloud bucket' : 'local storage') . ': ' . $e->getMessage(),
            ], 500);
        }
    }

    public function deleteDigitalFile(Request $request, FileUploadService $fileUploadService)
    {
        $request->validate([
            'file_path' => 'required|string',
            'product_id' => 'required|exists:products,id',
        ]);

        $product = Product::findOrFail($request->product_id);
        $this->authorize('update', $product);

        try {
            // Use the Product model's removeDigitalFile method for better handling
            $product->removeDigitalFile($request->file_path);

            // Delete the actual file from storage (bucket or local)
            $fileUploadService->deleteDigitalFile($request->file_path);

            Log::info('Digital file deleted successfully', [
                'product_id' => $product->id,
                'file_path' => $request->file_path,
                'storage_type' => $fileUploadService->isUsingBucketStorage() ? 'bucket' : 'local',
                'user_id' => $request->user()->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Digital file deleted successfully from ' . ($fileUploadService->isUsingBucketStorage() ? 'Laravel Cloud bucket' : 'local storage') . '.',
                'metadata' => [
                    'storage_type' => $fileUploadService->isUsingBucketStorage() ? 'bucket' : 'local',
                    'deleted_at' => now()->toISOString(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete digital file', [
                'product_id' => $product->id,
                'file_path' => $request->file_path,
                'storage_type' => $fileUploadService->isUsingBucketStorage() ? 'bucket' : 'local',
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete digital file from ' . ($fileUploadService->isUsingBucketStorage() ? 'Laravel Cloud bucket' : 'local storage') . ': ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate signed URL for private digital file download
     */
    public function generateSignedUrl(Request $request, FileUploadService $fileUploadService)
    {
        $request->validate([
            'file_path' => 'required|string',
            'product_id' => 'required|exists:products,id',
            'expiration_minutes' => 'sometimes|integer|min:1|max:1440', // Max 24 hours
        ]);

        $product = Product::findOrFail($request->product_id);
        $this->authorize('view', $product);

        try {
            $expirationMinutes = $request->input('expiration_minutes', 60); // Default 1 hour
            $signedUrl = $fileUploadService->generateSignedUrl($request->file_path, $expirationMinutes);

            Log::info('Signed URL generated for digital file', [
                'product_id' => $product->id,
                'file_path' => $request->file_path,
                'expiration_minutes' => $expirationMinutes,
                'storage_type' => $fileUploadService->isUsingBucketStorage() ? 'bucket' : 'local',
                'user_id' => $request->user()->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Signed URL generated successfully.',
                'signed_url' => $signedUrl,
                'metadata' => [
                    'expires_at' => now()->addMinutes($expirationMinutes)->toISOString(),
                    'storage_type' => $fileUploadService->isUsingBucketStorage() ? 'bucket' : 'local',
                    'generated_at' => now()->toISOString(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to generate signed URL', [
                'product_id' => $product->id,
                'file_path' => $request->file_path,
                'storage_type' => $fileUploadService->isUsingBucketStorage() ? 'bucket' : 'local',
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate signed URL: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get file metadata for bucket-stored files
     */
    public function getFileMetadata(Request $request, FileUploadService $fileUploadService)
    {
        $request->validate([
            'file_path' => 'required|string',
            'product_id' => 'required|exists:products,id',
        ]);

        $product = Product::findOrFail($request->product_id);
        $this->authorize('view', $product);

        try {
            $metadata = $fileUploadService->getFileMetadata($request->file_path);

            Log::info('File metadata retrieved', [
                'product_id' => $product->id,
                'file_path' => $request->file_path,
                'metadata' => $metadata,
                'user_id' => $request->user()->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'File metadata retrieved successfully.',
                'metadata' => $metadata,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get file metadata', [
                'product_id' => $product->id,
                'file_path' => $request->file_path,
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get file metadata: ' . $e->getMessage(),
            ], 500);
        }
    }
}
