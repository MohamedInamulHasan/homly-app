import { useNavigate } from 'react-router-dom';
import { Store, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import StoreManagement from './admin/StoreManagement';

const MyStore = () => {
    const { user, loading } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    // Protection: Redirect if not store_admin
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user || user.role !== 'store_admin') {
        // Use useEffect or render Navigate would be better, but return null + navigate is what was there.
        // Let's use Navigate component for cleaner render interrupt
        // But for now, since I can't import Navigate in replace block easily without adding it to existing imports list which is messy in replace,
        // I will keep the imperative navigate but inside useEffect?
        // Actually, returning null is fine if we navigate.
        setTimeout(() => navigate('/'), 0);
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 duration-200">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Store className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('My Store')}</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                            {user?.name}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <StoreManagement />
            </div>
        </div>
    );
};

export default MyStore;
