import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Store,
    Newspaper,
    ShoppingBag,
    Users,
    Plus,
    Upload,
    Search,
    CheckCircle,
    XCircle,
    ChevronRight,
    MapPin,
    Phone,
    Mail,
    ArrowLeft,
    List,
    Menu,
    X,
    Edit2,
    Save,
    Pencil,
    Trash2,
    Image as ImageIcon,
    RefreshCw,
    Wrench,
    Zap,
    ClipboardList,
    Shield,
    Settings,
    Download,
    GripVertical,
    Truck,
    Copy,
    LogOut,
    Gift,
    Coins,
    AlertCircle,
    Power,
    ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService, API_BASE_URL } from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';
import StoreManagement from './StoreManagement';
import SettingsManagement from './SettingsManagement';
import ServiceManagement from './ServiceManagement';
import LogoutModal from '../../components/LogoutModal';
import DeliveryDashboard from './DeliveryDashboard';

const SidebarItem = ({ icon, label, id, active, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            active 
            ? 'bg-[#2E5A2E] text-white shadow-lg shadow-[#2E5A2E]/20' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
        }`}
    >
        {icon}
        <span className="font-medium text-sm">{label}</span>
    </button>
);

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();
    
    const isStoreAdmin = Array.isArray(user?.role) ? user?.role.includes('store_admin') : user?.role === 'store_admin';
    const isServiceAdmin = Array.isArray(user?.role) ? user?.role.includes('service_admin') : user?.role === 'service_admin';
    const isDeliveryBoy = Array.isArray(user?.role) ? user?.role.includes('delivery_boy') : user?.role === 'delivery_boy';
    const isAdmin = Array.isArray(user?.role) ? user?.role.includes('admin') : user?.role === 'admin';
    
    const defaultTab = isStoreAdmin ? 'stores' : isServiceAdmin ? 'services' : isDeliveryBoy ? 'orders' : 'products';
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Delivery Boy Redirect
    if (isDeliveryBoy) {
        return <DeliveryDashboard />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'stores':
                return <StoreManagement isAdmin={isAdmin} isStoreAdmin={isStoreAdmin} />;
            case 'services':
                return <ServiceManagement isAdmin={isAdmin} isServiceAdmin={isServiceAdmin} />;
            case 'settings':
                return <SettingsManagement />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                        <Package size={64} className="text-gray-300 mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Module</h2>
                        <p className="text-gray-500 mt-2">Accessing {activeTab}...</p>
                    </div>
                );
        }
    };

    return (
        <div className="h-screen bg-[#E8EAEF] dark:bg-gray-900 flex transition-colors duration-200 relative overflow-hidden">
            <LogoutModal 
                isOpen={showLogoutModal} 
                onClose={() => setShowLogoutModal(false)} 
                onConfirm={() => {
                    logout();
                    navigate('/login');
                }} 
            />

            {/* Mobile Menu Toggle */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-black text-white rounded-full shadow-2xl"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
                transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static flex flex-col
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <LayoutDashboard className="text-[#2E5A2E]" />
                        {t('Admin Panel')}
                    </h1>
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                    {(isAdmin || isStoreAdmin) && (
                        <SidebarItem
                            icon={<Store size={20} />}
                            label={t('Stores')}
                            id="stores"
                            active={activeTab === 'stores'}
                            onClick={setActiveTab}
                        />
                    )}
                    {(isAdmin || isServiceAdmin) && (
                        <SidebarItem
                            icon={<Wrench size={20} />}
                            label={t('Services')}
                            id="services"
                            active={activeTab === 'services'}
                            onClick={setActiveTab}
                        />
                    )}
                    {isAdmin && (
                        <SidebarItem
                            icon={<Settings size={20} />}
                            label={t('Settings')}
                            id="settings"
                            active={activeTab === 'settings'}
                            onClick={setActiveTab}
                        />
                    )}
                </nav>

                <div className="p-6 border-t border-gray-100 dark:border-gray-700">
                    <SidebarItem
                        icon={<LogOut size={20} />}
                        label={t('Logout')}
                        id="logout"
                        active={false}
                        onClick={() => setShowLogoutModal(true)}
                    />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-6 md:p-10">
                <div className="max-w-7xl mx-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
