import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/queries/useUsers';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { calculateDeliveryCharge, getStoreName } from '../utils/storeHelpers';
import { API_BASE_URL } from '../utils/api';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
    const { user } = useAuth();
    const { data: userProfile } = useUserProfile(); 
    const { t } = useLanguage();
    const { stores } = useData();
    const navigate = useNavigate();

    const currentUser = userProfile?.data || user;
    const hasCoins = currentUser?.coins > 0;
    const hasGoldProduct = cartItems.some(item => item.isGold);
    const baseDeliveryCharge = calculateDeliveryCharge(cartItems);
    const deliveryCharge = (hasCoins || hasGoldProduct) ? 0 : baseDeliveryCharge;
    const finalTotal = cartTotal + deliveryCharge;

    if (cartItems.length === 0) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-200">
                <div className="bg-[#2E5A2E]/5 dark:bg-[#2E5A2E]/10 p-8 rounded-full mb-8 animate-pulse-slow">
                    <ShoppingBag className="h-16 w-16 text-[#2E5A2E]" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3 text-center">
                    {t('Your cart is empty')}
                </h2>
                <Link
                    to="/store"
                    className="mt-4 inline-flex items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-full text-white bg-[#2E5A2E] transition-all duration-300 active:scale-95"
                >
                    {t('Start Shopping')}
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#E8EAEF] dark:bg-gray-900 flex flex-col transition-colors duration-200 relative overflow-hidden mx-auto max-w-md w-full my-auto pb-10">
            
            {/* Simple Header */}
            <div className="w-full px-5 py-4">
                <div className="max-w-md mx-auto flex items-center justify-between">
                     <button onClick={() => navigate(-1)} className="w-[42px] h-[42px] flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-900 dark:text-white transition-transform active:scale-95 border border-gray-100/50">
                         <ArrowLeft size={22} />
                     </button>
                     <h1 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight">{t('Cart')}</h1>
                     <div className="w-[42px]" /> {/* Spacer */}
                </div>
            </div>

            {/* Scrollable Container for Top Half */}
            <div className="flex-1 overflow-y-auto px-5 pt-2 pb-32 no-scrollbar">

                {/* Items */}
                <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-3xl p-3 flex gap-4 items-center relative shadow-[0_4px_20px_-5px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-700 transition-all duration-300">
                             {/* Image block */}
                             <div className="h-[90px] w-[100px] rounded-2xl overflow-hidden bg-[#F9FAFB] dark:bg-gray-800 flex-shrink-0 relative">
                                  <img 
                                      src={item.image || `${API_BASE_URL}/products/${item.id}/image`} 
                                      alt={item.title}
                                      className="h-full w-full object-cover" 
                                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'; }}
                                  />
                                  <div className="absolute top-0 left-0 flex flex-col items-start gap-0 z-10">
                                      {item.isGold && (
                                          <span className="bg-[#16A34A] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-br-lg shadow-sm mb-[1px]">
                                              {t('Free Delivery')}
                                          </span>
                                      )}
                                      {item.isFromAd && (
                                          <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-br-lg shadow-sm">
                                              {t('Offer')}
                                          </span>
                                      )}
                                  </div>
                             </div>
                             
                             {/* Content block */}
                             <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between h-[90px]">
                                  {/* Top row: Title and Trash */}
                                  <div className="flex justify-between items-start">
                                       <div className="flex-1 min-w-0 pr-2">
                                            <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white truncate">
                                                {item.title}
                                            </h3>
                                            <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                                                {getStoreName(item.storeId, stores) || "Homly Direct"}
                                            </p>
                                       </div>
                                       <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 mt-1 transition-colors">
                                            <Trash2 size={16} />
                                       </button>
                                  </div>

                                  {/* Bottom row: Price and Controls */}
                                  <div className="flex justify-between items-end mt-auto">
                                       <div className="flex flex-col">
                                            <div className="flex items-center gap-1.5">
                                                 <span className="text-[15px] font-bold text-gray-900 dark:text-white leading-none">
                                                     ₹ {(item.price * item.quantity).toFixed(0)}
                                                 </span>

                                            </div>
                                            <span className="text-[10px] text-gray-400 font-medium mt-1">
                                                {item.unit || "1 Unit"}
                                            </span>
                                       </div>

                                       <div className="flex items-center gap-3">
                                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-[#2E5A2E] hover:text-[#1E3A1E] active:scale-90 transition-transform">
                                                <Minus size={14} strokeWidth={2.5} />
                                            </button>
                                            <div className="w-8 h-8 rounded-full bg-[#2E5A2E] text-white flex items-center justify-center font-bold text-xs">
                                                {item.quantity}
                                            </div>
                                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-[#2E5A2E] hover:text-[#1E3A1E] active:scale-90 transition-transform">
                                                <Plus size={14} strokeWidth={2.5} />
                                            </button>
                                       </div>
                                  </div>
                             </div>
                        </div>
                    ))}
                </div>
                
                {/* Order Summary Integrated in Flow */}
                <div className="mt-4 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-700">
                     <div className="flex justify-between items-center mb-6">
                          <h2 className="text-[16px] font-bold text-gray-900 dark:text-white">{t('Payment')}</h2>
                          <span className="text-[12px] font-semibold text-gray-400">{cartItems.length} item{cartItems.length > 1 ? 's' : ''}</span>
                     </div>
    
                     <div className="space-y-4 mb-8">
                          <div className="flex justify-between items-center">
                               <span className="text-[14px] text-gray-400 font-medium">{t('Payment')}</span>
                               <span className="text-[15px] font-bold text-gray-900 dark:text-white">₹ {cartTotal.toFixed(0)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                               <span className="text-[14px] text-gray-400 font-medium">{t('Delivery')}</span>
                               {deliveryCharge === 0 ? (
                                   <span className="text-[15px] font-bold text-[#2E5A2E]">{t('FREE')}</span>
                               ) : (
                                   <span className="text-[15px] font-bold text-gray-900 dark:text-white">₹ {deliveryCharge.toFixed(0)}</span>
                               )}
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-50 dark:border-gray-700/50">
                               <span className="text-[15px] text-gray-500 font-medium">{t('Total')}</span>
                               <span className="text-[16px] font-bold text-gray-900 dark:text-white">₹ {finalTotal.toFixed(0)}</span>
                          </div>
                     </div>
    
                     <Link to="/checkout" className="w-full bg-black text-white rounded-full py-4 flex items-center justify-center font-normal text-[15px] active:scale-[0.98] transition-transform gap-2">
                           <span>{t('Proceed to Checkout')}</span>
                           <ShoppingBag size={20} />
                     </Link>
                </div>
                
            </div>
        </div>
    );
};

export default Cart;
