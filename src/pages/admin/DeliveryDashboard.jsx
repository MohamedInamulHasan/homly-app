import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Package, 
    Search, 
    Truck, 
    CheckCircle, 
    Clock, 
    RotateCcw, 
    MapPin, 
    RefreshCw, 
    LogOut, 
    Menu, 
    X,
    ChevronRight,
    ChevronDown,
    ArrowLeft,
    ShoppingBag,
    ShoppingCart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useOrders, useUpdateOrderStatus } from '../../hooks/queries/useOrders';
import { useStores } from '../../hooks/queries/useStores';
import { getStoreName } from '../../utils/storeHelpers';
import { formatOrderDateTime, formatDeliveryTime } from '../../utils/dateUtils';
import { openExternalLink } from '../../utils/linkHelper';
import { API_BASE_URL } from '../../utils/api';
import LogoutModal from '../../components/LogoutModal';
import PullToRefreshLayout from '../../components/PullToRefreshLayout';

const DeliveryDashboard = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { t, language } = useLanguage();
    const { data: orders = [], isLoading: loadingOrders } = useOrders();
    const { data: stores = [] } = useStores();
    const { mutateAsync: updateOrderStatus } = useUpdateOrderStatus();
    
    const [activeTab, setActiveTab] = useState('Active');
    const [searchQuery, setSearchQuery] = useState('');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const tabs = ['All', 'Active', 'Completed', 'Cancelled'];

    const filteredOrders = orders.filter(order => {
        // 1. Tab Filter Logic (Supports 'All', 'Active', 'Completed', 'Cancelled' AND specific statuses)
        const matchesTab =
            activeTab === 'All' ? true :
                activeTab === 'Active' ? ['Processing', 'Shipped', 'Out for Delivery'].includes(order.status) :
                    activeTab === 'Completed' ? order.status === 'Delivered' :
                        activeTab === 'Cancelled' ? order.status === 'Cancelled' : 
                            order.status === activeTab; // Handle specific status like 'Out for Delivery' or 'Processing'

        if (!matchesTab) return false;

        // 2. Search Logic (applied within the active tab)
        if (searchQuery === '') return true;

        const q = searchQuery.toLowerCase();
        const orderId = String(order._id || order.id).toLowerCase();
        const customerName = (order.shippingAddress?.name || order.user || '').toLowerCase();
        const customerMobile = (order.shippingAddress?.mobile || '').toLowerCase();
        
        const matchesOrderId = orderId.includes(q);
        const matchesCustomer = customerName.includes(q) || customerMobile.includes(q);
        const matchesItems = order.items?.some(item => {
            const itemName = (item.name || item.adTitle || '').toLowerCase();
            const storeName = (item.storeName || item.storeId?.name || getStoreName(item.storeId, stores) || '').toLowerCase();
            return itemName.includes(q) || storeName.includes(q);
        });

        return matchesOrderId || matchesCustomer || matchesItems;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'text-[#2E5A2E] dark:text-[#8bc910] bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800';
            case 'Shipped':
            case 'Out for Delivery': return 'text-[#0284c7] dark:text-[#38bdf8] bg-[#f0f9ff] dark:bg-blue-900/20 border-[#bae6fd] dark:border-blue-800';
            case 'Processing': return 'text-[#b45309] dark:text-[#fbbf24] bg-[#fffbeb] dark:bg-amber-900/20 border-[#fde68a] dark:border-amber-800';
            case 'Cancelled': return 'text-[#dc2626] dark:text-[#f87171] bg-[#fef2f2] dark:bg-red-900/20 border-[#fecaca] dark:border-red-800';
            default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered': return <CheckCircle size={14} className="mr-1" />;
            case 'Shipped':
            case 'Out for Delivery': return <Truck size={14} className="mr-1" />;
            case 'Processing': return <Clock size={14} className="mr-1" />;
            case 'Cancelled': return <RotateCcw size={14} className="mr-1" />;
            default: return null;
        }
    };

    const updateStatus = async (id, newStatus) => {
        const confirmed = window.confirm(`${t('Are you sure you want to change status to')} ${t(newStatus)}?`);
        if (!confirmed) return;

        try {
            await updateOrderStatus({ id, status: newStatus });
        } catch (error) {
            console.error('Error updating status:', error);
            alert(t('Failed to update status'));
        }
    };

    return (
        <div className="min-h-screen bg-[#E8EAEF] dark:bg-gray-900 transition-colors duration-200 w-full relative pb-48">
            <LogoutModal 
                isOpen={showLogoutModal} 
                onClose={() => setShowLogoutModal(false)} 
                onConfirm={() => {
                    logout();
                    navigate('/login');
                }} 
            />

            {/* Header */}
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
                            <h1 className="text-[18px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight">{t('Delivery Panel')}</h1>
                            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">{t('Manage Orders')}</p>
                        </div>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <button 
                                onClick={() => setShowLogoutModal(true)}
                                className="w-[42px] h-[42px] flex items-center justify-center bg-white dark:bg-gray-800 rounded-full text-red-600 transition-transform active:scale-95 shadow-sm border border-black/5 dark:border-gray-700"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <PullToRefreshLayout>
                <div className="pt-[95px]">
                <div className="px-5 mt-2 max-w-3xl mx-auto">
                    {/* Dashboard Stats - Clickable Filters */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        {[
                            { id: 'Processing', label: 'Processing', count: orders.filter(o => o.status === 'Processing').length, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                            { id: 'Out for Delivery', label: 'Out for Delivery', count: orders.filter(o => o.status === 'Out for Delivery').length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                            { id: 'Delivered', label: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                            { id: 'Cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'Cancelled').length, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' }
                        ].map((stat) => (
                            <button 
                                key={stat.id} 
                                onClick={() => setActiveTab(stat.id)}
                                className={`flex-1 min-w-[140px] ${stat.bg} p-4 rounded-3xl border-2 transition-all active:scale-95 ${activeTab === stat.id ? 'border-current' : 'border-transparent shadow-sm'}`}
                            >
                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{t(stat.label)}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
                            </button>
                        ))}
                    </div>

                    {/* Search Pill */}
                    <div className="relative mb-6">
                        <input
                            type="text"
                            placeholder={t('Search ID, customer, item...')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-10 py-3.5 rounded-full border border-gray-100/50 dark:border-gray-700 bg-white dark:bg-gray-800 text-[14px] text-gray-900 dark:text-white focus:outline-none shadow-sm dark:placeholder-gray-500 transition-all duration-300"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="mb-6"></div>

                    {/* Orders List */}
                    <div className="space-y-4">
                        {loadingOrders ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 animate-pulse border border-gray-100 dark:border-gray-700 h-48" />
                                ))}
                            </div>
                        ) : filteredOrders.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 lg:gap-6 w-full">
                                {filteredOrders.map(order => (
                                    <div
                                        key={order._id || order.id}
                                        className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 group relative shadow-sm hover:shadow-md"
                                    >
                                        <div className="p-6">
                                            {/* Order ID & Date Header */}
                                            <div className="flex justify-between items-start gap-2 mb-4">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-[#2E5A2E] dark:text-[#8bc910] flex-shrink-0">
                                                        <Package size={18} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs md:text-sm font-bold text-gray-900 dark:text-white truncate">
                                                            #{String(order._id || order.id).slice(-6).toUpperCase()}
                                                        </p>
                                                        <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {formatOrderDateTime(order.createdAt || order.date)}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {/* EDITABLE STATUS TAG - ALWAYS EDITABLE FOR ACTIVE ORDERS */}
                                                <div className="flex-shrink-0 min-w-[130px] flex justify-end">
                                                    {['Delivered', 'Cancelled'].includes(order.status) ? (
                                                        <div className={`inline-flex items-center justify-center w-full px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold border transition-all shadow-sm ${getStatusColor(order.status)}`}>
                                                            {getStatusIcon(order.status)}
                                                            <span className="uppercase tracking-wider">{t(order.status)}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="relative w-full">
                                                            <select
                                                                value={order.status}
                                                                onChange={(e) => updateStatus(order._id || order.id, e.target.value)}
                                                                className={`w-full px-3 py-1.5 pr-8 rounded-full border text-[10px] md:text-xs font-bold transition-all outline-none shadow-sm cursor-pointer text-center appearance-none ${getStatusColor(order.status)}`}
                                                            >
                                                                <option value="Processing" disabled={order.status === 'Out for Delivery'}>{t('Processing')}</option>
                                                                <option value="Out for Delivery">{t('Out for Delivery')}</option>
                                                                <option value="Delivered">{t('Delivered')}</option>
                                                                <option value="Cancelled" disabled={order.status !== 'Processing'}>{t('Cancelled')}</option>
                                                            </select>
                                                            <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${getStatusColor(order.status).split(' ')[0]}`}>
                                                                <ChevronDown size={12} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Customer & Location */}
                                            <div className="mb-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                            {order.shippingAddress?.name || order.user}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {order.shippingAddress?.mobile || 'N/A'}
                                                        </p>
                                                        {order.shippingAddress?.location && (
                                                            <div className="flex flex-col">
                                                                <button
                                                                    onClick={() => openExternalLink(order.shippingAddress.location)}
                                                                    className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#2E5A2E] dark:text-[#7CA90E] hover:underline"
                                                                >
                                                                    <MapPin size={12} />
                                                                    {t('View Map')}
                                                                </button>
                                                                <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5 ml-4">
                                                                    {order.shippingAddress?.city || 'N/A'}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 mb-4">
                                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                                    {order.shippingAddress ? `${order.shippingAddress.street}, ${order.shippingAddress.city}` : t('No address provided')}
                                                </p>
                                            </div>

                                            {/* Order Details Link */}
                                            <button
                                                onClick={() => navigate(`/orders/${order._id || order.id}`)}
                                                className="w-full py-3.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-[13px] font-bold text-[#2E5A2E] dark:text-[#7CA90E] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm"
                                            >
                                                {t('View Items & Full Details')}
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <ShoppingBag size={24} className="text-gray-300" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t('No orders found')}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('No deliveries in this category.')}</p>
                            </div>
                        )}
                    </div>
                </div>
                </div>
            </PullToRefreshLayout>
        </div>
    );
};

export default DeliveryDashboard;
