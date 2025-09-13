<?php

namespace App\Http\Requests\Merchant;

use Illuminate\Foundation\Http\FormRequest;

class UploadProductImagesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->isMerchant() && $this->user()->store;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'images' => ['required', 'array', 'max:5'],
            'images.*' => [
                'required',
                'file',
                'image',
                'mimes:jpeg,png,gif,webp',
                'max:5120', // 5MB
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'images.required' => 'Please select at least one image to upload.',
            'images.max' => 'You can upload a maximum of 5 images at once.',
            'images.*.required' => 'Each uploaded file must be a valid image.',
            'images.*.image' => 'Each file must be a valid image.',
            'images.*.mimes' => 'Images must be of type: jpeg, png, gif, or webp.',
            'images.*.max' => 'Each image must not be larger than 5MB.',
        ];
    }
}
