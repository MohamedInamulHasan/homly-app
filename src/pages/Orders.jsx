import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Search, ChevronRight, Truck, CheckCircle, Clock, RotateCcw, ShoppingBag, Trash2, AlertTriangle, X, Store } from 'lucide-react';
import { useOrders, useDeleteOrder } from '../hooks/queries/useOrders';
import { useStores } from '../hooks/queries/useStores';
// import { useData } from '../context/DataContext'; // Removed dependency
import { getStoreName } from '../utils/storeHelpers';
import { useLanguage } from '../context/LanguageContext';
import { formatOrderDateTime, formatDeliveryTime } from '../utils/dateUtils';
import PullToRefreshLayout from '../components/PullToRefreshLayout';
import { API_BASE_URL } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Orders = () => {
    const navigate = useNavigate();
    const { data: orders = [], isLoading: loadingOrders } = useOrders();
    const { data: stores = [] } = useStores();
    const { mutate: deleteOrder } = useDeleteOrder();

    // const { orders, deleteOrder, stores } = useData(); // Refactored
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const activeTabElement = document.getElementById('active-order-tab');
        if (activeTabElement) {
            activeTabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [activeTab]);
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, orderId: null });



    const tabs = ['All', 'Active', 'Completed', 'Cancelled'];

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            searchQuery === '' ||
            String(order._id || order.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.items?.some(item => {
                const itemName = (item.name || item.adTitle || '').toLowerCase();
                const storeName = (item.storeName || item.storeId?.name || getStoreName(item.storeId, stores) || '').toLowerCase();
                const query = searchQuery.toLowerCase();
                return itemName.includes(query) || storeName.includes(query);
            });

        // If searching, ignore tab filter to find orders everywhere
        if (searchQuery !== '') return matchesSearch;

        const matchesTab =
            activeTab === 'All' ? true :
                activeTab === 'Active' ? ['Processing', 'Shipped'].includes(order.status) :
                    activeTab === 'Completed' ? order.status === 'Delivered' :
                        activeTab === 'Cancelled' ? order.status === 'Cancelled' : true;

        return matchesTab;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800';
            case 'Shipped':
            case 'Out for Delivery': return 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
            case 'Processing': return 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800';
            case 'Cancelled': return 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
            default: return 'text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered': return <CheckCircle size={16} className="mr-1.5" />;
            case 'Shipped':
            case 'Out for Delivery': return <Truck size={16} className="mr-1.5" />;
            case 'Processing': return <Clock size={16} className="mr-1.5" />;
            case 'Cancelled': return <RotateCcw size={16} className="mr-1.5" />;
            default: return null;
        }
    };

    const getCardBorderColor = (status) => {
        switch (status) {
            case 'Delivered': return 'border-l-green-500 dark:border-l-green-400 shadow-green-100 dark:shadow-green-900/20';
            case 'Shipped':
            case 'Out for Delivery': return 'border-l-blue-500 dark:border-l-blue-400 shadow-blue-100 dark:shadow-blue-900/20';
            case 'Processing': return 'border-l-amber-500 dark:border-l-amber-400 shadow-amber-100 dark:shadow-amber-900/20';
            case 'Cancelled': return 'border-l-red-500 dark:border-l-red-400 shadow-red-100 dark:shadow-red-900/20';
            default: return 'border-l-gray-300 dark:border-l-gray-600 shadow-gray-100 dark:shadow-gray-900/20';
        }
    };




    // Helper for emergency logout
    const handleEmergencyLogout = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('authToken');
        window.location.href = '/login';
    };

    // NO BLOCKING LOADER: Allow the page structure to render immediately
    // We handle 'loadingOrders' state inside the return block by showing a beautiful skeleton loader.

    return (
        <PullToRefreshLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 pb-24 transition-colors duration-200">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">{t('Order History')}</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium">{t('Manage and track your recent orders')}</p>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('Search orders, items or stores...')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-80 pl-11 pr-10 py-2.5 rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:shadow-lg transition-all duration-300"
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400" size={20} />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex overflow-x-auto p-2 pb-4 mb-4 scrollbar-hide gap-3 -mx-2">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                id={activeTab === tab ? "active-order-tab" : undefined}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${activeTab === tab
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-800 hover:text-blue-600'
                                    }`}
                            >
                                {t(tab)}
                            </button>
                        ))}
                    </div>

                    {/* Orders List */}
                    <div className="space-y-4">
                        {loadingOrders ? (
                            // Inline Loading State (Skeleton)
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
                                        <div className="flex gap-4 mb-4">
                                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                                            </div>
                                            <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between">
                                            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <div
                                    key={order._id || order.id}
                                    onClick={() => navigate(`/orders/${order._id || order.id}`)}
                                    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 border-l-4 overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group ${getCardBorderColor(order.status)}`}
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start gap-2 mb-4">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 flex-shrink-0">
                                                    <Package size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs md:text-sm font-semibold text-gray-900 dark:text-white truncate">#{String(order._id || order.id).slice(-6).toUpperCase()}</p>
                                                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {formatOrderDateTime(order.createdAt || order.date)}
                                                        {order.scheduledDeliveryTime && (
                                                            <span className="text-blue-600 dark:text-blue-400 ml-1">
                                                                • {formatDeliveryTime(order.scheduledDeliveryTime)}
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium border ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    <span className="ml-1">{t(order.status)}</span>
                                                </div>
                                                {!['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeleteConfirmation({ isOpen: true, orderId: order._id || order.id });
                                                        }}
                                                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title={t("Delete Order")}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="divide-y divide-gray-50 dark:divide-gray-700">
                                            {order.items?.slice(0, 2).map((item, idx) => (
                                                <div key={idx} className="py-3 flex items-center gap-3">
                                                    <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 dark:border-gray-700 overflow-hidden flex-shrink-0 relative">
                                                        <img
                                                            src={item.image && (item.image.startsWith('http') || item.image.startsWith('data:'))
                                                                ? item.image
                                                                : ((item.product?._id || item.product)
                                                                    ? `${API_BASE_URL}/products/${item.product._id || item.product}/image`
                                                                    : "https://via.placeholder.com/150?text=No+Image")}
                                                            alt={item.adTitle || item.name}
                                                            className="h-full w-full object-cover"
                                                            loading="lazy"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                if (item.image && item.image !== e.target.src) {
                                                                    e.target.src = item.image;
                                                                } else {
                                                                    e.target.src = "https://via.placeholder.com/150?text=No+Image";
                                                                }
                                                            }}
                                                        />
                                                        {/* Status Tags */}
                                                        <div className="absolute top-0 left-0 flex flex-col items-start gap-0 z-10">
                                                            {((item.isGold) || (item.product && item.product.isGold)) && (
                                                                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-[6px] font-bold px-1 py-px rounded-br-md shadow-sm mb-[1px]">
                                                                    Gold
                                                                </span>
                                                            )}
                                                            {item.isFromAd && !item.isGold && !(item.product && item.product.isGold) && (
                                                                <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[6px] font-bold px-1 py-px rounded-br-md shadow-sm">
                                                                    Offer
                                                                </span>
                                                            )}
                                                        </div>
                                                        {(() => {
                                                            const unitText = item.unit || item.product?.unit;
                                                            if (!unitText) return null;
                                                            return (
                                                                <div className="absolute bottom-0 right-0 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-tl-lg rounded-br-[11px] z-10 pointer-events-none shadow-[0_-2px_4px_rgba(0,0,0,0.05)] border-t border-l border-white/50">
                                                                    <span className="text-[9px] font-extrabold tracking-tight text-gray-900 leading-none block">
                                                                        {unitText}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-bold text-gray-900 dark:text-white ${item.isFromAd ? 'mb-1 leading-normal' : 'truncate'}`}>
                                                            {(() => {
                                                                const fullTitle = item.adTitle || item.name;
                                                                const bracketIndex = fullTitle?.indexOf('(');

                                                                if (bracketIndex !== -1) {
                                                                    const mainTitle = fullTitle.substring(0, bracketIndex).trim();
                                                                    const bracketText = fullTitle.substring(bracketIndex).trim();
                                                                    return (
                                                                        <>
                                                                            <span>{mainTitle}</span>
                                                                            <span className="font-normal text-gray-500 dark:text-gray-400 ml-1">{bracketText}</span>
                                                                        </>
                                                                    );
                                                                }
                                                                return fullTitle;
                                                            })()}
                                                        </p>
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <Store size={10} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                {item.storeId?.name || getStoreName(item.storeId, stores) || item.storeName || t('Unknown Store')}
                                                            </p>
                                                        </div>
                                                        <div className="mt-1">
                                                            <div className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-600 dark:text-gray-300 w-fit">
                                                                {item.quantity}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {order.items.length > 2 && (
                                                <div className="py-2 text-sm text-gray-500 dark:text-gray-400">
                                                    +{order.items.length - 2} {t('more items')}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{t('Total Amount')}</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">₹{order.total.toFixed(0)}</p>
                                            </div>
                                            <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                                                {t('View Details')}
                                                <ChevronRight size={16} className="ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShoppingBag size={24} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{t('No orders found')}</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">{t('Try adjusting your search or filter to find what you\'re looking for.')}</p>
                                <Link
                                    to="/"
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                                >
                                    {t('Start Shopping')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirmation.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all scale-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                                        <AlertTriangle size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('Delete Order')}</h3>
                                </div>
                                <button
                                    onClick={() => setDeleteConfirmation({ isOpen: false, orderId: null })}
                                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                {t('Are you sure you want to delete this order? This action cannot be undone.')}
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setDeleteConfirmation({ isOpen: false, orderId: null })}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors"
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    onClick={() => {
                                        if (deleteConfirmation.orderId) {
                                            deleteOrder(deleteConfirmation.orderId);
                                            setDeleteConfirmation({ isOpen: false, orderId: null });
                                        }
                                    }}
                                    className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium shadow-lg shadow-red-200 dark:shadow-red-900/20 transition-colors"
                                >
                                    {t('Delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PullToRefreshLayout>
    );
};

export default Orders;
