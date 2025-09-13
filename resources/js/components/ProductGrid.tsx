import { Link } from '@inertiajs/react';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    images?: string[];
    store: {
        name: string;
        slug: string;
    };
}

interface ProductGridProps {
    products: Product[];
    className?: string;
}

export default function ProductGrid({ products, className = '' }: ProductGridProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
            {products.length === 0 ? (
                <div className="col-span-full text-center py-12">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                        <p className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                            📦 Template Component - Product Grid
                        </p>
                        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                            This is a reusable product grid component. It will display products when they are passed as props.
                            Customize the layout, styling, and product information display as needed.
                        </p>
                    </div>
                </div>
            ) : (
                products.map((product) => (
                    <div key={product.id} className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-gray-200 dark:bg-gray-700">
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4">
                            <div className="mb-2">
                                <Link
                                    href={`/products/${product.slug}`}
                                    className="text-sm font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-2"
                                >
                                    {product.name}
                                </Link>
                            </div>
                            
                            <div className="mb-2">
                                <Link
                                    href={`/stores/${product.store.slug}`}
                                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    {product.store.name}
                                </Link>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(product.price)}
                                </span>
                                
                                <Link
                                    href={`/products/${product.slug}`}
                                    className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    View
                                </Link>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}