import AdminLayout from '@/layouts/AdminLayout';
import { User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import DocumentUpload from '@/components/DocumentUpload';

interface Merchant {
    id: string;
    business_name: string;
    business_type?: string;
    tax_id?: string;
    business_description?: string;
    phone?: string;
    website?: string;
    address_line_1?: string;
    address_line_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    bank_account_holder?: string;
    bank_account_number?: string;
    bank_routing_number?: string;
    bank_name?: string;
    status: 'pending' | 'approved' | 'suspended' | 'rejected';
    rejection_reason?: string;
    approved_at?: string;
    created_at: string;
    user: User;
    store?: any;
    approved_by?: User;
    documents?: string[];
}

interface MerchantStats {
    total_products: number;
    published_products: number;
    total_sales: number;
    orders_received: number;
}

interface MissingRequirements {
    information: string[];
    documents: {
        type: string;
        name: string;
        status: string;
        description: string;
        rejection_reason?: string;
    }[];
}

interface Props {
    merchant: Merchant;
    merchantStats: MerchantStats;
    missingRequirements: MissingRequirements;
}

export default function MerchantShow({ merchant, merchantStats, missingRequirements }: Props) {
    const getStatusBadge = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
            approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            rejected: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const handleStatusAction = (action: string, reason?: string) => {
        const data = reason ? { reason } : {};
        router.patch(`/admin/merchants/${merchant.id}/${action}`, data);
    };

    return (
        <AdminLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl leading-tight font-semibold text-gray-800 dark:text-gray-200">Merchant Details</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Detailed information for {merchant.business_name}</p>
                    </div>
                    <Link
                        href="/admin/merchants"
                        className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
                    >
                        Back to Merchants
                    </Link>
                </div>
            }
        >
            <Head title={`${merchant.business_name} - Merchant Details - Admin`} />

            <div className="space-y-6">
                {/* Status Actions */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadge(merchant.status)}`}>
                                {merchant.status}
                            </span>
                            {merchant.approved_at && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Approved on {new Date(merchant.approved_at).toLocaleDateString()}
                                    {merchant.approved_by && <span> by {merchant.approved_by.name}</span>}
                                </p>
                            )}
                        </div>

                        <div className="flex space-x-2">
                            {merchant.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => handleStatusAction('approve')}
                                        className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => {
                                            const reason = prompt('Reason for rejection:');
                                            if (reason) handleStatusAction('reject', reason);
                                        }}
                                        className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}

                            {merchant.status === 'approved' && (
                                <button
                                    onClick={() => {
                                        const reason = prompt('Reason for suspension (optional):');
                                        handleStatusAction('suspend', reason || undefined);
                                    }}
                                    className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
                                >
                                    Suspend
                                </button>
                            )}

                            {(merchant.status === 'suspended' || merchant.status === 'rejected') && (
                                <button
                                    onClick={() => handleStatusAction('reactivate')}
                                    className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
                                >
                                    Reactivate
                                </button>
                            )}
                        </div>
                    </div>

                    {merchant.rejection_reason && (
                        <div className="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900">
                            <p className="text-sm text-red-700 dark:text-red-300">
                                <strong>Reason:</strong> {merchant.rejection_reason}
                            </p>
                        </div>
                    )}
                </div>

                {/* Missing Requirements - Show if merchant has missing items */}
                {missingRequirements && (missingRequirements.information.length > 0 || missingRequirements.documents.length > 0) && (
                    <div className="rounded-lg bg-orange-50 border border-orange-200 p-6 shadow dark:bg-orange-900/20 dark:border-orange-800">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="text-lg font-medium text-orange-800 dark:text-orange-200">
                                    {merchant.status === 'pending' ? 'Missing Requirements for Approval' : 'Incomplete Requirements'}
                                </h3>
                                <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
                                    {merchant.status === 'pending'
                                        ? 'The following information and documents are required before this merchant can be approved:'
                                        : 'The following information and documents are incomplete or missing:'
                                    }
                                </p>

                                {/* Missing Information */}
                                {missingRequirements.information.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200">Missing Information:</h4>
                                        <div className="mt-2 flex items-center justify-between">
                                            <ul className="space-y-1 flex-1">
                                                {missingRequirements.information.map((item, index) => (
                                                    <li key={index} className="flex items-center text-sm text-orange-700 dark:text-orange-300">
                                                        <span className="mr-2">•</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="ml-4">
                                                <button
                                                    onClick={() => {
                                                        // Simple implementation - you could create a proper edit modal
                                                        window.location.href = `/admin/merchants/${merchant.id}/edit`;
                                                    }}
                                                    className="inline-flex items-center px-3 py-1 border border-orange-300 rounded-md text-xs font-medium text-orange-700 bg-white hover:bg-orange-50 dark:bg-gray-800 dark:text-orange-300 dark:border-orange-600 dark:hover:bg-orange-900/20"
                                                >
                                                    Edit Info
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Missing Documents */}
                                {missingRequirements.documents.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200">Document Issues:</h4>
                                        <div className="mt-3 space-y-4">
                                            {missingRequirements.documents.map((doc, index) => (
                                                <div key={index} className="border border-orange-200 dark:border-orange-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-orange-800 dark:text-orange-200">
                                                                    {doc.name}
                                                                </span>
                                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                                    doc.status === 'not_submitted'
                                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                                        : doc.status === 'pending'
                                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                                }`}>
                                                                    {doc.status === 'not_submitted' ? 'Not Submitted' : doc.status}
                                                                </span>
                                                            </div>
                                                            <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                                                                {doc.description}
                                                            </p>
                                                            {doc.rejection_reason && (
                                                                <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                                                    <strong>Rejection reason:</strong> {doc.rejection_reason}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="ml-4 flex-shrink-0">
                                                            <DocumentUpload
                                                                merchantId={merchant.id}
                                                                documentType={doc.type}
                                                                documentName={doc.name}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4">
                                            <Link
                                                href={`/admin/merchants/${merchant.id}/documents`}
                                                className="inline-flex items-center text-sm text-orange-700 hover:text-orange-600 dark:text-orange-300 dark:hover:text-orange-200"
                                            >
                                                View & Manage All Documents →
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Business Statistics */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Business Statistics</h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{merchantStats.total_products}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{merchantStats.published_products}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{merchantStats.orders_received}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Orders Received</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">${merchantStats.total_sales.toFixed(2)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
                        </div>
                    </div>
                </div>

                {/* Business Information */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Business Information</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Name</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{merchant.business_name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Type</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{merchant.business_type || 'Not specified'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tax ID</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{merchant.tax_id || 'Not provided'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{merchant.phone || 'Not provided'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Website</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                {merchant.website ? (
                                    <a
                                        href={merchant.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-500"
                                    >
                                        {merchant.website}
                                    </a>
                                ) : (
                                    'Not provided'
                                )}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Applied</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{new Date(merchant.created_at).toLocaleDateString()}</p>
                        </div>
                        {merchant.business_description && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Description</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">{merchant.business_description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Owner Information */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Owner Information</h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{merchant.user.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{merchant.user.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Member Since</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-white">{new Date(merchant.user.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Actions</label>
                            <Link
                                href={`/admin/users/${merchant.user.id}`}
                                className="mt-1 inline-flex text-sm text-indigo-600 hover:text-indigo-500"
                            >
                                View User Profile
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Address Information */}
                {(merchant.address_line_1 || merchant.city || merchant.state) && (
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Address Information</h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address Line 1</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">{merchant.address_line_1 || 'Not provided'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address Line 2</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">{merchant.address_line_2 || 'Not provided'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">{merchant.city || 'Not provided'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">{merchant.state || 'Not provided'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">{merchant.postal_code || 'Not provided'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">{merchant.country || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Banking Information */}
                {(merchant.bank_name || merchant.bank_account_holder) && (
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Banking Information</h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Holder</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">{merchant.bank_account_holder || 'Not provided'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bank Name</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">{merchant.bank_name || 'Not provided'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Number</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {merchant.bank_account_number ? '****' + merchant.bank_account_number.slice(-4) : 'Not provided'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Routing Number</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">{merchant.bank_routing_number || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Store Information */}
                {merchant.store && (
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">Store Information</h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Store Name</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">{merchant.store.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Store Status</label>
                                <span
                                    className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(merchant.store.status)}`}
                                >
                                    {merchant.store.status}
                                </span>
                            </div>
                            <div className="md:col-span-2">
                                <Link href={`/admin/stores`} className="inline-flex text-sm text-indigo-600 hover:text-indigo-500">
                                    View in Store Management
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
