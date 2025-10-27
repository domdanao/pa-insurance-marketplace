<?php

namespace App\Http\Requests\Merchant;

use Illuminate\Foundation\Http\FormRequest;

class UploadDigitalFilesRequest extends FormRequest
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
            ? config('marketplace.bucket_max_file_size', 102400) // 100MB for bucket
            : 51200; // 50MB for local
            
        $maxFiles = config('filesystems.default') === 'laravel_cloud'
            ? config('marketplace.bucket_max_files_per_upload', 5)
            : 3;

        return [
            'files' => ['required', 'array', 'max:' . $maxFiles],
            'files.*' => [
                'required',
                'file',
                'mimes:pdf,zip,txt,xls,xlsx,doc,docx,csv,json,xml',
                'max:' . $maxFileSize,
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        $maxFiles = config('filesystems.default') === 'laravel_cloud'
            ? config('marketplace.bucket_max_files_per_upload', 5)
            : 3;
            
        $maxSizeMB = config('filesystems.default') === 'laravel_cloud'
            ? (config('marketplace.bucket_max_file_size', 102400) / 1024) . 'MB'
            : '50MB';
            
        $storageType = config('filesystems.default') === 'laravel_cloud'
            ? 'Laravel Cloud bucket'
            : 'local storage';

        return [
            'files.required' => 'Please select at least one file to upload.',
            'files.max' => "You can upload a maximum of {$maxFiles} files at once to {$storageType}.",
            'files.*.required' => 'Each uploaded file must be valid.',
            'files.*.file' => 'Each upload must be a valid file.',
            'files.*.mimes' => 'Files must be of type: pdf, zip, txt, xls, xlsx, doc, docx, csv, json, or xml.',
            'files.*.max' => "Each file must not be larger than {$maxSizeMB} for {$storageType}.",
        ];
    }
}
