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
        // Get bucket-specific limits from config
        $maxFileSize = config('filesystems.default') === 'laravel_cloud'
            ? config('marketplace.bucket_max_image_size', 10240) // 10MB for bucket
            : 5120; // 5MB for local
            
        $maxImages = config('filesystems.default') === 'laravel_cloud'
            ? config('marketplace.bucket_max_images_per_upload', 10)
            : 5;

        return [
            'images' => ['required', 'array', 'max:' . $maxImages],
            'images.*' => [
                'required',
                'file',
                'image',
                'mimes:jpeg,png,gif,webp,svg',
                'max:' . $maxFileSize,
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        $maxImages = config('filesystems.default') === 'laravel_cloud'
            ? config('marketplace.bucket_max_images_per_upload', 10)
            : 5;
            
        $maxSizeMB = config('filesystems.default') === 'laravel_cloud'
            ? (config('marketplace.bucket_max_image_size', 10240) / 1024) . 'MB'
            : '5MB';
            
        $storageType = config('filesystems.default') === 'laravel_cloud'
            ? 'Laravel Cloud bucket'
            : 'local storage';

        return [
            'images.required' => 'Please select at least one image to upload.',
            'images.max' => "You can upload a maximum of {$maxImages} images at once to {$storageType}.",
            'images.*.required' => 'Each uploaded file must be a valid image.',
            'images.*.image' => 'Each file must be a valid image.',
            'images.*.mimes' => 'Images must be of type: jpeg, png, gif, webp, or svg.',
            'images.*.max' => "Each image must not be larger than {$maxSizeMB} for {$storageType}.",
        ];
    }
}
