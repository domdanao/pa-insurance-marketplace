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
        $user = auth()->user();
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
        $store = $request->user()->store;

        try {
            $uploadedImages = $fileUploadService->uploadProductImages(
                $request->file('images'),
                $store->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Images uploaded successfully.',
                'images' => $uploadedImages,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload images: '.$e->getMessage(),
            ], 500);
        }
    }

    public function uploadDigitalFiles(UploadDigitalFilesRequest $request, FileUploadService $fileUploadService)
    {
        $store = $request->user()->store;

        try {
            $uploadedFiles = $fileUploadService->uploadDigitalFiles(
                $request->file('files'),
                $store->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Digital files uploaded successfully.',
                'files' => $uploadedFiles,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload files: '.$e->getMessage(),
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
            // Remove image from product's images array
            $images = $product->images ?? [];
            $updatedImages = array_filter($images, function ($image) use ($request) {
                return $image !== $request->image_url;
            });

            $product->update(['images' => array_values($updatedImages)]);

            // Delete the actual file
            $fileUploadService->deleteProductImage($request->image_url);

            return response()->json([
                'success' => true,
                'message' => 'Image deleted successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete image: '.$e->getMessage(),
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
            // Remove file from product's digital_files array
            $files = $product->digital_files ?? [];
            $updatedFiles = array_filter($files, function ($file) use ($request) {
                return $file['path'] !== $request->file_path;
            });

            $product->update(['digital_files' => array_values($updatedFiles)]);

            // Delete the actual file
            $fileUploadService->deleteDigitalFile($request->file_path);

            return response()->json([
                'success' => true,
                'message' => 'Digital file deleted successfully.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete file: '.$e->getMessage(),
            ], 500);
        }
    }
}
