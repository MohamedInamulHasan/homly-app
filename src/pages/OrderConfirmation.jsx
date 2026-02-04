import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useData } from '../context/DataContext';
import { getStoreName } from '../utils/storeHelpers';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE_URL } from '../utils/api';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, ArrowLeft, ClipboardList, ShoppingBag, MapPin, Store, ChevronLeft } from 'lucide-react';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const { addOrder, stores } = useData();
    const { t } = useLanguage();
    const { setUser } = useAuth();
    const queryClient = useQueryClient();

    const { formData, cartItems, cartTotal, deliveryCharge } = location.state || {};
    const finalTotal = (cartTotal || 0) + (deliveryCharge || 0);

    if (!location.state) {
        return <Navigate to="/" replace />;
    }

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirmOrder = () => {
        setShowConfirmModal(true);
    };

    const confirmOrderAction = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        // Use provided delivery charge or default to 20
        const finalDeliveryCharge = deliveryCharge !== undefined ? deliveryCharge : 20;

        // Create order object matching backend schema
        const newOrder = {
            items: cartItems.map(item => ({
                product: item._id || item.id,
                name: item.title || item.name || 'Product', // Fallback for safety
                quantity: item.quantity,
                price: item.price,
                // SECURITY/PERFORMANCE: Strip base64 images to prevent "Request Entity Too Large" (413) errors on Vercel
                // Only send the image if it is a URL (Cloudinary/HTTP). 
                image: (item.image && item.image.length < 1000) ? item.image : null,
                storeId: item.storeId?._id || item.storeId || null,
                storeName: item.storeName || null, // Pass storeName for Ads
                unit: item.unit // Pass unit to backend
            })),

            subtotal: cartTotal,
            // FIX: If delivery is free (0) because of coins, we MUST send the underlying shipping cost (20)
            // to the backend so it detects "Shipping > 0" and triggers the coin deduction logic.
            // The backend will then waive the shipping (set to 0) and deduct the coin.
            // If we send 0, the backend assumes it's already free and skips coin deduction.
            shipping: finalDeliveryCharge === 0 ? 20 : finalDeliveryCharge,
            tax: 0,
            discount: 0,
            // If we send shipping 20, we must also send the total as if shipping was 20, so backend validation passes
            total: finalDeliveryCharge === 0 ? ((cartTotal || 0) + 20) : (finalTotal || ((cartTotal || 0) + finalDeliveryCharge)),
            shippingAddress: {
                name: formData.name,
                street: formData.address,
                city: formData.city,
                state: '',
                zip: formData.pincode,
                country: 'India',
                mobile: formData.mobile
            },
            paymentMethod: {
                type: 'Cash on Delivery',
                last4: ''
            },
            scheduledDeliveryTime: formData.deliveryTime ? (() => {
                console.log('🕐 formData.deliveryTime:', formData.deliveryTime);
                const today = new Date();
                const [hours, minutes] = formData.deliveryTime.split(':');
                today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                console.log('📅 Converted scheduledDeliveryTime:', today.toISOString());
                return today.toISOString();
            })() : null
        };

        console.log('📦 Creating order with data:', newOrder);
        console.log('⏰ scheduledDeliveryTime in order:', newOrder.scheduledDeliveryTime);

        try {
            const createdOrder = await addOrder(newOrder);
            console.log('✅ Order created successfully:', createdOrder);
            clearCart();
            setCreatedOrderId(createdOrder?._id || 'NEW');
            setShowConfirmModal(false);
            setShowSuccessModal(true);

            // Instant update: Deduct coin locally if used (AND not a Gold Product order)
            // Note: Backend also handles this check, but we update UI immediately
            const hasGoldProduct = cartItems.some(item => item.isGold);
            if (finalDeliveryCharge === 0 && deliveryCharge === 0 && !hasGoldProduct) {
                setUser(prev => ({ ...prev, coins: Math.max((prev?.coins || 0) - 1, 0) }));
                queryClient.invalidateQueries(['user-profile']);
            }

            // WhatsApp notification (Disabled as per user request to only have it in email)
            // sendWhatsAppNotification(createdOrder, formData, cartItems, finalTotal, finalDeliveryCharge);

            // Email notification is sent automatically from backend
        } catch (error) {
            console.error('❌ Failed to create order:', error);

            let errorMessage = t('Failed to place order. Please try again.');
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            alert(`${t('Error')}: ${errorMessage}`);
            setIsSubmitting(false);
        }
    };

    // Function to send WhatsApp notification to admin
    const sendWhatsAppNotification = (order, customerInfo, items, total, delivery) => {
        // Admin WhatsApp number
        const adminWhatsAppNumber = '919500171980'; // Format: country code + number (no + or spaces)

        // Format order details message
        const orderId = String(order._id || order.id).slice(-6).toUpperCase();
        const itemsList = items.map((item, index) =>
            `${index + 1}. ${item.name || item.title} x${item.quantity} - ₹${item.price}`
        ).join('\n');

        const deliveryTime = formData.deliveryTime ?
            `\n📅 *Scheduled Delivery:* ${new Date().toLocaleDateString()} at ${formData.deliveryTime}` : '';

        const deliveryText = delivery === 0 ? "FREE (Coin Applied)" : `₹${delivery}`;

        const message = `🛒 *NEW ORDER RECEIVED!*\n\n` +
            `📋 *Order ID:* #${orderId}\n\n` +
            `👤 *Customer Details:*\n` +
            `Name: ${customerInfo.fullName}\n` +
            `Mobile: ${customerInfo.mobile}\n` +
            `Address: ${customerInfo.address}, ${customerInfo.city}, ${customerInfo.zip}\n` +
            `${deliveryTime}\n\n` +
            `🛍️ *Items Ordered:*\n${itemsList}\n\n` +
            `💰 *Total Amount:* ₹${total.toFixed(0)}\n` +
            `(Subtotal: ₹${(total - delivery).toFixed(0)} + Delivery: ${deliveryText})\n\n` +
            `⏰ *Order Time:* ${new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })}\n\n` +
            `✅ Please confirm and process this order.`;

        // Encode message for URL
        const encodedMessage = encodeURIComponent(message);

        // WhatsApp URL
        const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodedMessage}`;

        // Automatically redirect to WhatsApp (opens WhatsApp app directly)
        // This happens immediately without asking permission
        setTimeout(() => {
            window.location.href = whatsappUrl;
        }, 1000); // Small delay to ensure order is saved first
    };

    const handleCloseSuccess = () => {
        // Always go to the orders list, as requested
        navigate('/orders');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 pb-24 transition-colors duration-200">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0 mb-6"
                >
                    <ChevronLeft className="text-gray-600 dark:text-white" size={24} />
                </button>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden mb-8">
                    <div className="bg-blue-600 p-8 text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg text-blue-600">
                            <ClipboardList size={40} />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">{t('Review Order')}</h1>
                        <p className="text-blue-100 text-lg">{t('Please review your details before confirming.')}</p>
                    </div>

                    <div className="p-8">
                        <div className="border-b border-gray-100 dark:border-gray-700 pb-8 mb-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('Order Summary')}</h2>
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center">
                                        <div className="flex-1 min-w-0 flex items-center gap-4">
                                            <div className={`h-16 w-16 rounded-xl bg-white overflow-hidden relative border ${item.isGold ? 'border-yellow-400 ring-2 ring-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]' : 'border-gray-100 dark:border-gray-700'}`}>
                                                <img
                                                    src={item.image || ((item._id || item.id || item.product) ? `${API_BASE_URL}/products/${item._id || item.id || item.product}/image` : "https://via.placeholder.com/150?text=No+Image")}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=No+Image'; }}
                                                />
                                                {/* Gold Badge */}
                                                {item.isGold && (
                                                    <div className="absolute top-0 left-0 right-0 h-4 bg-yellow-400/90 flex items-center justify-center z-10">
                                                        <span className="text-[8px] font-bold text-yellow-950 uppercase tracking-tighter">Gold Benefit</span>
                                                    </div>
                                                )}
                                                {(() => {
                                                    const unitText = item.unit;
                                                    if (!unitText) return null;
                                                    return (
                                                        <div className="absolute bottom-0 right-0 bg-gray-900/80 backdrop-blur-sm px-1.5 py-0.5 rounded-tl-md rounded-br-xl z-20">
                                                            <span className="text-[10px] font-bold text-white leading-none block">
                                                                {unitText}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {(() => {
                                                    const fullTitle = t(item, 'title') || item.title || item.name || t('Product');
                                                    const bracketMatch = fullTitle.match(/[(（\[\{]/);
                                                    const bracketIndex = bracketMatch ? bracketMatch.index : -1;

                                                    if (bracketIndex !== -1) {
                                                        const mainTitle = fullTitle.substring(0, bracketIndex).trim();
                                                        const bracketText = fullTitle.substring(bracketIndex).trim();

                                                        return (
                                                            <div className="flex flex-col min-w-0">
                                                                <p className="font-medium text-gray-900 dark:text-white truncate" title={mainTitle}>{mainTitle}</p>
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5" title={bracketText}>{bracketText}</span>
                                                            </div>
                                                        );
                                                    }

                                                    return <p className="font-medium text-gray-900 dark:text-white truncate" title={fullTitle}>{fullTitle}</p>;
                                                })()}
                                                {(item.storeId || item.storeName) && (
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <Store size={12} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {getStoreName(item.storeId, stores) || item.storeName}
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('Qty')}: {item.quantity}</p>
                                                    {/* Unit display moved to image overlay */}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">₹{((item.price * item.quantity) || 0).toFixed(0)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>{t('Subtotal')}</span>
                                <span>₹{(cartTotal || 0).toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>{t('Delivery Charge')}</span>
                                {(deliveryCharge === 0 || deliveryCharge === null) ? (
                                    <div className="text-right">
                                        <span className="font-medium text-green-600 dark:text-green-400">FREE</span>
                                        {cartItems.some(item => item.isGold) ? (
                                            <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center justify-end gap-1 font-bold">
                                                <span>⚡</span> Gold Member Benefit
                                            </p>
                                        ) : (
                                            <p className="text-xs text-yellow-600 dark:text-yellow-500 flex items-center justify-end gap-1">
                                                <span>🪙</span> Coin Applied
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <span>₹{(deliveryCharge || 20).toFixed(0)}</span>
                                )}
                            </div>
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900 dark:text-white">{t('Total')}</span>
                                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{finalTotal.toFixed(0)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <MapPin className="text-blue-600 dark:text-blue-400" size={20} />
                        {t('Shipping Details')}
                    </h2>
                    <div className="text-gray-600 dark:text-gray-300 space-y-1">
                        <p className="font-medium text-gray-900 dark:text-white">{formData.name}</p>
                        <p>{formData.address}</p>
                        <p>{formData.city}, {formData.pincode}</p>
                        <p>{t('Mobile')}: {formData.mobile}</p>
                    </div>

                    {/* Delivery Time Display */}
                    {formData.deliveryTime && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('Scheduled Delivery')}</p>
                                    <p className="font-semibold">
                                        {t('Today')} at {(() => {
                                            const [hours, minutes] = formData.deliveryTime.split(':');
                                            const date = new Date();
                                            date.setHours(parseInt(hours), parseInt(minutes));
                                            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                                        })()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Desktop Confirm Button */}
                <div className="hidden md:block">
                    <button
                        onClick={handleConfirmOrder}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 text-lg rounded-2xl font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/20 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                    >
                        {t('Place Order')}
                    </button>
                </div>
            </div>

            {/* Sticky Action Footer - Mobile Only */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 p-3 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-50 md:hidden pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                <div className="max-w-7xl mx-auto">
                    <button
                        onClick={handleConfirmOrder}
                        className="w-[90%] mx-auto block bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-4 text-sm md:py-4 md:px-6 md:text-lg rounded-2xl font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/20 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                    >
                        {t('Place Order')}
                    </button>
                </div>
            </div>

            {/* Confirmation Modal (Are you sure?) */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full p-8 transform transition-all scale-100 animate-bounce-subtle border border-gray-100 dark:border-gray-700">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-50 dark:bg-blue-900/40 mb-6 shadow-inner relative group">
                                <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping group-hover:animate-none"></div>
                                <ShoppingBag className="h-10 w-10 text-blue-600 dark:text-blue-400 relative z-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                {t('Ready to Wrap Up?')}
                            </h3>
                            <p className="text-base text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                                {t('You are just one step away from confirming your order. Do you want to proceed?')}
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3.5 text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    onClick={confirmOrderAction}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-lg shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {t('Processing')}
                                        </>
                                    ) : (
                                        t('Confirm Order')
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal (With Design) */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-green-500/20 backdrop-blur-md">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full p-8 transform transition-all scale-100 animate-bounce-subtle">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {t('Order Placed!')}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                {t('Your order has been placed successfully. Thank you for shopping with us!')}
                            </p>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('Order ID')}</p>
                                <p className="font-mono font-bold text-gray-900 dark:text-white text-lg">
                                    #{String(createdOrderId || '000').slice(-6).toUpperCase()}
                                </p>
                            </div>
                            <button
                                onClick={handleCloseSuccess}
                                className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-colors"
                            >
                                {t('Go to Orders')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderConfirmation;
