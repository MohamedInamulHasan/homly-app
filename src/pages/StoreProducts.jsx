import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Phone, ChevronRight, AlertCircle, Zap, Search } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { isStoreOpen } from '../utils/storeHelpers';
import { API_BASE_URL } from '../utils/api';
import ProductCard from '../components/ProductCard';
import SimpleProductCard from '../components/SimpleProductCard';

const StoreProducts = () => {
    const { id } = useParams();
    const { products, stores, fastMode, toggleFastMode } = useData();
    const { t } = useLanguage();
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const storeId = id;
    const navigate = useNavigate();

    // Find store and its products
    const store = stores.find(s => (s._id || s.id) === storeId);

    // Filter products for this store
    // Ensure we handle both string and number ID comparisons, and populated storeId objects
    const storeProducts = useMemo(() => {
        return products.filter(p => {
            // Handle both populated storeId (object with _id) and direct ID reference
            const pStoreId = p.storeId?._id || p.storeId;
            const targetId = storeId;

            // Loose comparison to catch '1' vs 1, and also handle ObjectId comparison
            return pStoreId == targetId || String(pStoreId) === String(targetId);
        });
    }, [products, storeId]);

    // Extract unique subcategories from the store's products
    const subcategories = useMemo(() => {
        const uniqueSubcategories = [...new Set(storeProducts.map(p => p.subcategory).filter(Boolean))]; // Filter out empty/null subcategories
        return uniqueSubcategories.map(sub => ({
            name: sub,
            count: storeProducts.filter(p => p.subcategory === sub).length
        })).sort(); // Sort alphabetically
    }, [storeProducts]);

    // Filter products to display based on selected subcategory and search query
    const filteredBySubcategory = selectedSubcategory
        ? storeProducts.filter(p => p.subcategory === selectedSubcategory)
        : storeProducts;

    const displayedProducts = searchQuery.trim()
        ? filteredBySubcategory.filter(p =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : filteredBySubcategory;

    if (!store) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('Store not found')}</h2>
                <Link to="/store" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-2">
                    <ArrowLeft size={20} />
                    {t('Back to Stores')}
                </Link>
            </div>
        );
    }

    const storeIsOpen = isStoreOpen(store);

    return (
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Header / Breadcrumbs */}
            <div className="mb-8">
                <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <Link to="/store" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {t('Stores')}
                    </Link>
                    <ChevronRight size={16} className="mx-2" />
                    <span className={!selectedSubcategory ? "font-semibold text-gray-900 dark:text-white" : ""}>
                        {store.name}
                    </span>
                    {selectedSubcategory && (
                        <>
                            <ChevronRight size={16} className="mx-2" />
                            <span className="font-semibold text-gray-900 dark:text-white cursor-pointer" onClick={() => setSelectedSubcategory(null)}>
                                {t(selectedSubcategory)}
                            </span>
                        </>
                    )}
                </nav>

                {/* Fast Mode & Search Bar */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">{store.name}</h1>
                        {/* Fast Mode Toggle */}
                        <button
                            onClick={toggleFastMode}
                            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 font-medium shadow-sm border ${fastMode
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-transparent'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                }`}
                            title={fastMode ? t('Fast Mode ON') : t('Fast Mode')}
                        >
                            <Zap size={14} className={fastMode ? 'fill-white' : ''} />
                            <span className="text-xs font-bold">{fastMode ? t('Fast ON') : t('Fast')}</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3 relative z-20">
                        {/* Search Bar */}
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('Search in store...')}
                                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 placeholder-gray-400 dark:placeholder-gray-500 shadow-md focus:shadow-xl transition-all duration-300 text-sm"
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400" size={18} />

                            {/* Search Results Dropdown */}
                            {searchQuery.trim() && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto overflow-x-hidden z-50">
                                    {(() => {
                                        const results = storeProducts.filter(p =>
                                            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
                                        ).slice(0, 5);

                                        if (results.length === 0) {
                                            return (
                                                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                    {t('No products found')}
                                                </div>
                                            );
                                        }

                                        return results.map(product => (
                                            <Link
                                                key={product._id || product.id}
                                                to={`/product/${product._id || product.id}`}
                                                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                                onClick={() => setSearchQuery('')}
                                            >
                                                <img
                                                    src={product.image || `${API_BASE_URL}/products/${product._id || product.id}/image`}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=No+Image'; }}
                                                    alt={product.title}
                                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{t(product, 'title')}</p>
                                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">₹{Number(product.price).toFixed(0)}</p>
                                                </div>
                                            </Link>
                                        ));
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Store Closed Banner (Moved here) */}
                    {!storeIsOpen && (
                        <div className="mt-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-center gap-3">
                            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
                            <div>
                                <p className="font-semibold text-red-900 dark:text-red-200 text-sm">{t('Store Closed')}</p>
                                <p className="text-xs text-red-700 dark:text-red-300">
                                    {t('Opens')} {store.openingTime || '9:00 AM'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Subcategories Scroller */}
            {subcategories.length > 0 && (
                <div className="mb-8 overflow-x-auto p-2 pb-4 scrollbar-hide -mx-2">
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setSelectedSubcategory(null)}
                            className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${!selectedSubcategory
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                        >
                            <span className="whitespace-nowrap">{t('All')}</span>
                        </button>
                        {subcategories.map((sub, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedSubcategory(sub.name)}
                                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${selectedSubcategory === sub.name
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                                    }`}
                            >
                                <span className="font-medium whitespace-nowrap text-sm">
                                    {t(sub.name)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div>
                {/* Products Grid */}
                {displayedProducts.length > 0 ? (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {selectedSubcategory ? t(selectedSubcategory) : (searchQuery ? t('Search Results') : t('All Products'))}
                            </h2>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                                {displayedProducts.length} {t('products')}
                            </span>
                        </div>
                        <div className={`grid gap-4 sm:gap-6 ${fastMode ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
                            {displayedProducts.map((product) => (
                                fastMode ? (
                                    <SimpleProductCard key={product._id || product.id} product={product} isFastPurchase={true} />
                                ) : (
                                    <ProductCard key={product._id || product.id} product={product} showHeart={false} showCartControls={false} />
                                )
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">{t('No products available at this store currently.')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoreProducts;
