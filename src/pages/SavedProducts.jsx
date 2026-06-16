import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SimpleProductCard from '../components/SimpleProductCard';
import { useStores } from '../hooks/queries/useStores';
import { isStoreOpen, isProductScheduled } from '../utils/storeHelpers';
import { sortProductsByGoldAndOpen } from '../utils/productSorting';
import { groupProducts } from '../utils/productGrouping';

const SavedProducts = () => {
    const navigate = useNavigate();
    const { savedProducts, loading, fastMode } = useData();
    const { data: rawStores = [] } = useStores();
    const stores = Array.isArray(rawStores) ? rawStores : (rawStores?.data || []);
    const { t } = useLanguage();

    if (loading.users) { // Assuming saved products loading is tied to user profile fetching or similar
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#E8EAEF] dark:bg-gray-900 transition-colors duration-200">
            {/* Premium Header (matching Address Page) */}
            <div className="fixed top-0 left-0 right-0 z-50 w-full bg-[#CBF9B2] rounded-b-[2.5rem] px-4 pt-4 pb-4 shadow-sm overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/30 dark:bg-[#CBF9B2]/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="max-w-7xl mx-auto px-2 relative min-h-[42px]">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2">
                            <button 
                                onClick={() => navigate(-1)} 
                                className="w-[42px] h-[42px] flex items-center justify-center bg-white dark:bg-white/80 rounded-full text-gray-900 dark:text-gray-900 transition-transform active:scale-95 shadow-sm border border-gray-100/50 dark:border-gray-200/50"
                            >
                                <ArrowLeft size={22} />
                            </button>
                        </div>
                        <div className="flex flex-col items-center text-center pt-1">
                            <h1 className="text-[18px] font-bold text-gray-900 dark:text-gray-900 tracking-tight leading-tight">{t('Saved Products')}</h1>
                            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-600 mt-0.5">{t('Your favorite items')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-[95px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

                {savedProducts.length === 0 ? (
                    <div className="text-center py-24 flex flex-col items-center">
                        <div className="w-32 h-32 bg-[#2E5A2E]/10 dark:bg-[#CBF9B2]/20 rounded-full flex items-center justify-center mb-8 shadow-sm">
                            <Bookmark className="text-[#2E5A2E] dark:text-[#CBF9B2]" size={56} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            {t('No saved products')}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto font-medium leading-relaxed">
                            {t('Products you mark as favorite will appear here for easy access.')}
                        </p>
                        <Link
                            to="/store"
                            className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-base font-bold rounded-full text-white dark:text-gray-900 bg-[#2E5A2E] dark:bg-[#CBF9B2] shadow-lg hover:shadow-xl transition-all active:scale-95"
                        >
                            {t('Browse Products')}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {groupProducts(sortProductsByGoldAndOpen(savedProducts, stores), stores)
                            .filter(product => {
                                if (product.isAvailable === false) return false;
                                return isProductScheduled(product);
                            })
                            .map((product) => {
                                // Ensure product is an object (in case populate failed or mixed types)
                                if (!product || typeof product !== 'object') return null;

                                if (fastMode) {
                                    return (
                                        <SimpleProductCard
                                            key={product._id || product.id}
                                            product={product}
                                            isFastPurchase={true}
                                            showSave={true}
                                        />
                                    );
                                }

                                return <ProductCard key={product._id || product.id} product={product} stores={stores} showCartControls={true} showHeart={true} />;
                            })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedProducts;
