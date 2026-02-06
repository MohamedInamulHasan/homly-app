import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/queries/useCategories';
import { useProducts } from '../hooks/queries/useProducts';
import { useStores } from '../hooks/queries/useStores';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { isStoreOpen } from '../utils/storeHelpers';
import { sortProductsByGoldAndOpen } from '../utils/productSorting';
import SimpleProductCard from '../components/SimpleProductCard';
import PullToRefreshLayout from '../components/PullToRefreshLayout';
import { ChevronLeft, Zap } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';
import ProductCard from '../components/ProductCard';

const CategoryProducts = () => {
    const { categoryName } = useParams();
    const { data: rawProducts = [], isLoading: productsLoading } = useProducts();
    const { data: rawStores = [], isLoading: storesLoading } = useStores();
    const { data: rawCategories = [] } = useCategories();
    const { t } = useLanguage();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const { fastMode, toggleFastMode } = useData(); // Use global state
    const navigate = useNavigate();

    const isLoading = productsLoading || storesLoading;

    const products = Array.isArray(rawProducts) ? rawProducts : (rawProducts?.data || []);
    const stores = Array.isArray(rawStores) ? rawStores : (rawStores?.data || []);
    const categories = Array.isArray(rawCategories) ? rawCategories : (rawCategories?.data || []);

    // Filter products by category AND search query
    const categoryProducts = products.filter(product => {
        const matchesCategory = product.category && product.category.toLowerCase() === categoryName?.toLowerCase();
        const matchesSearch = !searchQuery.trim() ||
            product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());

        // Consistent availability check
        const isAvailable = product.isAvailable !== false;

        return matchesCategory && matchesSearch && isAvailable;
    });

    // Helper to group products by name (Adapted from Home.jsx)
    const groupProductsByName = (productList) => {
        if (!productList) return [];
        const groups = {};

        productList.forEach(p => {
            const key = p.title?.trim().toLowerCase();
            if (!key) return;
            if (!groups[key]) groups[key] = [];
            groups[key].push(p);
        });

        const result = [];
        Object.values(groups).forEach(group => {
            if (group.length > 1) {
                // Sort group: Open stores first, then by price (low to high)
                group.sort((a, b) => {
                    const storeA = stores.find(s => (s._id || s.id) === (a.storeId?._id || a.storeId));
                    const storeB = stores.find(s => (s._id || s.id) === (b.storeId?._id || b.storeId));

                    // Default to TRUE (Open) if store is missing to match ProductCard logic
                    const isOpenA = storeA ? isStoreOpen(storeA) : true;
                    const isOpenB = storeB ? isStoreOpen(storeB) : true;

                    if (isOpenA && !isOpenB) return -1;
                    if (!isOpenA && isOpenB) return 1;
                    return Number(a.price) - Number(b.price);
                });

                const displayProduct = group[0];
                const prices = group.map(p => Number(p.price));
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);

                // Default to TRUE (Open) if store is missing
                const anyStoreOpen = group.some(p => {
                    const pStoreId = p.storeId?._id || p.storeId;
                    const pStore = stores.find(s => (s._id || s.id) === pStoreId);
                    return pStore ? isStoreOpen(pStore) : true;
                });

                result.push({
                    ...displayProduct,
                    isGroup: true,
                    storeCount: group.length,
                    anyStoreOpen: anyStoreOpen,
                    minPrice: minPrice,
                    maxPrice: maxPrice,
                    _id: `group-${displayProduct._id || displayProduct.id}`,
                    id: `group-${displayProduct._id || displayProduct.id}`,
                    maxPrice: maxPrice,
                    _id: `group-${displayProduct._id || displayProduct.id}`,
                    id: `group-${displayProduct._id || displayProduct.id}`
                });
            } else {
                result.push(group[0]);
            }
        });
        return result;
    };

    // Extract subcategories from the Category definition, fallback to products if missing
    const subcategories = useMemo(() => {
        // 1. Try to find the category definition
        const currentCategory = categories.find(c => c.name?.toLowerCase() === categoryName?.toLowerCase());

        // 2. If category has explicit subcategories, use them
        if (currentCategory?.subcategories && currentCategory.subcategories.length > 0) {
            return currentCategory.subcategories;
        }

        // 3. Fallback: unique subcategories from the category products (legacy behavior)
        const uniqueSubcategories = [...new Set(categoryProducts.map(p => p.subcategory).filter(Boolean))];
        return uniqueSubcategories.sort();
    }, [categories, categoryName, categoryProducts]);

    // Filter products based on selected subcategory
    const filteredBySubcategory = selectedSubcategory
        ? categoryProducts.filter(p => p.subcategory === selectedSubcategory)
        : categoryProducts;

    // Always group products by name
    const groupedList = groupProductsByName(filteredBySubcategory);
    const displayProducts = sortProductsByGoldAndOpen(groupedList, stores);

    // Get category image from first product
    const categoryImage = categoryProducts.length > 0 ? categoryProducts[0].image : null;

    return (
        <PullToRefreshLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-200">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                            <Link to="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0">
                                <ChevronLeft className="text-gray-600 dark:text-white" size={24} />
                            </Link>
                            {(() => {
                                const fullName = t(categoryName);
                                const bracketIndex = fullName.indexOf('(');

                                if (bracketIndex !== -1) {
                                    const mainName = fullName.substring(0, bracketIndex).trim();
                                    const bracketText = fullName.substring(bracketIndex).trim();

                                    return (
                                        <div className="flex flex-col min-w-0">
                                            <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent capitalize truncate leading-tight" title={mainName}>
                                                {mainName}
                                            </h1>
                                            <span className="text-sm text-gray-600 dark:text-gray-400 truncate leading-tight font-medium" title={bracketText}>
                                                {bracketText}
                                            </span>
                                        </div>
                                    );
                                }

                                return (
                                    <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent capitalize truncate" title={fullName}>
                                        {fullName}
                                    </h1>
                                );
                            })()}
                        </div>

                        <button
                            onClick={toggleFastMode}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-95 text-xs font-medium ${fastMode
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                                }`}
                        >
                            <Zap size={14} className={fastMode ? 'fill-white' : ''} />
                            <span>{fastMode ? t('Fast ON') : t('Fast')}</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar - Exactly like Home.jsx */}
                <div className="bg-white dark:bg-gray-800 py-4 shadow-sm border-t border-gray-100 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="relative">
                            <form
                                onSubmit={(e) => e.preventDefault()}
                                className="relative"
                            >
                                <div className="relative group">
                                    <input
                                        type="text"
                                        name="search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t('Search products...')}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-blue-100 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-md focus:shadow-xl transition-all duration-300"
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400 transition-transform group-focus-within:scale-110">
                                        <svg
                                            width="20"
                                            height="20"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth="2.5"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </form>

                            {/* Search Results Dropdown */}
                            {searchQuery.trim() && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-30">
                                    {(() => {
                                        const filteredDropdown = categoryProducts.slice(0, 5);

                                        if (filteredDropdown.length === 0) {
                                            return (
                                                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                                    {t('No products found')}
                                                </div>
                                            );
                                        }

                                        return filteredDropdown.map((product) => (
                                            <Link
                                                key={product._id || product.id}
                                                to={`/product/${product._id || product.id}`}
                                                onClick={() => setSearchQuery('')}
                                                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                            >
                                                <img
                                                    src={product.image || `${API_BASE_URL}/products/${product._id || product.id}/image`}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=No+Image'; }}
                                                    alt={product.title}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                                        {t(product, 'title')}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        ₹{Number(product.price).toFixed(0)}
                                                    </p>
                                                </div>
                                            </Link>
                                        ));
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Subcategories Scroller */}
                {subcategories.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 pb-2 shadow-sm border-b border-gray-100 dark:border-gray-700 mb-4 sticky top-[138px] z-10 transition-colors duration-200">
                        <div className="max-w-7xl mx-auto px-4 overflow-x-auto p-2 pb-4 scrollbar-hide -mx-2">
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setSelectedSubcategory(null)}
                                    className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${!selectedSubcategory
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:text-blue-600 dark:hover:text-blue-400'
                                        }`}
                                >
                                    <span className="whitespace-nowrap">{t('All')}</span>
                                </button>
                                {subcategories.map((sub, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedSubcategory(sub)}
                                        className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${selectedSubcategory === sub
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:text-blue-600 dark:hover:text-blue-400'
                                            }`}
                                    >
                                        <span className="font-medium whitespace-nowrap text-sm">
                                            {t(sub)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-4 py-6">
                    {isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse flex flex-col h-full">
                                    <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl mb-3"></div>
                                    <div className="space-y-2 flex-grow">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-2"></div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : displayProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {displayProducts.map(product => {
                                // Use SimpleProductCard for:
                                // 1. Fast Mode (standard fast purchase styling)
                                // 2. Group Products (always use Simple to show price range/correct image)
                                if (fastMode || product.isGroup) {
                                    return (
                                        <SimpleProductCard
                                            key={product._id || product.id}
                                            product={product}
                                            isFastPurchase={fastMode}
                                        />
                                    );
                                }
                                return (
                                    <ProductCard
                                        key={product._id || product.id}
                                        product={product}
                                        showHeart={false}
                                        showCartControls={false}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <span className="text-4xl">🛍️</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {t('No products found')}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                {t('We couldn\'t find any products in this category.')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </PullToRefreshLayout>
    );
};

export default CategoryProducts;
