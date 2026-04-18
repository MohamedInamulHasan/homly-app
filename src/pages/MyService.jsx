import { useNavigate } from 'react-router-dom';
import { Wrench, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ServiceManagement from './admin/ServiceManagement';

const MyService = () => {
    const { user, loading } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    // Protection: Redirect if not service_admin
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E5A2E]"></div>
            </div>
        );
    }

    const roles = Array.isArray(user?.role) ? user.role : [user?.role || 'customer'];
    if (!user || !roles.includes('service_admin')) {
        setTimeout(() => navigate('/'), 0);
        return null;
    }

    return (
        <div className="min-h-screen bg-[#E8EAEF] dark:bg-gray-900 duration-200">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#E8F5E9] dark:bg-[#2E5A2E]/20 rounded-lg">
                            <Wrench className="text-[#2E5A2E] dark:text-[#CBF9B2]" size={24} />
                        </div>
                        <h1 className="text-xl font-normal text-gray-900 dark:text-white">{t('My Service')}</h1>
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
                <ServiceManagement serviceAdminMode={true} myServiceId={user?.serviceId} />
            </div>
        </div>
    );
};

export default MyService;
