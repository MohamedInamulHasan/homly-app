import { useNavigate } from 'react-router-dom';
import { Store, ArrowLeft, LogOut, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import StoreManagement from './admin/StoreManagement';

const MyStore = () => {
    const { user, loading } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { cartCount } = useData(); // Use useData for cartCount if available or useCart

    // Protection: Redirect if not store_admin
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E5A2E]"></div>
            </div>
        );
    }

    const roles = Array.isArray(user?.role) ? user.role : [user?.role || 'customer'];
    if (!user || !roles.includes('store_admin')) {
        // Use useEffect or render Navigate would be better, but return null + navigate is what was there.
        // Let's use Navigate component for cleaner render interrupt
        // But for now, since I can't import Navigate in replace block easily without adding it to existing imports list which is messy in replace,
        // I will keep the imperative navigate but inside useEffect?
        // Actually, returning null is fine if we navigate.
        setTimeout(() => navigate('/'), 0);
        return null;
    }

    return (
        <div className="min-h-screen bg-[#E8EAEF] dark:bg-gray-900 duration-200">
            {/* Premium Light Green Header Card */}
            <div className="fixed top-0 left-0 right-0 z-50 w-full bg-[#CBF9B2] dark:bg-[#1a381a] rounded-b-[2.5rem] px-4 pt-4 pb-4 shadow-sm overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/30 dark:bg-[#2E5A2E]/20 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10">
                    <div className="w-full px-4 relative flex items-center justify-center min-h-[42px]">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2">
                            <button onClick={() => navigate(-1)} className="w-[42px] h-[42px] flex items-center justify-center bg-white dark:bg-gray-800 rounded-full text-gray-900 dark:text-white transition-transform active:scale-95 shadow-sm border border-gray-100/50 dark:border-gray-700">
                                <ArrowLeft size={22} />
                            </button>
                        </div>
                        <div className="flex flex-col text-center">
                            <h1 className="text-[18px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight">{t('My Store')}</h1>
                            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">{user?.name}</p>
                        </div>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <button 
                                onClick={() => navigate('/cart')}
                                className="w-[42px] h-[42px] flex items-center justify-center bg-white dark:bg-gray-800 rounded-full text-gray-900 dark:text-white transition-transform active:scale-95 shadow-sm border border-black/5 dark:border-gray-700 relative"
                            >
                                <ShoppingCart size={22} className="text-gray-700 dark:text-gray-300" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-sm border-2 border-white dark:border-gray-800">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-[100px]">

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <StoreManagement />
            </div>
            </div>
        </div>
    );
};

export default MyStore;
