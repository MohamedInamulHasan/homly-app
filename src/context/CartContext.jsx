import { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../utils/api';
import { useData } from './DataContext';
import { useAuth } from './AuthContext';
import { isStoreOpen, calculateDeliveryCharge } from '../utils/storeHelpers';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    // Get current user ID from localStorage
    const getUserId = () => {
        try {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                const user = JSON.parse(userInfo);
                return user._id || user.id || 'guest';
            }
        } catch (e) {
            console.error('Failed to get user info:', e);
        }
        return 'guest';
    };

    const [userId, setUserId] = useState(getUserId());
    const { user } = useAuth();
    const [pendingProduct, setPendingProduct] = useState(null);
    const [showStoreWarning, setShowStoreWarning] = useState(false);
    const [nextStoreCharge, setNextStoreCharge] = useState(25);



    const [cartItems, setCartItems] = useState(() => {
        const currentUserId = getUserId();
        const cartKey = `cart_${currentUserId}`;

        // Clean up old cart data (migration)
        const oldCart = localStorage.getItem('cart');
        if (oldCart && !localStorage.getItem(cartKey)) {
            // If old cart exists and no user-specific cart, migrate it
            try {
                const oldItems = JSON.parse(oldCart);
                localStorage.setItem(cartKey, JSON.stringify(oldItems));
                localStorage.removeItem('cart'); // Remove old cart
            } catch (e) {
                console.error('Failed to migrate old cart:', e);
            }
        } else if (oldCart) {
            // Just remove the old cart if user already has a new one
            localStorage.removeItem('cart');
        }

        const localData = localStorage.getItem(cartKey);
        if (!localData) return [];

        try {
            const items = JSON.parse(localData);
            return items;
        } catch (e) {
            console.error('Failed to parse cart from localStorage:', e);
            return [];
        }
    });

    // Refresh cart data from backend on mount
    useEffect(() => {
        const refreshCartData = async () => {
            if (cartItems.length === 0) return;

            try {
                const updatedItems = await Promise.all(cartItems.map(async (item) => {
                    try {
                        const response = await apiService.getProduct(item.id);
                        const product = response.data;
                        if (!product) return item; // Keep existing if fetch fails

                        return {
                            ...item,
                            title: product.title || item.title,
                            price: product.price, // Update price if changed
                            image: product.image || (product.images && product.images.length > 0 ? product.images[0] : item.image), // Update image if changed, fallback to existing
                            unit: product.unit || item.unit || '', // update unit, keeping existing if backend misses it
                            storeId: product.storeId?._id || product.storeId || item.storeId,
                            isAvailable: product.isAvailable, // Update availability
                            isGold: product.isGold, // Update gold status
                            // Preserve ad-related fields from original cart item
                            isFromAd: item.isFromAd || false,
                            adTitle: item.adTitle || null,
                            storeName: item.storeName || product.storeName || null
                        };
                    } catch (err) {
                        console.warn(`Failed to refresh item ${item.id}`, err);
                        return item; // Keep existing on error
                    }
                }));

                // Only update if there are changes to avoid loop (JSON stringify comparison)
                if (JSON.stringify(updatedItems) !== JSON.stringify(cartItems)) {
                    setCartItems(updatedItems);
                }
            } catch (error) {
                console.error('Failed to refresh cart data:', error);
            }
        };

        refreshCartData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount

    // NEW: Auto-remove items if store closes or product becomes unavailable
    const { products, stores, loading } = useData();

    useEffect(() => {
        // Skip validation if data is still loading to prevent accidental clearing
        if (loading.products || loading.stores || products.length === 0) return;

        if (cartItems.length === 0) return;

        let itemsRemoved = false;
        const validatedItems = cartItems.filter(item => {
            // 1. Check Product Availability (using fresh data from DataContext)
            const freshProduct = products.find(p => (p._id || p.id) === item.id);
            if (freshProduct) {
                // If product exists, check its explicit availability status
                if (freshProduct.isAvailable === false) {
                    return false; // Remove: Product is toggled OFF
                }
            }
            // Note: If freshProduct is NOT found, we keep the item. 
            // It might be a momentary sync issue or product deleted (which is handled elsewhere/rarer).
            // Safest to only remove if we KNOW it's unavailable.

            // 2. Check Store Status
            const sId = item.storeId?._id || item.storeId;
            if (sId) {
                const store = stores.find(s => (s._id || s.id) === sId);
                // If store found and is CLOSED, remove item
                if (store && !isStoreOpen(store)) {
                    return false; // Remove: Store is CLOSED
                }
            }

            return true; // Keep item
        });

        if (validatedItems.length !== cartItems.length) {
            console.log('🧹 Cart cleanup: Removed unavailable items', cartItems.length - validatedItems.length);
            setCartItems(validatedItems);
            itemsRemoved = true;
        }

    }, [products, stores, loading, cartItems]);

    // Listen for user changes (login/logout)
    useEffect(() => {
        const handleStorageChange = () => {
            const newUserId = getUserId();
            if (newUserId !== userId) {
                setUserId(newUserId);
                // Load cart for new user
                const cartKey = `cart_${newUserId}`;
                const localData = localStorage.getItem(cartKey);
                if (localData) {
                    try {
                        const items = JSON.parse(localData);
                        setCartItems(items);
                    } catch (e) {
                        setCartItems([]);
                    }
                } else {
                    setCartItems([]);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        // Also listen for custom event when user logs in/out
        window.addEventListener('userChanged', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userChanged', handleStorageChange);
        };
    }, [userId]);

    useEffect(() => {
        try {
            const cartKey = `cart_${userId}`;
            localStorage.setItem(cartKey, JSON.stringify(cartItems));
        } catch (error) {
            console.error("Failed to save cart to localStorage:", error);
            // If quota exceeded, we could try to clear old items or just warn
            if (error.name === 'QuotaExceededError') {
                console.warn("LocalStorage quota exceeded. Cart changes may not be saved.");
            }
        }
    }, [cartItems, userId]);



    const addToCart = (product, force = false) => {
        const productId = product._id || product.id;
        const newStoreId = (product.storeId?._id || product.storeId || '').toString();

        if (!force && newStoreId && cartItems.length > 0) {
            const currentUniqueStores = new Set(
                cartItems.map(item => (item.storeId?._id || item.storeId || '').toString()).filter(Boolean)
            );

            if (!currentUniqueStores.has(newStoreId) && currentUniqueStores.size > 0) {
                const nextCharge = currentUniqueStores.size === 1 ? 25 : 30;
                setPendingProduct(product);
                setNextStoreCharge(nextCharge);
                setShowStoreWarning(true);
                return;
            }
        }

        // Create a lean object to save space
        const productToSave = {
            id: productId,
            title: product.title || product.name,
            price: product.price,
            image: product.image || (product.images && product.images.length > 0 ? product.images[0] : null),
            storeId: product.storeId || null, // Just save the storeId string
            quantity: 1,
            unit: product.unit || product.size || '',
            isGold: product.isGold || false,
            // Ad-related fields
            isFromAd: product.isFromAd || false,
            adTitle: product.adTitle || null,
            storeName: product.storeName || null
        };

        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === productId);
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevItems, productToSave];
        });
    };

    const confirmAddToCart = () => {
        if (pendingProduct) {
            addToCart(pendingProduct, true);
        }
        setShowStoreWarning(false);
        setPendingProduct(null);
    };

    const cancelAddToCart = () => {
        setShowStoreWarning(false);
        setPendingProduct(null);
    };

    const removeFromCart = (productId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === productId ? { ...item, quantity: quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartTotal = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

    const hasCoins = user?.coins > 0;
    const hasGoldProduct = cartItems.some(item => item.isGold);
    const baseDeliveryCharge = calculateDeliveryCharge(cartItems);
    const deliveryCharge = (hasCoins || hasGoldProduct) ? 0 : baseDeliveryCharge;

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        deliveryCharge,
        baseDeliveryCharge,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
            
            {/* Multi-Store Warning Popup Modal (Character mascot with speech bubble and blur background) */}
            {showStoreWarning && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none pointer-events-auto">
                    {/* Dark Blurred Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={cancelAddToCart} />
                    
                    {/* Modal Dialog */}
                    <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-300 overflow-hidden">
                        
                        {/* Layout: Character Mascot + Speech Bubble */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                            
                            {/* SVG of Vector Character Girl with Glasses, bow-tie wrap, yellow jacket */}
                            <div className="w-28 sm:w-32 flex-shrink-0">
                                <svg viewBox="0 0 160 200" className="w-full h-auto drop-shadow-md">
                                    {/* Hair (Back) */}
                                    <path d="M50 80 C30 90 30 130 50 150 C40 130 40 100 50 80 Z" fill="#3B2314" />
                                    <path d="M110 80 C130 90 130 130 110 150 C120 130 120 100 110 80 Z" fill="#3B2314" />
                                    
                                    {/* Face/Neck */}
                                    <path d="M72 110 L72 125 L88 125 L88 110 Z" fill="#C68B59" />
                                    <circle cx="80" cy="85" r="28" fill="#DFA375" />
                                    
                                    {/* Hair (Front Curly) */}
                                    <path d="M52 75 C45 50 115 50 108 75 C95 60 65 60 52 75 Z" fill="#4A2E1B" />
                                    <path d="M50 72 C40 85 45 110 55 115 C48 100 48 85 50 72 Z" fill="#4A2E1B" />
                                    <path d="M110 72 C120 85 115 110 105 115 C112 100 112 85 110 72 Z" fill="#4A2E1B" />
                                    
                                    {/* Red Head-wrap / Bow */}
                                    <path d="M48 65 Q80 50 112 65 L108 55 Q80 40 52 55 Z" fill="#E0533C" />
                                    <path d="M70 48 C60 32 73 25 78 43 C83 25 96 32 86 48 Z" fill="#E0533C" />
                                    
                                    {/* Glasses */}
                                    <rect x="58" y="76" width="18" height="14" rx="3" fill="none" stroke="#2B1A0F" strokeWidth="2.5" />
                                    <rect x="84" y="76" width="18" height="14" rx="3" fill="none" stroke="#2B1A0F" strokeWidth="2.5" />
                                    <line x1="76" y1="83" x2="84" y2="83" stroke="#2B1A0F" strokeWidth="2.5" />
                                    
                                    {/* Eyes */}
                                    <circle cx="67" cy="83" r="2.5" fill="#2B1A0F" />
                                    <circle cx="93" cy="83" r="2.5" fill="#2B1A0F" />
                                    
                                    {/* Nose & Smile */}
                                    <path d="M78 90 Q80 94 82 90" fill="none" stroke="#2B1A0F" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M72 99 Q80 106 88 99" fill="none" stroke="#2B1A0F" strokeWidth="2.5" strokeLinecap="round" />
                                    
                                    {/* Yellow Jacket & Orange Shirt */}
                                    <path d="M50 125 L110 125 L120 200 L40 200 Z" fill="#F4B843" />
                                    <path d="M68 125 L92 125 L98 200 L62 200 Z" fill="#E06A43" />
                                    {/* White stripes on shirt */}
                                    <line x1="68" y1="135" x2="92" y2="135" stroke="#FFFFFF" strokeWidth="2" opacity="0.3" />
                                    <line x1="66" y1="155" x2="94" y2="155" stroke="#FFFFFF" strokeWidth="2" opacity="0.3" />
                                    <line x1="64" y1="175" x2="96" y2="175" stroke="#FFFFFF" strokeWidth="2" opacity="0.3" />
                                    
                                    {/* Arm Gesturing Up/Right */}
                                    <path d="M102 145 C115 140 135 125 145 122 C148 121 150 124 146 127 C138 135 120 155 106 165 Z" fill="#DFA375" />
                                </svg>
                            </div>
                            
                            {/* Speech Bubble */}
                            <div className="relative flex-1 bg-[#FADBD8] dark:bg-red-950/40 text-gray-800 dark:text-gray-100 p-5 rounded-[2rem] border border-[#F5B7B1] dark:border-red-900 shadow-sm mt-3 sm:mt-0">
                                {/* Speech Bubble Arrow pointing to the left character */}
                                <div className="hidden sm:block absolute left-[-10px] top-12 w-0 h-0 border-t-[8px] border-t-transparent border-r-[10px] border-r-[#FADBD8] border-b-[8px] border-b-transparent" />
                                <div className="sm:hidden absolute top-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-b-[10px] border-b-[#FADBD8] border-r-[8px] border-r-transparent" />
                                
                                <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                                    Adding products from another store increases the delivery charge to <strong className="text-red-600 dark:text-red-400">₹{nextStoreCharge}</strong> (+₹5). Do you wish to proceed?
                                </p>
                            </div>
                            
                        </div>
                        
                        {/* Buttons Footer */}
                        <div className="flex gap-3 justify-end">
                            <button 
                                onClick={cancelAddToCart}
                                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-full text-xs sm:text-sm active:scale-95 transition-transform"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmAddToCart}
                                className="px-8 py-2.5 bg-[#FF6B00] text-white font-bold rounded-full text-xs sm:text-sm active:scale-95 transition-transform shadow-md"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CartContext.Provider>
    );
};
