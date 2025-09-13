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
        return [
            'files' => ['required', 'array', 'max:3'],
            'files.*' => [
                'required',
                'file',
                'mimes:pdf,zip,txt,xls,xlsx,doc,docx',
                'max:51200', // 50MB
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'files.required' => 'Please select at least one file to upload.',
            'files.max' => 'You can upload a maximum of 3 files at once.',
            'files.*.required' => 'Each uploaded file must be valid.',
            'files.*.file' => 'Each upload must be a valid file.',
            'files.*.mimes' => 'Files must be of type: pdf, zip, txt, xls, xlsx, doc, or docx.',
            'files.*.max' => 'Each file must not be larger than 50MB.',
        ];
    }
}
