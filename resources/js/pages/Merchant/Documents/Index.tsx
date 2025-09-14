import { Merchant, MerchantDocument } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Upload, Download, Trash2, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import MerchantLayout from '@/layouts/MerchantLayout';

interface DocumentsIndexProps {
    merchant: Merchant;
    documents: MerchantDocument[];
    requiredDocuments: Record<string, any>;
    documentTypes: Record<string, any>;
}

export default function DocumentsIndex({
    merchant,
    documents,
    requiredDocuments,
    documentTypes,
}: DocumentsIndexProps) {
    const [uploadingDocuments, setUploadingDocuments] = useState<Record<string, boolean>>({});
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedDocumentType, setSelectedDocumentType] = useState('');

    const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const documentType = formData.get('document_type') as string;

        if (!documentType) return;

        setUploadingDocuments(prev => ({ ...prev, [documentType]: true }));

        try {
            const response = await fetch('/merchant/documents', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            if (response.ok) {
                router.reload();
                setUploadDialogOpen(false);
                e.currentTarget.reset();
            } else {
                const error = await response.json();
                alert(error.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed');
        } finally {
            setUploadingDocuments(prev => ({ ...prev, [documentType]: false }));
        }
    };

    const handleDownload = (documentId: string) => {
        window.open(`/merchant/documents/${documentId}/download`, '_blank');
    };

    const handleDelete = async (documentId: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            const response = await fetch(`/merchant/documents/${documentId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
            });

            if (response.ok) {
                router.reload();
            } else {
                const error = await response.json();
                alert(error.message || 'Delete failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Delete failed');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            case 'pending':
            default:
                return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
        }
    };

    const getDocumentsByType = (type: string) => {
        return documents.filter(doc => doc.document_type === type);
    };

    const isDocumentTypeComplete = (type: string) => {
        const docs = getDocumentsByType(type);
        return docs.some(doc => doc.status === 'approved');
    };

    return (
        <MerchantLayout>
            <Head title="Documents" />

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            KYB Documents
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Upload and manage your business verification documents
                        </p>
                    </div>

                    <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Document
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Upload Document</DialogTitle>
                                <DialogDescription>
                                    Select the document type and upload your file
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleFileUpload} className="space-y-4">
                                <div>
                                    <Label htmlFor="document_type">Document Type</Label>
                                    <select
                                        name="document_type"
                                        required
                                        className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                                        value={selectedDocumentType}
                                        onChange={(e) => setSelectedDocumentType(e.target.value)}
                                    >
                                        <option value="">Select document type</option>
                                        {Object.entries(documentTypes).map(([key, config]) => (
                                            <option key={key} value={key}>
                                                {config.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="document_name">Document Name</Label>
                                    <Input
                                        name="document_name"
                                        placeholder="Enter a descriptive name"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="file">File</Label>
                                    <Input
                                        name="file"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                                    </p>
                                </div>

                                {selectedDocumentType && documentTypes[selectedDocumentType]?.expires && (
                                    <div>
                                        <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
                                        <Input
                                            name="expiry_date"
                                            type="date"
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={uploadingDocuments[selectedDocumentType]}
                                >
                                    {uploadingDocuments[selectedDocumentType] ? 'Uploading...' : 'Upload Document'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Required Documents Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Required Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(requiredDocuments).map(([type, config]) => (
                                <div key={type} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium">{config.name}</h4>
                                        {isDocumentTypeComplete(type) ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Clock className="w-5 h-5 text-yellow-500" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        {config.description}
                                    </p>
                                    <div className="text-xs">
                                        {getDocumentsByType(type).length > 0 ? (
                                            <span className="text-blue-600">
                                                {getDocumentsByType(type).length} document(s) uploaded
                                            </span>
                                        ) : (
                                            <span className="text-red-600">No documents uploaded</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Documents Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Uploaded Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {documents.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No documents uploaded
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Start by uploading your required business documents
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Document</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Uploaded</TableHead>
                                        <TableHead>Expiry</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {documents.map((document) => (
                                        <TableRow key={document.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{document.document_name}</div>
                                                    <div className="text-sm text-gray-500">{document.file_name}</div>
                                                </div>
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
                                            <TableCell className="text-sm">
                                                {document.expiry_date
                                                    ? new Date(document.expiry_date).toLocaleDateString()
                                                    : 'No expiry'
                                                }
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
                                                    {['pending', 'rejected'].includes(document.status) && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDelete(document.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MerchantLayout>
    );
}