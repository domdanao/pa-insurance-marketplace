<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Merchant;
use App\Models\MerchantDocument;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MerchantDocumentController extends Controller
{
    /**
     * Display all merchant documents for admin review
     */
    public function index(Request $request): Response
    {
        $query = MerchantDocument::with(['merchant.user', 'reviewedBy'])
            ->latest();

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by document type
        if ($request->has('document_type') && $request->document_type !== 'all') {
            $query->where('document_type', $request->document_type);
        }

        // Filter by merchant
        if ($request->has('merchant_id')) {
            $query->where('merchant_id', $request->merchant_id);
        }

        // Search by merchant name or document name
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('document_name', 'like', "%{$search}%")
                  ->orWhereHas('merchant.user', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('merchant', function ($q) use ($search) {
                      $q->where('business_name', 'like', "%{$search}%");
                  });
            });
        }

        $documents = $query->paginate(20);

        $stats = [
            'pending' => MerchantDocument::where('status', 'pending')->count(),
            'approved' => MerchantDocument::where('status', 'approved')->count(),
            'rejected' => MerchantDocument::where('status', 'rejected')->count(),
            'expired' => MerchantDocument::where('status', 'expired')->count(),
        ];

        return Inertia::render('Admin/Documents/Index', [
            'documents' => $documents,
            'stats' => $stats,
            'filters' => $request->only(['status', 'document_type', 'search', 'merchant_id']),
            'documentTypes' => MerchantDocument::getDocumentTypes(),
        ]);
    }

    /**
     * Show detailed view of merchant's all documents
     */
    public function merchantDocuments(Merchant $merchant): Response
    {
        $merchant->load([
            'user',
            'merchantDocuments.reviewedBy',
            'approvedBy',
            'lastReviewedBy'
        ]);

        $documents = $merchant->merchantDocuments()
            ->with('reviewedBy')
            ->orderBy('document_type')
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('document_type');

        $requiredDocuments = MerchantDocument::getRequiredDocumentsForBusinessType($merchant->business_type);

        // Calculate completion status
        $completionStats = [
            'total_required' => count($requiredDocuments),
            'completed' => 0,
            'pending' => 0,
            'rejected' => 0,
        ];

        foreach ($requiredDocuments as $type => $config) {
            $typeDocuments = $documents->get($type, collect());
            $hasApproved = $typeDocuments->contains('status', 'approved');

            if ($hasApproved) {
                $completionStats['completed']++;
            } else {
                $hasPending = $typeDocuments->contains('status', 'pending');
                if ($hasPending) {
                    $completionStats['pending']++;
                } else {
                    $completionStats['rejected']++;
                }
            }
        }

        return Inertia::render('Admin/Documents/MerchantDocuments', [
            'merchant' => $merchant,
            'documents' => $documents,
            'requiredDocuments' => $requiredDocuments,
            'documentTypes' => MerchantDocument::getDocumentTypes(),
            'completionStats' => $completionStats,
        ]);
    }

    /**
     * Approve a document
     */
    public function approve(Request $request, MerchantDocument $document): JsonResponse
    {
        $request->validate([
            'review_notes' => 'nullable|string|max:1000',
        ]);

        $document->approve(auth()->user(), $request->review_notes);

        // Check if merchant KYB is now complete
        $this->checkMerchantKybCompletion($document->merchant);

        return response()->json([
            'message' => 'Document approved successfully',
            'document' => $document->fresh(['reviewedBy']),
        ]);
    }

    /**
     * Reject a document
     */
    public function reject(Request $request, MerchantDocument $document): JsonResponse
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:500',
            'review_notes' => 'nullable|string|max:1000',
        ]);

        $document->reject(
            auth()->user(),
            $request->rejection_reason,
            $request->review_notes
        );

        return response()->json([
            'message' => 'Document rejected successfully',
            'document' => $document->fresh(['reviewedBy']),
        ]);
    }

    /**
     * Bulk approve documents
     */
    public function bulkApprove(Request $request): JsonResponse
    {
        $request->validate([
            'document_ids' => 'required|array',
            'document_ids.*' => 'exists:merchant_documents,id',
            'review_notes' => 'nullable|string|max:1000',
        ]);

        $documents = MerchantDocument::whereIn('id', $request->document_ids)
            ->where('status', 'pending')
            ->get();

        $reviewer = auth()->user();
        $merchantIds = [];

        foreach ($documents as $document) {
            $document->approve($reviewer, $request->review_notes);
            $merchantIds[] = $document->merchant_id;
        }

        // Check KYB completion for affected merchants
        $uniqueMerchantIds = array_unique($merchantIds);
        foreach ($uniqueMerchantIds as $merchantId) {
            $merchant = Merchant::find($merchantId);
            if ($merchant) {
                $this->checkMerchantKybCompletion($merchant);
            }
        }

        return response()->json([
            'message' => count($documents) . ' documents approved successfully',
        ]);
    }

    /**
     * Download a document
     */
    public function download(MerchantDocument $document)
    {
        return app(App\Http\Controllers\Merchant\DocumentController::class)
            ->download($document);
    }

    /**
     * Update document review notes
     */
    public function updateNotes(Request $request, MerchantDocument $document): JsonResponse
    {
        $request->validate([
            'review_notes' => 'required|string|max:1000',
        ]);

        $document->update([
            'review_notes' => $request->review_notes,
            'last_reviewed_at' => now(),
            'reviewed_by' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Review notes updated successfully',
            'document' => $document->fresh(['reviewedBy']),
        ]);
    }

    /**
     * Check if merchant's KYB is complete and update status
     */
    private function checkMerchantKybCompletion(Merchant $merchant): void
    {
        $requiredDocuments = MerchantDocument::getRequiredDocumentsForBusinessType($merchant->business_type);
        $merchantDocuments = $merchant->merchantDocuments()
            ->where('status', 'approved')
            ->get()
            ->groupBy('document_type');

        $allRequiredApproved = true;
        foreach (array_keys($requiredDocuments) as $type) {
            if (!$merchantDocuments->has($type)) {
                $allRequiredApproved = false;
                break;
            }
        }

        if ($allRequiredApproved && !$merchant->kyb_completed) {
            $merchant->update([
                'kyb_completed' => true,
                'kyb_completed_at' => now(),
                'last_reviewed_at' => now(),
                'last_reviewed_by' => auth()->id(),
            ]);
        } elseif (!$allRequiredApproved && $merchant->kyb_completed) {
            $merchant->update([
                'kyb_completed' => false,
                'kyb_completed_at' => null,
            ]);
        }
    }
}