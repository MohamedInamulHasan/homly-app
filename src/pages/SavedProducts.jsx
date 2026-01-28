import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const SavedProducts = () => {
    const navigate = useNavigate();
    const { savedProducts, loading } = useData();
    const { t } = useLanguage();

    if (loading.users) { // Assuming saved products loading is tied to user profile fetching or similar
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bookmark className="text-blue-600 fill-current" size={28} />
                        {t('Saved Products')}
                    </h1>
                </div>

                {savedProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bookmark className="text-gray-400 dark:text-gray-600" size={48} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {t('No saved products')}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                            {t('Products you mark as favorite will appear here for easy access.')}
                        </p>
                        <Link
                            to="/store"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                            {t('Browse Products')}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {savedProducts.map((product) => {
                            // Ensure product is an object (in case populate failed or mixed types)
                            if (!product || typeof product !== 'object') return null;
                            return <ProductCard key={product._id || product.id} product={product} />;
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedProducts;
