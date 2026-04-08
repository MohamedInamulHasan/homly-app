import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin, CreditCard, RotateCcw, Store, ChevronLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiService, API_BASE_URL } from '../utils/api';
import { getStoreName } from '../utils/storeHelpers';
import LoadingSpinner from '../components/LoadingSpinner';
import CancelOrderModal from '../components/CancelOrderModal';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { orders, loading, stores, cancelOrder, setIsFooterHidden } = useData();
    const { user, refreshUser } = useAuth();
    const [cancelConfirmation, setCancelConfirmation] = useState(false);

    // Hide footer when cancel confirmation modal is open
    useEffect(() => {
        setIsFooterHidden(cancelConfirmation);
        return () => setIsFooterHidden(false); // Cleanup on unmount
    }, [cancelConfirmation, setIsFooterHidden]);

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
    if (!order && (loading.orders || loadingSingle)) {
        return <LoadingSpinner />;
    }

    // Calculate subtotal dynamically from items to ensure accuracy
    const calculatedSubtotal = order?.items?.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0) || 0;

    if (!order) {
        return (
            <div className="min-h-screen bg-[#E8EAEF] dark:bg-gray-900 transition-colors duration-200 mx-auto max-w-md w-full relative pb-48 flex flex-col items-center justify-center p-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('Order not found')}</h2>
                <button
                    onClick={() => navigate('/orders')}
                    className="text-[#7CA90E] dark:text-[#8bc910] font-bold flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-full shadow-sm"
                >
                    <ArrowLeft size={20} />
                    {t('Back to Orders')}
                </button>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'text-[#16a34a] dark:text-[#4ade80] bg-[#f0fdf4] dark:bg-green-900/20 border-[#bbf7d0] dark:border-green-800';
            case 'Shipped':
            case 'Out for Delivery': return 'text-[#0284c7] dark:text-[#38bdf8] bg-[#f0f9ff] dark:bg-blue-900/20 border-[#bae6fd] dark:border-blue-800';
            case 'Processing': return 'text-[#b45309] dark:text-[#fbbf24] bg-[#fffbeb] dark:bg-amber-900/20 border-[#fde68a] dark:border-amber-800';
            case 'Cancelled': return 'text-[#dc2626] dark:text-[#f87171] bg-[#fef2f2] dark:bg-red-900/20 border-[#fecaca] dark:border-red-800';
            default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered': return <CheckCircle size={20} />;
            case 'Shipped':
            case 'Out for Delivery': return <Truck size={20} />;
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
            { id: 'Out for Delivery', id2: 'Shipped', label: 'Out for Delivery', icon: Truck },
            { id: 'Delivered', label: 'Delivered', icon: CheckCircle },
        ];

        const statusOrder = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
        const currentIdx = statusOrder.indexOf(status === 'Cancelled' ? 'Processing' : status);

        return steps.map((step, idx) => ({
            ...step,
            completed: idx <= (currentIdx === 2 ? 1 : currentIdx >= 3 ? 2 : currentIdx) && status !== 'Cancelled',
            current: step.id === status || step.id2 === status
        }));
    };

    const timelineSteps = getTimelineSteps(order.status);

    return (
        <div className="min-h-screen bg-[#E8EAEF] dark:bg-gray-900 transition-colors duration-200 mx-auto max-w-md w-full relative pb-48">
            <div className="px-5 pt-8">
                {/* Header matching Profile & Cart */}
                <div className="flex items-center justify-between mb-8 mt-2">
                     <button 
                         onClick={() => {
                             const roles = Array.isArray(user?.role) ? user.role : [user?.role || 'customer'];
                             if (roles.includes('delivery_boy')) {
                                 navigate('/admin');
                             } else {
                                 navigate('/orders');
                             }
                         }}
                         className="w-[46px] h-[46px] flex items-center justify-center bg-white dark:bg-gray-800 rounded-full text-gray-900 dark:text-white transition-transform active:scale-95 shadow-sm border border-gray-100/50 dark:border-gray-700/50"
                     >
                         <ArrowLeft size={22} />
                     </button>
                     <h1 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight">{t('Order Details')}</h1>
                     <div className="w-[46px] h-[46px]" /> {/* Spacer */}
                </div>

                <div className="space-y-5">

                {/* Status Card & Timeline */}
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {/* Status Banner */}
                    <div className={`p-6 ${
                        order.status === 'Cancelled' ? 'bg-[#fef2f2] dark:bg-red-900/10' :
                        order.status === 'Delivered' ? 'bg-[#f0fdf4] dark:bg-green-900/10' :
                        order.status === 'Processing' ? 'bg-[#fffbeb] dark:bg-amber-900/10' :
                        'bg-[#f0f9ff] dark:bg-blue-900/10'
                        } flex items-center justify-between`}>
                        <div>
                            <p className="text-sm font-medium opacity-80 mb-1 dark:text-gray-300">
                                {t('Order ID')}: #{String(order._id || order.id).slice(-6).toUpperCase()}
                            </p>
                            <h2 className={`text-2xl font-black ${
                                order.status === 'Cancelled' ? 'text-[#dc2626] dark:text-[#f87171]' :
                                order.status === 'Delivered' ? 'text-[#16a34a] dark:text-[#4ade80]' :
                                order.status === 'Processing' ? 'text-[#b45309] dark:text-[#fbbf24]' :
                                'text-[#0284c7] dark:text-[#38bdf8]'
                                }`}>
                                {t(order.status)}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </p>
                        </div>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            order.status === 'Cancelled' ? 'bg-[#fecaca] text-[#dc2626] dark:bg-red-900/30' :
                            order.status === 'Delivered' ? 'bg-[#bbf7d0] text-[#16a34a] dark:bg-green-900/30' :
                            order.status === 'Processing' ? 'bg-[#fde68a] text-[#b45309] dark:bg-amber-900/30' :
                            'bg-[#bae6fd] text-[#0284c7] dark:bg-blue-900/30'
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
                                    className="h-full bg-[#7CA90E] transition-all duration-1000 ease-out"
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
                                            ? 'bg-[#7CA90E] border-white dark:border-gray-800 text-white shadow-lg shadow-green-500/30'
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
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-50 dark:border-gray-700 flex items-center gap-2">
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-[#7CA90E] dark:text-[#8bc910]">
                            <Package size={18} />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{t('Items Ordered')}</h3>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                        {order.items?.map((item, index) => (
                            <div key={index} className="p-4 flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="h-16 w-16 bg-gray-50 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden flex-shrink-0 relative">
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
                                    {/* Status Tags */}
                                    <div className="absolute top-0 left-0 flex flex-col items-start gap-0 z-10">
                                        {((item.isGold) || (item.product && item.product.isGold)) && (
                                            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-br-lg shadow-sm mb-[1px]">
                                                {t('Free')}
                                            </span>
                                        )}
                                        {item.isFromAd && !item.isGold && !(item.product && item.product.isGold) && (
                                            <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-br-lg shadow-sm">
                                                {t('Offer')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    {(() => {
                                        const fullName = item.adTitle || item.name;
                                        const bracketIndex = fullName.indexOf('(');
                                        // Use line-clamp-2 for ads to show full title, truncate for regular items
                                        const titleClass = item.isFromAd ? 'line-clamp-2' : 'truncate';

                                        return (
                                            <h4 className={`font-medium text-gray-900 dark:text-white text-sm ${titleClass} mb-0.5`} title={fullName}>
                                                {fullName}
                                            </h4>
                                        );
                                    })()}

                                    {(item.storeId || item.storeName) && (
                                        <div className="flex items-center gap-1 mb-1">
                                            <p className="text-xs font-normal text-gray-500 dark:text-gray-400 truncate">
                                                {getStoreName(item.storeId, stores) || item.storeName}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-2">
                                            {(item.unit || item.product?.unit) && (
                                                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                                                    {item.unit || item.product?.unit}
                                                </span>
                                            )}
                                            <div className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700/50 rounded-md text-xs font-normal text-gray-500 dark:text-gray-400 shrink-0">
                                                {item.quantity}
                                            </div>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white text-[15px]">₹{Number(item.price * item.quantity).toFixed(0)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Address Card - Now Full Width */}
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-full text-orange-600 dark:text-orange-400">
                            <MapPin size={18} />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{t('Delivery To')}</h3>
                    </div>
                    <address className="not-italic text-sm text-gray-600 dark:text-gray-300 pl-11">
                        <p className="font-bold text-gray-900 dark:text-white mb-1">{order.shippingAddress?.name || 'User'}</p>
                        <p className="leading-relaxed opacity-80 whitespace-pre-wrap">
                            {order.shippingAddress?.street}, {order.shippingAddress?.city} - {order.shippingAddress?.zip}
                        </p>
                        <p className="opacity-80 mt-1">
                            {t('Mobile')}: {order.shippingAddress?.mobile}
                        </p>
                        {order.shippingAddress?.location && (
                            <a
                                href={order.shippingAddress.location?.replace('maps?q=', 'maps/search/?api=1&query=') || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-50 dark:bg-green-900/30 text-[#7CA90E] dark:text-[#8bc910] rounded-xl text-xs font-bold hover:bg-green-100 dark:hover:bg-green-900/50 transition-all border border-green-100/50 dark:border-green-800"
                            >
                                <MapPin size={14} />
                                {t('View on Map')}
                            </a>
                        )}
                    </address>
                </div>

                {/* Price Breakdown */}
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 p-6">
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
                                        <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold flex items-center justify-end gap-1">
                                            {t('Free Delivery')}
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

            <CancelOrderModal 
                isOpen={cancelConfirmation} 
                onClose={() => setCancelConfirmation(false)} 
                onConfirm={confirmCancelOrder} 
            />
        </div>
    );
};

export default OrderDetails;
