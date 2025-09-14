<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Merchant;
use App\Models\MerchantDocument;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    /**
     * Display merchant documents page
     */
    public function index(): Response
    {
        $merchant = auth()->user()->merchant;

        if (!$merchant) {
            return Inertia::render('Merchant/NoMerchantAccount');
        }

        $documents = $merchant->merchantDocuments()
            ->with('reviewedBy')
            ->latest()
            ->get();

        $requiredDocuments = MerchantDocument::getRequiredDocumentsForBusinessType($merchant->business_type);

        return Inertia::render('Merchant/Documents/Index', [
            'merchant' => $merchant,
            'documents' => $documents,
            'requiredDocuments' => $requiredDocuments,
            'documentTypes' => MerchantDocument::getDocumentTypes(),
        ]);
    }

    /**
     * Upload a document
     */
    public function store(Request $request): JsonResponse
    {
        $merchant = auth()->user()->merchant;

        if (!$merchant) {
            return response()->json(['error' => 'Merchant account required'], 403);
        }

        $request->validate([
            'document_type' => 'required|string|in:' . implode(',', array_keys(MerchantDocument::getDocumentTypes())),
            'document_name' => 'required|string|max:255',
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240', // 10MB max
            'expiry_date' => 'nullable|date|after:today',
        ]);

        $file = $request->file('file');
        $documentType = $request->input('document_type');

        // Generate unique filename
        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $extension;

        // Store file in merchant documents directory
        $path = $file->storeAs(
            "merchant-documents/{$merchant->id}",
            $filename,
            'private'
        );

        // Create document record
        $document = $merchant->merchantDocuments()->create([
            'document_type' => $documentType,
            'document_name' => $request->input('document_name'),
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'file_hash' => hash_file('md5', $file->getRealPath()),
            'expiry_date' => $request->input('expiry_date'),
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Document uploaded successfully',
            'document' => $document->load('reviewedBy'),
        ]);
    }

    /**
     * Download a document
     */
    public function download(MerchantDocument $document)
    {
        // Check permission - only merchant owner or admins
        if (!$this->canAccessDocument($document)) {
            abort(403);
        }

        if (!Storage::disk('private')->exists($document->file_path)) {
            abort(404, 'File not found');
        }

        return Storage::disk('private')->download(
            $document->file_path,
            $document->file_name
        );
    }

    /**
     * Delete a document
     */
    public function destroy(MerchantDocument $document): JsonResponse
    {
        $merchant = auth()->user()->merchant;

        if (!$merchant || $document->merchant_id !== $merchant->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Only allow deletion of pending or rejected documents
        if (!in_array($document->status, ['pending', 'rejected'])) {
            return response()->json(['error' => 'Cannot delete approved documents'], 422);
        }

        // Delete file from storage
        if (Storage::disk('private')->exists($document->file_path)) {
            Storage::disk('private')->delete($document->file_path);
        }

        $document->delete();

        return response()->json(['message' => 'Document deleted successfully']);
    }

    /**
     * Check if user can access document
     */
    private function canAccessDocument(MerchantDocument $document): bool
    {
        $user = auth()->user();

        // Admin can access all documents
        if ($user->isAdmin()) {
            return true;
        }

        // Merchant can access their own documents
        if ($user->isMerchant() && $user->merchant && $user->merchant->id === $document->merchant_id) {
            return true;
        }

        return false;
    }

    /**
     * Get upload progress (for chunked uploads)
     */
    public function uploadProgress(Request $request): JsonResponse
    {
        // This would be used for large file uploads with progress tracking
        // Implementation depends on chosen upload strategy (chunked, resumable, etc.)
        return response()->json(['progress' => 0]);
    }
}