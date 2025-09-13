<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Electronics',
                'description' => 'Electronic devices, gadgets, and accessories',
            ],
            [
                'name' => 'Clothing & Fashion',
                'description' => 'Apparel, shoes, and fashion accessories',
            ],
            [
                'name' => 'Home & Garden',
                'description' => 'Home decor, furniture, and gardening supplies',
            ],
            [
                'name' => 'Books & Media',
                'description' => 'Books, movies, music, and digital content',
            ],
            [
                'name' => 'Sports & Outdoors',
                'description' => 'Sports equipment and outdoor gear',
            ],
            [
                'name' => 'Health & Beauty',
                'description' => 'Health, beauty, and personal care products',
            ],
            [
                'name' => 'Toys & Games',
                'description' => 'Toys, games, and entertainment for all ages',
            ],
            [
                'name' => 'Automotive',
                'description' => 'Car parts, accessories, and automotive supplies',
            ],
            [
                'name' => 'Food & Beverages',
                'description' => 'Food products, beverages, and gourmet items',
            ],
            [
                'name' => 'Arts & Crafts',
                'description' => 'Art supplies, craft materials, and handmade items',
            ],
        ];

        foreach ($categories as $categoryData) {
            Category::create([
                'name' => $categoryData['name'],
                'slug' => Str::slug($categoryData['name']),
                'description' => $categoryData['description'],
                'is_active' => true,
            ]);
        }
    }
}
