<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StorefrontController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::published()
            ->with(['store', 'category'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('store', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            })
            ->when($request->category, function ($query, $category) {
                $query->whereHas('category', function ($q) use ($category) {
                    $q->where('slug', $category);
                });
            })
            ->when($request->price_min, function ($query, $priceMin) {
                $query->where('price', '>=', $priceMin * 100);
            })
            ->when($request->price_max, function ($query, $priceMax) {
                $query->where('price', '<=', $priceMax * 100);
            })
            ->when($request->digital_only, function ($query) {
                $query->where('digital_product', true);
            })
            ->when($request->sort, function ($query, $sort) {
                switch ($sort) {
                    case 'price_asc':
                        $query->orderBy('price', 'asc');
                        break;
                    case 'price_desc':
                        $query->orderBy('price', 'desc');
                        break;
                    case 'name':
                        $query->orderBy('name', 'asc');
                        break;
                    case 'newest':
                    default:
                        $query->orderBy('created_at', 'desc');
                        break;
                }
            }, function ($query) {
                $query->orderBy('created_at', 'desc');
            })
            ->paginate(12)
            ->withQueryString();

        $categories = Category::withCount(['products' => function ($query) {
            $query->published();
        }])->orderBy('name')->get();

        return Inertia::render('Storefront/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => $request->search,
                'category' => $request->category,
                'price_min' => $request->price_min,
                'price_max' => $request->price_max,
                'digital_only' => $request->boolean('digital_only'),
                'sort' => $request->sort ?? 'newest',
            ],
        ]);
    }

    public function show(Product $product)
    {
        if (! $product->isPublished()) {
            abort(404);
        }

        $product->load(['store', 'category']);

        $relatedProducts = Product::published()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['store'])
            ->limit(4)
            ->get();

        return Inertia::render('Storefront/Products/Show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }

    public function store(Store $store)
    {
        if (! $store->isApproved()) {
            abort(404);
        }

        $products = Product::published()
            ->where('store_id', $store->id)
            ->with(['category'])
            ->orderBy('created_at', 'desc')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Storefront/Stores/Show', [
            'store' => $store,
            'products' => $products,
        ]);
    }

    public function stores(Request $request)
    {
        $stores = Store::approved()
            ->withCount(['products' => function ($query) {
                $query->published();
            }])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        $categories = Category::withCount(['products' => function ($query) {
            $query->published();
        }])->orderBy('name')->get();

        return Inertia::render('Storefront/Stores/Index', [
            'stores' => $stores,
            'categories' => $categories,
            'filters' => [
                'search' => $request->search,
            ],
        ]);
    }
}
