<?php

namespace App\Http\Requests\Merchant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $product = $this->route('product');

        return $user && $user->isMerchant() &&
               $user->store && $user->store->id === $product->store_id;
    }

    public function rules(): array
    {
        // Debug logging to see what data we receive
        Log::info('UpdateProductRequest validation', [
            'all_data' => $this->all(),
            'input_data' => $this->input(),
            'files' => $this->allFiles(),
        ]);
        
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'min:10', 'max:5000'],
            'category_id' => ['required', 'exists:categories,id'],
            'price' => ['required', 'numeric', 'min:0.01', 'max:999999.99'],
            'quantity' => ['required_unless:digital_product,true', 'integer', 'min:0', 'max:999999'],
            'digital_product' => ['boolean'],
            'download_url' => ['required_if:digital_product,true', 'url', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Product name is required.',
            'name.max' => 'Product name cannot exceed 255 characters.',
            'description.required' => 'Product description is required.',
            'description.min' => 'Product description must be at least 10 characters.',
            'category_id.required' => 'Please select a product category.',
            'category_id.exists' => 'Selected category is invalid.',
            'price.required' => 'Product price is required.',
            'price.numeric' => 'Price must be a valid number.',
            'price.min' => 'Price must be at least $0.01.',
            'quantity.required_unless' => 'Quantity is required for physical products.',
            'quantity.integer' => 'Quantity must be a whole number.',
            'quantity.min' => 'Quantity cannot be negative.',
            'download_url.required_if' => 'Download URL is required for digital products.',
            'download_url.url' => 'Download URL must be a valid URL.',
        ];
    }
}
