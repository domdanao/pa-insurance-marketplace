import { PropsWithChildren } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { User } from '@/types';

interface MerchantLayoutProps extends PropsWithChildren {
    header?: React.ReactNode;
}

export default function MerchantLayout({ children, header }: MerchantLayoutProps) {
    const { auth } = usePage().props as { auth: { user: User } };

    const navigation = [
        { name: 'Dashboard', href: '/merchant/dashboard', icon: '📊' },
        { name: 'Store', href: '/merchant/store/edit', icon: '🏪' },
        { name: 'Products', href: '/merchant/products', icon: '📦' },
        { name: 'Orders', href: '/merchant/orders', icon: '📋' },
        { name: 'Analytics', href: '/merchant/analytics', icon: '📈' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Navigation */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/merchant/dashboard" className="text-xl font-bold text-gray-900 dark:text-white">
                                Merchant Portal
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/"
                                className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                            >
                                Visit Storefront
                            </Link>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Welcome, {auth.user.name}
                            </span>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                                Logout
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white dark:bg-gray-800 shadow-sm min-h-screen border-r border-gray-200 dark:border-gray-700">
                    <div className="p-4">
                        <nav className="space-y-2">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    {header && (
                        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                                {header}
                            </div>
                        </header>
                    )}
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}