import { Merchant, MerchantDocument } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    FileText,
    Download,
    CheckCircle,
    XCircle,
    Clock,
    User,
    Building,
    ArrowLeft,
    AlertTriangle,
    Award
} from 'lucide-react';

import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

interface MerchantDocumentsProps {
    merchant: Merchant;
    documents: Record<string, MerchantDocument[]>;
    requiredDocuments: Record<string, any>;
    documentTypes: Record<string, any>;
    completionStats: {
        total_required: number;
        completed: number;
        pending: number;
        rejected: number;
    };
}

export default function MerchantDocuments({
    merchant,
    documents,
    requiredDocuments,
    documentTypes,
    completionStats,
}: MerchantDocumentsProps) {
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

    const getDocumentTypeStatus = (type: string) => {
        const typeDocuments = documents[type] || [];
        const hasApproved = typeDocuments.some(doc => doc.status === 'approved');
        const hasPending = typeDocuments.some(doc => doc.status === 'pending');
        const hasRejected = typeDocuments.some(doc => doc.status === 'rejected');

        if (hasApproved) {
            return 'complete';
        } else if (hasPending) {
            return 'pending';
        } else if (hasRejected) {
            return 'rejected';
        } else {
            return 'missing';
        }
    };

    const completionPercentage = (completionStats.completed / completionStats.total_required) * 100;

    return (
        <AdminLayout>
            <Head title={`Documents - ${merchant.business_name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/documents">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Documents
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {merchant.business_name}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                KYB Document Review
                            </p>
                        </div>
                    </div>

                    <div className="text-right">
                        {merchant.kyb_completed ? (
                            <Badge className="bg-green-100 text-green-800 px-3 py-2">
                                <Award className="w-4 h-4 mr-2" />
                                KYB Complete
                            </Badge>
                        ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 px-3 py-2">
                                <Clock className="w-4 h-4 mr-2" />
                                KYB Pending
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Merchant Information */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Building className="w-5 h-5 mr-2" />
                                Business Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Business Name</p>
                                    <p className="text-sm">{merchant.business_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Business Type</p>
                                    <p className="text-sm">{merchant.business_type}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Tax ID</p>
                                    <p className="text-sm">{merchant.tax_id}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Status</p>
                                    <Badge variant={merchant.status === 'approved' ? 'default' : 'secondary'}>
                                        {merchant.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Owner</p>
                                    <p className="text-sm">{merchant.user.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Email</p>
                                    <p className="text-sm">{merchant.user.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>KYB Completion</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Progress</span>
                                    <span>{completionStats.completed}/{completionStats.total_required}</span>
                                </div>
                                <Progress value={completionPercentage} className="h-2" />
                                <p className="text-xs text-gray-500 mt-1">
                                    {Math.round(completionPercentage)}% complete
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                                    <span>{completionStats.completed} Complete</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 text-yellow-600 mr-1" />
                                    <span>{completionStats.pending} Pending</span>
                                </div>
                                <div className="flex items-center">
                                    <XCircle className="w-4 h-4 text-red-600 mr-1" />
                                    <span>{completionStats.rejected} Rejected</span>
                                </div>
                                <div className="flex items-center">
                                    <AlertTriangle className="w-4 h-4 text-gray-600 mr-1" />
                                    <span>{completionStats.total_required - completionStats.completed - completionStats.pending - completionStats.rejected} Missing</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Required Documents Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Required Documents Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(requiredDocuments).map(([type, config]) => {
                                const status = getDocumentTypeStatus(type);
                                const typeDocuments = documents[type] || [];

                                return (
                                    <div key={type} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium">{config.name}</h4>
                                            {status === 'complete' && (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            )}
                                            {status === 'pending' && (
                                                <Clock className="w-5 h-5 text-yellow-500" />
                                            )}
                                            {status === 'rejected' && (
                                                <XCircle className="w-5 h-5 text-red-500" />
                                            )}
                                            {status === 'missing' && (
                                                <AlertTriangle className="w-5 h-5 text-gray-500" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            {config.description}
                                        </p>
                                        <div className="text-xs">
                                            {typeDocuments.length > 0 ? (
                                                <span className="text-blue-600">
                                                    {typeDocuments.length} document(s) uploaded
                                                </span>
                                            ) : (
                                                <span className="text-red-600">No documents uploaded</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Documents by Type */}
                {Object.entries(documents).map(([type, typeDocuments]) => (
                    <Card key={type}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{documentTypes[type]?.name || type}</span>
                                <Badge variant="secondary">{typeDocuments.length} documents</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Document</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Uploaded</TableHead>
                                        <TableHead>Reviewed By</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {typeDocuments.map((document) => (
                                        <TableRow key={document.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{document.document_name}</div>
                                                    <div className="text-sm text-gray-500">{document.file_name}</div>
                                                </div>
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
                                                {document.reviewed_by ? (
                                                    <div>
                                                        <div>{document.reviewed_by.name}</div>
                                                        {document.last_reviewed_at && (
                                                            <div className="text-xs text-gray-500">
                                                                {new Date(document.last_reviewed_at).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">Not reviewed</span>
                                                )}
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
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))}

                {Object.keys(documents).length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No documents uploaded
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                This merchant hasn't uploaded any documents yet
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}