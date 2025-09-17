import { User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LogIn, ShoppingCart, User as UserIcon } from 'lucide-react';
import { PropsWithChildren } from 'react';

interface StorefrontLayoutProps extends PropsWithChildren {
    header?: React.ReactNode;
}

export default function StorefrontLayout({ children, header }: StorefrontLayoutProps) {
    const { auth, cartCount, marketplaceName } = usePage().props as {
        auth?: { user: User };
        cartCount?: number;
        marketplaceName?: string;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Navigation */}
            <div
                className="relative bg-gradient-to-r from-blue-600 to-purple-600"
                style={{
                    minHeight: '400px',
                    backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/manila-gpt.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                {/* Navigation */}
                <nav className="relative z-10">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-20 items-center justify-between">
                            <div className="flex items-center space-x-8">
                                <Link
                                    href="/"
                                    className="flex items-center space-x-3 text-3xl text-white transition-colors hover:text-gray-200"
                                    style={{ fontFamily: 'var(--font-playfair)' }}
                                >
                                    <img src="/logo-candidate.svg" alt="Logo" className="h-8 w-8 brightness-0 invert filter" />
                                    <span className="font-bold">{marketplaceName || 'Marketplace'}</span>
                                </Link>
                                <div className="hidden space-x-8 md:flex">
                                    <Link
                                        href="/products"
                                        className="hover:bg-opacity-20 rounded-md px-4 py-2 text-lg font-medium text-white transition-all duration-200 hover:bg-white hover:text-gray-800"
                                    >
                                        Products
                                    </Link>
                                    <Link
                                        href="/stores"
                                        className="hover:bg-opacity-20 rounded-md px-4 py-2 text-lg font-medium text-white transition-all duration-200 hover:bg-white hover:text-gray-800"
                                    >
                                        Providers
                                    </Link>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                {auth?.user ? (
                                    <>
                                        <Link
                                            href="/cart"
                                            className="hover:bg-opacity-20 relative flex items-center space-x-2 rounded-md px-4 py-2 text-white transition-all duration-200 hover:bg-white hover:text-gray-800"
                                        >
                                            <ShoppingCart className="h-5 w-5" />
                                            <span className="font-medium">Cart</span>
                                            {cartCount !== undefined && cartCount > 0 && (
                                                <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                                    {cartCount > 99 ? '99+' : cartCount}
                                                </span>
                                            )}
                                        </Link>

                                        <a
                                            href="/orders"
                                            className="hover:bg-opacity-20 flex items-center space-x-2 rounded-md px-4 py-2 text-white transition-all duration-200 hover:bg-white hover:text-gray-800"
                                        >
                                            <ShoppingCart className="h-5 w-5" />
                                            <span className="font-medium">My Orders</span>
                                        </a>

                                        <a
                                            href="/logout-now"
                                            className="hover:bg-opacity-20 flex items-center space-x-2 rounded-md px-4 py-2 text-white transition-all duration-200 hover:bg-white hover:text-gray-800"
                                        >
                                            <UserIcon className="h-5 w-5" />
                                            <span className="font-medium">Logout</span>
                                        </a>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="inline-flex items-center space-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                                        >
                                            <LogIn className="h-4 w-4" />
                                            <span>Sign In</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Content */}
                <div className="relative z-10 flex items-center justify-center px-4 text-center sm:px-6 lg:px-8" style={{ minHeight: '320px' }}>
                    <div className="max-w-4xl">
                        <h1 className="mb-6 text-4xl font-bold text-white md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>
                            Welcome to {marketplaceName || 'Marketplace'}
                        </h1>
                        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-200 md:text-2xl">
                            Personal accident coverage from trusted insurance providers
                        </p>
                        {/* <div className="flex flex-col justify-center gap-4 sm:flex-row">
                            <Link
                                href="/products"
                                className="inline-flex items-center justify-center rounded-md bg-white px-8 py-4 text-lg font-medium text-gray-900 transition-all duration-200 hover:bg-gray-100 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:outline-none"
                            >
                                Products
                            </Link>
                            <Link
                                href="/stores"
                                className="inline-flex items-center justify-center rounded-md border-2 border-white bg-transparent px-8 py-4 text-lg font-medium text-white transition-all duration-200 hover:bg-white hover:text-gray-900 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:outline-none"
                            >
                                Explore Stores
                            </Link>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Header */}
            {header && (
                <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            {/* Main Content */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div>
                            <h3 className="text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-white">Company</h3>
                            <ul className="mt-4 space-y-4">
                                <li>
                                    <Link
                                        href="/about"
                                        className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                    >
                                        About
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/contact"
                                        className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                    >
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-white">Shop</h3>
                            <ul className="mt-4 space-y-4">
                                <li>
                                    <Link
                                        href="/products"
                                        className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                    >
                                        All Products
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/stores"
                                        className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                    >
                                        All Providers
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-white">Support</h3>
                            <ul className="mt-4 space-y-4">
                                <li>
                                    <Link
                                        href="/help"
                                        className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                    >
                                        Help Center
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
                        <p className="text-center text-base text-gray-400 dark:text-gray-500">
                            &copy; 2025 {marketplaceName || 'Marketplace'}. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
