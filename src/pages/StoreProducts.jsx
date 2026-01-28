import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Phone, ChevronRight, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { isStoreOpen } from '../utils/storeHelpers';
import ProductCard from '../components/ProductCard';

const StoreProducts = () => {
    const { id } = useParams();
    const { products, stores, savedProducts } = useData();
    const { t } = useLanguage();
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const storeId = id;

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

    // Filter products to display based on selected subcategory
    const displayedProducts = selectedSubcategory
        ? storeProducts.filter(p => p.subcategory === selectedSubcategory)
        : storeProducts; // Show all products by default

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

                {/* Store Closed Banner */}
                {!storeIsOpen && (
                    <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={24} />
                        <div>
                            <p className="font-semibold text-red-900 dark:text-red-200">{t('Store Currently Closed')}</p>
                            <p className="text-sm text-red-700 dark:text-red-300">
                                {t('Opens at')} {store.openingTime || '9:00 AM'}
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{store.name}</h1>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                            <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                            <span>{store.address || t('No address available')}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                            <Clock className="h-4 w-4 mr-2 text-blue-500" />
                            <span>{store.timing || '9:00 AM - 9:00 PM'}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                            <Phone className="h-4 w-4 mr-2 text-blue-500" />
                            <span>{store.mobile || t('No phone number')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subcategories Scroller */}
            {subcategories.length > 0 && (
                <div className="mb-8 overflow-x-auto pb-4 scrollbar-hide">
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setSelectedSubcategory(null)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full border transition-all duration-300 ${!selectedSubcategory
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:text-blue-500'
                                }`}
                        >
                            <span className="font-medium whitespace-nowrap text-sm">{t('All')}</span>
                        </button>
                        {subcategories.map((sub, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedSubcategory(sub.name)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full border transition-all duration-300 ${selectedSubcategory === sub.name
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:text-blue-500'
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
                                {selectedSubcategory ? t(selectedSubcategory) : t('All Products')}
                            </h2>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                                {displayedProducts.length} {t('products')}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                            {displayedProducts.map((product) => (
                                <ProductCard key={product._id || product.id} product={product} showHeart={false} />
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
