import { useState } from 'react';

interface FilterOption {
    id: string;
    name: string;
    count?: number;
}

interface ProductFiltersProps {
    categories?: FilterOption[];
    priceRange?: { min: number; max: number };
    onFiltersChange?: (filters: any) => void;
    className?: string;
}

export default function ProductFilters({ 
    categories = [], 
    priceRange = { min: 0, max: 10000 },
    onFiltersChange,
    className = ''
}: ProductFiltersProps) {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState(priceRange);
    const [sortBy, setSortBy] = useState('newest');

    const handleCategoryChange = (categoryId: string) => {
        const newSelected = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(id => id !== categoryId)
            : [...selectedCategories, categoryId];
        
        setSelectedCategories(newSelected);
        onFiltersChange?.({
            categories: newSelected,
            priceRange: selectedPriceRange,
            sortBy
        });
    };

    const handleSortChange = (newSort: string) => {
        setSortBy(newSort);
        onFiltersChange?.({
            categories: selectedCategories,
            priceRange: selectedPriceRange,
            sortBy: newSort
        });
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedPriceRange(priceRange);
        setSortBy('newest');
        onFiltersChange?.({
            categories: [],
            priceRange: priceRange,
            sortBy: 'newest'
        });
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-6">
                <p className="text-purple-800 dark:text-purple-200 font-medium mb-2">
                    🔍 Template Component - Product Filters
                </p>
                <p className="text-purple-700 dark:text-purple-300 text-sm">
                    This is a reusable product filters component. Customize the filter options, 
                    styling, and functionality based on your product catalog needs.
                </p>
            </div>

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
                <button
                    onClick={clearFilters}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    Clear All
                </button>
            </div>

            {/* Sort Options */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                </label>
                <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                    <option value="newest">Newest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                </select>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Categories
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {categories.map((category) => (
                            <label key={category.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category.id)}
                                    onChange={() => handleCategoryChange(category.id)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    {category.name}
                                    {category.count !== undefined && (
                                        <span className="text-gray-500 dark:text-gray-400 ml-1">
                                            ({category.count})
                                        </span>
                                    )}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Price Range */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Price Range
                </label>
                <div className="space-y-2">
                    <input
                        type="range"
                        min={priceRange.min}
                        max={priceRange.max}
                        value={selectedPriceRange.min}
                        onChange={(e) => setSelectedPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                        className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>₱{selectedPriceRange.min}</span>
                        <span>₱{selectedPriceRange.max}</span>
                    </div>
                </div>
            </div>

            {/* Apply Filters Button */}
            <button
                onClick={() => onFiltersChange?.({
                    categories: selectedCategories,
                    priceRange: selectedPriceRange,
                    sortBy
                })}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
                Apply Filters
            </button>
        </div>
    );
}