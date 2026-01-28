import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, CreditCard, RotateCcw, Store } from 'lucide-react';
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
            case 'Delivered': return <CheckCircle size={20} className="mr-2" />;
            case 'Shipped': return <Truck size={20} className="mr-2" />;
            case 'Processing': return <Clock size={20} className="mr-2" />;
            case 'Cancelled': return <RotateCcw size={20} className="mr-2" />;
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 pb-24 transition-colors duration-200">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/orders')}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    {t('Back to Orders')}
                </button>

                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{t('Order Details')}</h1>
                            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 whitespace-nowrap">{t('Order')} #{String(order._id || order.id).slice(-6).toUpperCase()}</p>
                            {/* Order Placed Time */}
                            {order.createdAt && (
                                <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500 mt-1">
                                    {t('Placed on')} {new Date(order.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })} at {new Date(order.createdAt).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {t(order.status)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
                    <div className="p-6 border-b border-gray-50 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <Package size={20} className="mr-2 text-gray-400 dark:text-gray-500" />
                            {t('Items')}
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                        {order.items?.map((item, index) => (
                            <div key={index} className="p-6 flex items-start gap-4">
                                <div className="h-20 w-20 flex-shrink-0 rounded-xl bg-white overflow-hidden border border-gray-100 dark:border-gray-600 relative">
                                    <img
                                        src={(item.product?._id || item.product) ? `${API_BASE_URL}/products/${item.product?._id || item.product}/image` : (item.image || "https://via.placeholder.com/150?text=No+Image")}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Product"; }}
                                        loading="lazy"
                                    />
                                    {(() => {
                                        const unitText = item.unit || item.product?.unit;
                                        if (!unitText) return null;
                                        return (
                                            <div className="absolute bottom-0 right-0 bg-gray-900/80 backdrop-blur-sm px-1.5 py-0.5 rounded-tl-md rounded-br-xl z-10">
                                                <span className="text-[10px] font-bold text-white leading-none block">
                                                    {unitText}
                                                </span>
                                            </div>
                                        );
                                    })()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    {(() => {
                                        const fullTitle = item.name || '';
                                        const bracketIndex = fullTitle.indexOf('(');

                                        if (bracketIndex !== -1) {
                                            const mainTitle = fullTitle.substring(0, bracketIndex).trim();
                                            const bracketText = fullTitle.substring(bracketIndex).trim();

                                            return (
                                                <div className="mb-1">
                                                    <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm sm:text-base" title={mainTitle}>{mainTitle}</h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={bracketText}>{bracketText}</p>
                                                </div>
                                            );
                                        }

                                        return <h3 className="font-medium text-gray-900 dark:text-white mb-1 truncate text-sm sm:text-base" title={fullTitle}>{fullTitle}</h3>;
                                    })()}
                                    {item.storeId && (
                                        <div className="flex items-center gap-1 mb-1">
                                            <Store size={12} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {getStoreName(item.storeId, stores)}
                                            </p>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 mb-2">
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('Quantity')}: {item.quantity}</p>
                                        {/* Unit display moved to image overlay */}
                                    </div>
                                    <p className="font-semibold text-gray-900 dark:text-white">₹{Number(item.price || 0).toFixed(0)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Scheduled Delivery Time - Prominent Display */}
                    {order.scheduledDeliveryTime && (
                        <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-sm border-2 border-blue-200 dark:border-blue-800 p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-600 rounded-xl">
                                    <Clock size={24} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                                        {t('Scheduled Delivery Time')}
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {new Date(order.scheduledDeliveryTime).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-1">
                                        {new Date(order.scheduledDeliveryTime).toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shipping Address */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                            <MapPin size={20} className="mr-2 text-gray-400 dark:text-gray-500" />
                            {t('Shipping Address')}
                        </h2>
                        <address className="not-italic text-gray-600 dark:text-gray-300 space-y-1">
                            <p className="font-medium text-gray-900 dark:text-white">{order.shippingAddress?.name || 'N/A'}</p>
                            <p>{order.shippingAddress?.street || ''}</p>
                            <p>{order.shippingAddress?.city || ''}, {order.shippingAddress?.state || ''} {order.shippingAddress?.zip || ''}</p>
                            <p>{order.shippingAddress?.country || ''}</p>
                        </address>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                            <CreditCard size={20} className="mr-2 text-gray-400 dark:text-gray-500" />
                            {t('Payment Method')}
                        </h2>
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <span className="font-medium text-gray-900 dark:text-white mr-2">{order.paymentMethod?.type || t('Card')}</span>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('Order Summary')}</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>{t('Subtotal')}</span>
                            <span>₹{calculatedSubtotal.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>{t('Delivery Charge')}</span>
                            {Number(order.shipping) === 0 ? (
                                <div className="text-right">
                                    <span className="font-medium text-green-600 dark:text-green-400">FREE</span>
                                    <p className="text-xs text-yellow-600 dark:text-yellow-500 flex items-center justify-end gap-1">
                                        <span>🪙</span> Coin Applied
                                    </p>
                                </div>
                            ) : (
                                <span>₹{(Number(order.shipping) || 20).toFixed(0)}</span>
                            )}
                        </div>

                        {order.discount > 0 && (
                            <div className="flex justify-between text-green-600 dark:text-green-400">
                                <span>{t('Discount')}</span>
                                <span>-₹{Number(order.discount).toFixed(0)}</span>
                            </div>
                        )}
                        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between font-bold text-gray-900 dark:text-white text-lg">
                            <span>{t('Total')}</span>
                            {/* FIX: Recalculate total to be safe: Subtotal + Delivery - Discount */}
                            <span>₹{(
                                calculatedSubtotal +
                                (order.shipping !== undefined && order.shipping !== null ? Number(order.shipping) : 20) -
                                (Number(order.discount) || 0)
                            ).toFixed(0)}</span>
                        </div>
                    </div>
                </div>

                {/* Cancel Button - Footer Area */}
                {order.status === 'Processing' && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={() => setCancelConfirmation(true)}
                            className="w-full sm:w-auto px-8 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-bold text-base transition-colors border-2 border-red-100 dark:border-red-800 flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={20} />
                            {t('Cancel Order')}
                        </button>
                    </div>
                )}

                {/* Cancel Confirmation Modal */}
                {cancelConfirmation && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 transform transition-all scale-100">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('Cancel Order?')}</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                {t('Are you sure you want to cancel this order? This action cannot be undone.')}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setCancelConfirmation(false)}
                                    className="flex-1 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors"
                                >
                                    {t('No, Keep Order')}
                                </button>
                                <button
                                    onClick={confirmCancelOrder}
                                    className="flex-1 py-3 text-white bg-red-600 hover:bg-red-700 rounded-xl font-bold shadow-lg shadow-red-200 dark:shadow-red-900/20 transition-colors"
                                >
                                    {t('Yes, Cancel')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetails;
