import { Plus, Minus, Bookmark, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { getStoreName } from '../utils/storeHelpers';
import { API_BASE_URL } from '../utils/api';

const ProductCard = ({ product, showCartControls = true, showHeart = true }) => {
    const { addToCart, cartItems, updateQuantity } = useCart();
    const { savedProducts, toggleSaveProduct, stores } = useData();
    const { t } = useLanguage();

    const productId = product._id || product.id;
    const cartItem = cartItems.find(item => item.id === productId);
    const isSaved = savedProducts.some(p => (p._id || p.id || p) === productId);

    const handleToggleSave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaveProduct(productId);
    };

    const isAvailable = product.isAvailable !== false; // Default to true if undefined

    if (!isAvailable) return null; // Hide if unavailable


    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-gray-100 dark:border-gray-700 relative group ${!isAvailable ? 'opacity-75' : ''}`}>
            <Link to={`/product/${productId}`} className={`flex-1 block ${!isAvailable ? 'pointer-events-none' : ''}`}>
                <div className="relative pb-[100%] overflow-hidden bg-white">
                    <img
                        src={product.image || `${API_BASE_URL}/products/${productId}/image`}
                        alt={t(product, 'title')}
                        loading="lazy"
                        className={`absolute top-0 left-0 w-full h-full object-cover transform transition-transform duration-300 ${isAvailable ? 'group-hover:scale-105' : 'grayscale'}`}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'; }}
                    />
                    {/* Heart Button */}
                    {showHeart && (
                        <button
                            onClick={handleToggleSave}
                            className="absolute top-2 right-2 p-2 rounded-full bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 transition-colors shadow-sm z-10 pointer-events-auto"
                        >
                            <Bookmark
                                size={18}
                                className={`${isSaved ? 'text-blue-600 fill-current' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
                            />
                        </button>
                    )}
                    {/* Cart Quantity Badge - Always visible if in cart */}
                    {cartItem && cartItem.quantity > 0 && (
                        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1 z-20 pointer-events-none">
                            <Store size={12} className="hidden" /> {/* Hidden store icon to match height usage if needed, or use ShoppingCart */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                            {cartItem.quantity}
                        </div>
                    )}
                    {!isAvailable && (
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center backdrop-blur-[1px]">
                            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                                {t('Out of Stock')}
                            </span>
                        </div>
                    )}
                    {/* Unit Tag */}
                    {product.unit && (
                        <div className="absolute bottom-0 right-0 bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded-tl-lg z-10 pointer-events-none">
                            <span className="text-[10px] font-bold text-white leading-none block">
                                {product.unit}
                            </span>
                        </div>
                    )}
                </div>
                <div className="p-4 pb-0">
                    {(() => {
                        const fullTitle = t(product, 'title');
                        const bracketIndex = fullTitle.indexOf('(');
                        const isLongTitle = fullTitle.length > 25;

                        if (bracketIndex !== -1) {
                            const mainTitle = fullTitle.substring(0, bracketIndex).trim();
                            const bracketText = fullTitle.substring(bracketIndex).trim();

                            return (
                                <div className="mb-1">
                                    <h3 className={`font-semibold text-gray-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${isLongTitle ? 'text-sm' : 'text-base md:text-lg'}`} title={mainTitle}>
                                        {mainTitle}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={bracketText}>
                                        {bracketText}
                                    </p>
                                </div>
                            );
                        }

                        return (
                            <h3 className={`font-semibold text-gray-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1 ${isLongTitle ? 'text-sm' : 'text-base md:text-lg'}`} title={fullTitle}>
                                {fullTitle}
                            </h3>
                        );
                    })()}
                    {product.storeId && (
                        <div className="flex items-center gap-1 mt-1">
                            <Store size={12} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {getStoreName(product.storeId, stores)}
                            </p>
                        </div>
                    )}

                </div>
            </Link>
            {showCartControls && (
                <div className="p-4 pt-2 mt-auto">
                    <div className="flex flex-col gap-3">
                        <span className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400">₹{Number(product.price || 0).toFixed(0)}</span>
                        {cartItem && cartItem.quantity > 0 ? (
                            <div className="flex items-center justify-between w-full h-10 gap-2 bg-blue-600 rounded-lg px-1 shadow-sm" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => updateQuantity(productId, cartItem.quantity - 1)}
                                    className="w-8 h-8 flex items-center justify-center text-white hover:bg-blue-700/50 rounded-lg transition-colors focus:outline-none"
                                    aria-label="Decrease quantity"
                                    disabled={!isAvailable}
                                >
                                    <Minus size={18} />
                                </button>
                                <span className="font-bold text-white text-lg">{cartItem.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(productId, cartItem.quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center text-white hover:bg-blue-700/50 rounded-lg transition-colors focus:outline-none"
                                    aria-label="Increase quantity"
                                    disabled={!isAvailable}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => addToCart(product)}
                                disabled={!isAvailable}
                                className={`w-full h-10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center justify-center gap-2 ${isAvailable
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-500'
                                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }`}
                                aria-label={isAvailable ? "Add to cart" : "Out of stock"}
                            >
                                <Plus size={20} />
                                <span className="text-sm font-medium">{isAvailable ? 'Add' : 'Out of Stock'}</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
            {!showCartControls && (
                <div className="p-4 pt-2 mt-auto">
                    <span className="text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400">₹{Number(product.price || 0).toFixed(0)}</span>
                </div>
            )}
        </div>
    );
};

export default ProductCard;
