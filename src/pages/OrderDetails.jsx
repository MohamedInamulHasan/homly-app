import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, CreditCard, RotateCcw, Store, ChevronLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiService, API_BASE_URL } from '../utils/api';
import { getStoreName } from '../utils/storeHelpers';
import LoadingSpinner from '../components/LoadingSpinner';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { orders, loading, stores, cancelOrder } = useData();
    const { refreshUser } = useAuth();
    const [cancelConfirmation, setCancelConfirmation] = useState(false);

    const [singleOrder, setSingleOrder] = useState(null);
    const [loadingSingle, setLoadingSingle] = useState(true);

    // Try to find in context first, fallback to fetched single order
    const order = orders.find(o => (o._id || o.id) === id) || singleOrder;

    useEffect(() => {
        const foundInContext = orders.find(o => (o._id || o.id) === id);

        if (foundInContext) {
            setLoadingSingle(false);
            return;
        }

        // If context is still loading, wait
        if (loading.orders) {
            return;
        }

        // Not in context, fetch explicitly
        setLoadingSingle(true);
        apiService.getOrder(id)
            .then(res => {
                if (res.success && res.data) {
                    setSingleOrder(res.data);
                }
            })
            .catch(err => {
                console.error('Failed to fetch single order:', err);
            })
            .finally(() => {
                console.log('Order fetch attempt finished'); // Debug log
                setLoadingSingle(false);
            });
    }, [id, orders, loading.orders]);

    // Show spinner ONLY if we don't have the order AND we are loading.
    // If we have the order, show it immediately even if background refresh is happening.
    // Timeout safety for loading state
    const [showTimeout, setShowTimeout] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setShowTimeout(true), 8000); // Show help after 8 seconds
        return () => clearTimeout(timer);
    }, []);

    if (!order && (loading.orders || loadingSingle)) {
        if (showTimeout) {
            return (
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
                    <LoadingSpinner />
                    <p className="mt-4 text-gray-500 text-center">Loading is taking longer than expected...</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        {t('Reload Page')}
                    </button>
                    <Link to="/orders" className="mt-4 text-blue-600 hover:underline">
                        {t('Back to Orders List')}
                    </Link>
                </div>
            );
        }
        return <LoadingSpinner />;
    }

    // Calculate subtotal dynamically from items to ensure accuracy
    const calculatedSubtotal = order?.items?.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0) || 0;

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 transition-colors duration-200">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('Order not found')}</h2>
                <button
                    onClick={() => navigate('/orders')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-2"
                >
                    <ArrowLeft size={20} />
                    {t('Back to Orders')}
                </button>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800';
            case 'Shipped': return 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
            case 'Processing': return 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800';
            case 'Cancelled': return 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
            default: return 'text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered': return <CheckCircle size={20} />;
            case 'Shipped': return <Truck size={20} />;
            case 'Processing': return <Clock size={20} />;
            case 'Cancelled': return <RotateCcw size={20} />;
            default: return null;
        }
    };

    const confirmCancelOrder = async () => {
        try {
            // Use context method to update global state without reload
            const updatedOrder = await cancelOrder(order._id || order.id);

            if (updatedOrder) {
                if (singleOrder) {
                    setSingleOrder({ ...singleOrder, status: 'Cancelled' });
                }
                // Refresh user to update coin balance
                refreshUser();
                setCancelConfirmation(false);
            }
        } catch (error) {
            console.error('Failed to cancel order:', error);
            alert(t('Failed to cancel order. Please try again.'));
            setCancelConfirmation(false);
        }
    };

    // Timeline Helper
    const getTimelineSteps = (status) => {
        const steps = [
            { id: 'Processing', label: 'Order Placed', icon: Package },
            { id: 'Shipped', label: 'Out for Delivery', icon: Truck },
            { id: 'Delivered', label: 'Delivered', icon: CheckCircle },
        ];

        const statusOrder = ['Processing', 'Shipped', 'Delivered'];
        const currentIdx = statusOrder.indexOf(status === 'Cancelled' ? 'Processing' : status);

        return steps.map((step, idx) => ({
            ...step,
            completed: idx <= currentIdx && status !== 'Cancelled',
            current: step.id === status
        }));
    };

    const timelineSteps = getTimelineSteps(order.status);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 transition-colors duration-200">
            {/* Header Background */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-30">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/orders')}
                        className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <ChevronLeft className="text-gray-900 dark:text-white" size={24} />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">{t('Order Details')}</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

                {/* Status Card & Timeline */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {/* Status Banner */}
                    <div className={`p-6 ${order.status === 'Cancelled' ? 'bg-red-50 dark:bg-red-900/10' :
                        order.status === 'Delivered' ? 'bg-green-50 dark:bg-green-900/10' :
                            'bg-blue-50 dark:bg-blue-900/10'
                        } flex items-center justify-between`}>
                        <div>
                            <p className="text-sm font-medium opacity-80 mb-1 dark:text-gray-300">
                                {t('Order ID')}: #{String(order._id || order.id).slice(-6).toUpperCase()}
                            </p>
                            <h2 className={`text-2xl font-black ${order.status === 'Cancelled' ? 'text-red-600 dark:text-red-400' :
                                order.status === 'Delivered' ? 'text-green-600 dark:text-green-400' :
                                    'text-blue-600 dark:text-blue-400'
                                }`}>
                                {t(order.status)}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </p>
                        </div>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${order.status === 'Cancelled' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                            order.status === 'Delivered' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                                'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                            }`}>
                            {getStatusIcon(order.status)}
                        </div>
                    </div>

                    {/* Visual Timeline (Hidden for Cancelled) */}
                    {order.status !== 'Cancelled' && (
                        <div className="p-6 relative">
                            {/* Connecting Line */}
                            <div className="absolute top-[42px] left-6 right-6 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                                    style={{
                                        width: `${timelineSteps.filter(s => s.completed).length === 1 ? '0%' :
                                            timelineSteps.filter(s => s.completed).length === 2 ? '50%' : '100%'}`
                                    }}
                                />
                            </div>

                            <div className="relative flex justify-between">
                                {timelineSteps.map((step, idx) => (
                                    <div key={idx} className="flex flex-col items-center z-10">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${step.completed
                                            ? 'bg-blue-500 border-white dark:border-gray-800 text-white shadow-lg shadow-blue-500/30'
                                            : 'bg-white dark:bg-gray-700 border-gray-100 dark:border-gray-600 text-gray-300'
                                            }`}>
                                            <step.icon size={14} strokeWidth={3} />
                                        </div>
                                        <p className={`text-xs mt-2 font-bold text-center w-20 leading-tight ${step.completed
                                            ? 'text-gray-900 dark:text-white'
                                            : 'text-gray-400 dark:text-gray-600'
                                            }`}>
                                            {t(step.label)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Items Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-50 dark:border-gray-700 flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Package size={18} />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{t('Items Ordered')}</h3>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                        {order.items?.map((item, index) => (
                            <div key={index} className="p-4 flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div className={`h-16 w-16 bg-white rounded-xl overflow-hidden flex-shrink-0 border relative ${((item.isGold) || (item.product && item.product.isGold)) ? 'border-yellow-400 ring-2 ring-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]' : item.isFromAd ? 'border-orange-400 ring-2 ring-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'border-gray-200 dark:border-gray-600'}`}>
                                    <img
                                        src={item.image && (item.image.startsWith('http') || item.image.startsWith('data:'))
                                            ? item.image
                                            : ((item.product?._id || item.product)
                                                ? `${API_BASE_URL}/products/${item.product?._id || item.product}/image`
                                                : "https://via.placeholder.com/150?text=No+Image")}
                                        alt={item.adTitle || item.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Product"; }}
                                    />
                                    {/* Gold Badge */}
                                    {((item.isGold) || (item.product && item.product.isGold)) && (
                                        <div className="absolute top-0 left-0 right-0 h-4 bg-yellow-400/90 flex items-center justify-center z-10">
                                            <span className="text-[8px] font-bold text-yellow-950 uppercase tracking-tighter">{t('Gold Benefit')}</span>
                                        </div>
                                    )}
                                    {/* Special Offer Badge */}
                                    {item.isFromAd && !item.isGold && !(item.product && item.product.isGold) && (
                                        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center z-10">
                                            <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Special Offer</span>
                                        </div>
                                    )}
                                    {/* Unit Badge */}
                                    {(item.unit || item.product?.unit) && (
                                        <div className="absolute bottom-0 right-0 bg-black/60 backdrop-blur-[2px] px-1.5 py-0.5 rounded-tl-md text-[10px] font-bold text-white">
                                            {item.unit || item.product?.unit}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    {(() => {
                                        const fullName = item.adTitle || item.name;
                                        const bracketIndex = fullName.indexOf('(');
                                        // Use line-clamp-2 for ads to show full title, truncate for regular items
                                        const titleClass = item.isFromAd ? 'line-clamp-2' : 'truncate';

                                        // For special offers, show full title without bracket splitting
                                        if (item.isFromAd) {
                                            return (
                                                <h4 className={`font-bold text-gray-900 dark:text-white text-sm ${titleClass} mb-0.5`} title={fullName}>
                                                    {fullName}
                                                </h4>
                                            );
                                        }

                                        if (bracketIndex !== -1) {
                                            const mainName = fullName.substring(0, bracketIndex).trim();
                                            const bracketText = fullName.substring(bracketIndex).trim();

                                            return (
                                                <div className="mb-0.5">
                                                    <h4 className={`font-bold text-gray-900 dark:text-white text-sm ${titleClass}`} title={mainName}>
                                                        {mainName}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={bracketText}>
                                                        {bracketText}
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <h4 className={`font-bold text-gray-900 dark:text-white text-sm ${titleClass} mb-0.5`} title={fullName}>
                                                {fullName}
                                            </h4>
                                        );
                                    })()}

                                    {(item.storeId || item.storeName) && (
                                        <div className="flex items-center gap-1 mb-1">
                                            <Store size={10} className="text-gray-400" />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {getStoreName(item.storeId, stores) || item.storeName}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-600 dark:text-gray-300">
                                            {item.quantity} {item.unit || item.product?.unit ? `x ${item.unit || item.product?.unit}` : ''}
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white text-sm">₹{Number(item.price * item.quantity).toFixed(0)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Delivery & Address Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Delivery Time */}
                    {/* Delivery Time */}
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Clock size={100} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-2">{t('Scheduled Delivery')}</p>
                            <h3 className="text-2xl font-bold mb-1">
                                {order.scheduledDeliveryTime
                                    ? new Date(order.scheduledDeliveryTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                                    : t('Standard Delivery')}
                            </h3>
                            <p className="text-blue-100 font-medium">
                                {order.scheduledDeliveryTime
                                    ? new Date(order.scheduledDeliveryTime).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })
                                    : t('By End of Day')}
                            </p>
                        </div>
                    </div>

                    {/* Address Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-full text-orange-600 dark:text-orange-400">
                                <MapPin size={18} />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{t('Delivery To')}</h3>
                        </div>
                        <address className="not-italic text-sm text-gray-600 dark:text-gray-300 pl-11">
                            <p className="font-bold text-gray-900 dark:text-white mb-1">{order.shippingAddress?.name || 'User'}</p>
                            <p className="leading-relaxed opacity-80 whitespace-pre-wrap">
                                {order.shippingAddress?.street}, {order.shippingAddress?.city}
                            </p>
                            <p className="opacity-80">{order.shippingAddress?.zip}</p>
                        </address>
                    </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <CreditCard size={18} className="text-gray-400" />
                        {t('Payment Summary')}
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-gray-500 dark:text-gray-400">
                            <span>{t('Item Total')}</span>
                            <span className="font-medium text-gray-900 dark:text-white">₹{calculatedSubtotal.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500 dark:text-gray-400">
                            <span>{t('Delivery Fee')}</span>
                            {Number(order.shipping) === 0 ? (
                                order?.items?.some(item => item.isGold || (item.product && item.product.isGold)) ? (
                                    <div className="text-right">
                                        <span className="text-green-600 font-bold">{t('FREE')}</span>
                                        <p className="text-[10px] text-yellow-600 dark:text-yellow-400 font-bold flex items-center justify-end gap-1">
                                            <span>⚡</span> {t('Gold Benefit')}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-right">
                                        <span className="text-green-600 font-bold">{t('FREE')}</span>
                                        <p className="text-[10px] text-yellow-600 dark:text-yellow-500 font-medium flex items-center justify-end gap-1">
                                            <span>🪙</span> {t('Coin Applied')}
                                        </p>
                                    </div>
                                )
                            ) : (
                                <span className="font-medium text-gray-900 dark:text-white">₹{Number(order.shipping || 20).toFixed(0)}</span>
                            )}
                        </div>
                        {order.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>{t('Discount')}</span>
                                <span>-₹{Number(order.discount).toFixed(0)}</span>
                            </div>
                        )}
                        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 mt-3 pt-3 flex justify-between items-end">
                            <span className="font-bold text-gray-900 dark:text-white">{t('Grand Total')}</span>
                            <span className="text-2xl font-black text-gray-900 dark:text-white">
                                ₹{(
                                    calculatedSubtotal +
                                    (order.shipping !== undefined && order.shipping !== null ? Number(order.shipping) : 20) -
                                    (Number(order.discount) || 0)
                                ).toFixed(0)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                {order.status === 'Processing' && (
                    <div className="pt-4">
                        <button
                            onClick={() => setCancelConfirmation(true)}
                            className="w-full py-4 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={18} />
                            {t('Cancel Order')}
                        </button>
                    </div>
                )}
            </div>

            {/* Cancel Confirmation Modal */}
            {cancelConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-200 slide-in-from-bottom-10 sm:slide-in-from-bottom-0">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <RotateCcw size={32} className="text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">{t('Cancel Order?')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm leading-relaxed">
                            {t('Are you sure you want to cancel? This action cannot be undone.')}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setCancelConfirmation(false)}
                                className="flex-1 py-3.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-2xl font-bold transition-colors"
                            >
                                {t('No, Keep')}
                            </button>
                            <button
                                onClick={confirmCancelOrder}
                                className="flex-1 py-3.5 text-white bg-red-600 hover:bg-red-700 rounded-2xl font-bold shadow-lg shadow-red-500/30 transition-colors"
                            >
                                {t('Yes, Cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetails;
