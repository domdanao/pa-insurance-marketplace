<?php

namespace App\Http\Requests\Merchant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        return $user && $user->isMerchant();
    }

    public function rules(): array
    {
        $store = $this->user()->store;
        $storeId = $store ? $store->id : null;

        return [
            'name' => ['required', 'string', 'max:255', $storeId ? Rule::unique('stores', 'name')->ignore($storeId) : Rule::unique('stores', 'name')],
            'description' => ['required', 'string', 'min:10', 'max:2000'],
            'category_id' => ['required', 'exists:categories,id'],
            'contact_email' => ['required', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:20'],
            'address' => ['required', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Store name is required.',
            'name.unique' => 'A store with this name already exists.',
            'description.required' => 'Store description is required.',
            'description.min' => 'Store description must be at least 10 characters.',
            'category_id.required' => 'Please select a category for your store.',
            'category_id.exists' => 'Selected category is invalid.',
            'contact_email.required' => 'Contact email is required.',
            'contact_email.email' => 'Please provide a valid email address.',
            'address.required' => 'Store address is required.',
        ];
    }
}
