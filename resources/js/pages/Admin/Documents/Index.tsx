import { MerchantDocument, PaginatedResponse } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    FileText,
    Search,
    Filter,
    Download,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    MessageSquare,
    Users
} from 'lucide-react';

import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface AdminDocumentsIndexProps {
    documents: PaginatedResponse<MerchantDocument>;
    stats: {
        pending: number;
        approved: number;
        rejected: number;
        expired: number;
    };
    filters: {
        status?: string;
        document_type?: string;
        search?: string;
        merchant_id?: string;
    };
    documentTypes: Record<string, any>;
}

export default function AdminDocumentsIndex({
    documents,
    stats,
    filters,
    documentTypes,
}: AdminDocumentsIndexProps) {
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
    const [bulkApprovalOpen, setBulkApprovalOpen] = useState(false);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<MerchantDocument | null>(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(window.location.search);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.get(window.location.pathname + '?' + params.toString());
    };

    const handleBulkSelection = (documentId: string, checked: boolean) => {
        if (checked) {
            setSelectedDocuments([...selectedDocuments, documentId]);
        } else {
            setSelectedDocuments(selectedDocuments.filter(id => id !== documentId));
        }
    };

    const handleBulkApproval = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        try {
            const response = await fetch('/admin/documents/bulk-approve', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            if (response.ok) {
                router.reload();
                setBulkApprovalOpen(false);
                setSelectedDocuments([]);
            } else {
                const error = await response.json();
                alert(error.message || 'Bulk approval failed');
            }
        } catch (error) {
            console.error('Bulk approval error:', error);
            alert('Bulk approval failed');
        }
    };

    const handleDocumentAction = async (document: MerchantDocument, action: 'approve' | 'reject', data: any) => {
        try {
            const response = await fetch(`/admin/documents/${document.id}/${action}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                router.reload();
                setReviewDialogOpen(false);
                setSelectedDocument(null);
                setReviewNotes('');
                setRejectionReason('');
            } else {
                const error = await response.json();
                alert(error.message || `${action} failed`);
            }
        } catch (error) {
            console.error(`${action} error:`, error);
            alert(`${action} failed`);
        }
    };

    const handleDownload = (documentId: string) => {
        window.open(`/admin/documents/${documentId}/download`, '_blank');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            case 'expired':
                return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Expired</Badge>;
            case 'pending':
            default:
                return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
        }
    };

    return (
        <AdminLayout>
            <Head title="Document Management" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            KYB Document Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Review and manage merchant verification documents
                        </p>
                    </div>

                    {selectedDocuments.length > 0 && (
                        <Dialog open={bulkApprovalOpen} onOpenChange={setBulkApprovalOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Bulk Approve ({selectedDocuments.length})
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Bulk Approve Documents</DialogTitle>
                                    <DialogDescription>
                                        Approve {selectedDocuments.length} selected documents
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleBulkApproval} className="space-y-4">
                                    {selectedDocuments.map(id => (
                                        <input key={id} type="hidden" name="document_ids[]" value={id} />
                                    ))}
                                    <div>
                                        <Label htmlFor="review_notes">Review Notes (Optional)</Label>
                                        <Textarea
                                            name="review_notes"
                                            placeholder="Add any notes about this approval..."
                                            rows={3}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setBulkApprovalOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">Approve All</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Clock className="h-8 w-8 text-yellow-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Pending Review</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Approved</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <XCircle className="h-8 w-8 text-red-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Rejected</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <FileText className="h-8 w-8 text-gray-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Expired</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label>Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        className="pl-8"
                                        placeholder="Search documents..."
                                        defaultValue={filters.search || ''}
                                        onChange={(e) => {
                                            const timer = setTimeout(() => {
                                                handleFilterChange('search', e.target.value);
                                            }, 500);
                                            return () => clearTimeout(timer);
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={filters.status || 'all'}
                                    onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Document Type</Label>
                                <Select
                                    value={filters.document_type || 'all'}
                                    onValueChange={(value) => handleFilterChange('document_type', value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {Object.entries(documentTypes).map(([key, config]) => (
                                            <SelectItem key={key} value={key}>
                                                {config.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        router.get(window.location.pathname);
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Documents Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {documents.data.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No documents found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    No documents match your current filters
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedDocuments(documents.data.filter(doc => doc.status === 'pending').map(doc => doc.id));
                                                    } else {
                                                        setSelectedDocuments([]);
                                                    }
                                                }}
                                                checked={selectedDocuments.length > 0 && documents.data.filter(doc => doc.status === 'pending').every(doc => selectedDocuments.includes(doc.id))}
                                            />
                                        </TableHead>
                                        <TableHead>Document</TableHead>
                                        <TableHead>Merchant</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Uploaded</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {documents.data.map((document) => (
                                        <TableRow key={document.id}>
                                            <TableCell>
                                                {document.status === 'pending' && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedDocuments.includes(document.id)}
                                                        onChange={(e) => handleBulkSelection(document.id, e.target.checked)}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{document.document_name}</div>
                                                    <div className="text-sm text-gray-500">{document.file_name}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/admin/merchants/${document.merchant.id}`}
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <div className="font-medium">{document.merchant.business_name}</div>
                                                    <div className="text-sm text-gray-500">{document.merchant.user.name}</div>
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {documentTypes[document.document_type]?.name || document.document_type}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(document.status)}
                                                {document.rejection_reason && (
                                                    <div className="text-xs text-red-600 mt-1">
                                                        {document.rejection_reason}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(document.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDownload(document.id)}
                                                    >
                                                        <Download className="w-3 h-3" />
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedDocument(document);
                                                            setReviewDialogOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                    </Button>

                                                    <Link href={`/admin/merchants/${document.merchant.id}/documents`}>
                                                        <Button size="sm" variant="outline">
                                                            <Users className="w-3 h-3" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Review Dialog */}
                <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Review Document</DialogTitle>
                            <DialogDescription>
                                Review and approve or reject this document
                            </DialogDescription>
                        </DialogHeader>

                        {selectedDocument && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium">Document Name</Label>
                                        <p className="text-sm">{selectedDocument.document_name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">File Name</Label>
                                        <p className="text-sm">{selectedDocument.file_name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Merchant</Label>
                                        <p className="text-sm">{selectedDocument.merchant.business_name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Status</Label>
                                        <div>{getStatusBadge(selectedDocument.status)}</div>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="review_notes">Review Notes</Label>
                                    <Textarea
                                        id="review_notes"
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        placeholder="Add review notes..."
                                        rows={3}
                                    />
                                </div>

                                {selectedDocument.status === 'pending' && (
                                    <>
                                        <div>
                                            <Label htmlFor="rejection_reason">Rejection Reason (if rejecting)</Label>
                                            <Input
                                                id="rejection_reason"
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Reason for rejection..."
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    if (!rejectionReason.trim()) {
                                                        alert('Please provide a rejection reason');
                                                        return;
                                                    }
                                                    handleDocumentAction(selectedDocument, 'reject', {
                                                        rejection_reason: rejectionReason,
                                                        review_notes: reviewNotes,
                                                    });
                                                }}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Reject
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    handleDocumentAction(selectedDocument, 'approve', {
                                                        review_notes: reviewNotes,
                                                    });
                                                }}
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Approve
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}