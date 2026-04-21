import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SimpleProductCard from '../components/SimpleProductCard';
import { useStores } from '../hooks/queries/useStores';
import { isStoreOpen } from '../utils/storeHelpers';
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
            {/* Simple Header (matching Cart) */}
            <div className="w-full px-5 py-4">
                <div className="max-w-md mx-auto flex items-center justify-between">
                     <button onClick={() => navigate(-1)} className="w-[42px] h-[42px] flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-900 dark:text-white transition-transform active:scale-95 border border-gray-100/50">
                         <ArrowLeft size={22} />
                     </button>
                     <h1 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight">{t('Saved Products')}</h1>
                     <div className="w-[42px]" /> {/* Spacer for centering */}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-20">

                {savedProducts.length === 0 ? (
                    <div className="text-center py-24 flex flex-col items-center">
                        <div className="w-32 h-32 bg-[#2E5A2E]/10 dark:bg-[#2E5A2E]/20 rounded-full flex items-center justify-center mb-8 shadow-sm">
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
                            className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-base font-bold rounded-full text-white bg-[#2E5A2E] shadow-lg hover:shadow-xl transition-all active:scale-95"
                        >
                            {t('Browse Products')}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {groupProducts(sortProductsByGoldAndOpen(savedProducts, stores), stores)
                            .filter(product => {
                                // Manual check
                                if (product.isAvailable === false) return false;

                                // Timing check
                                if (product.useTimeLimit) {
                                    const now = new Date();
                                    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                                    const opening = product.openingTime || '00:00';
                                    const closing = product.closingTime || '23:59';
                                    
                                    if (opening <= closing) {
                                        if (currentTime < opening || currentTime > closing) return false;
                                    } else {
                                        // Overnights
                                        if (currentTime < opening && currentTime > closing) return false;
                                    }
                                }
                                return true;
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
