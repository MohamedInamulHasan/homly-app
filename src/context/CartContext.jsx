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
    };

    return (
        <CartContext.Provider value={value}>
            {children}
            
            {/* Multi-Store Warning Popup Modal (Character mascot with blur background) */}
            {showStoreWarning && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5 select-none pointer-events-auto">
                    {/* Dark Blurred Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={cancelAddToCart} />
                    
                    {/* Modal Dialog */}
                    <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 max-w-sm w-full text-center shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-300">
                        {/* Cute Delivery Mascot SVG */}
                        <div className="w-24 h-24 mx-auto mb-4 bg-orange-50 dark:bg-orange-950/20 rounded-full flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="w-16 h-16 animate-bounce">
                                <circle cx="50" cy="50" r="45" fill="#FFEFE6" />
                                <path d="M25 45 C25 25, 75 25, 75 45 Z" fill="#FF6B00" />
                                <rect x="45" y="20" width="10" height="8" rx="2" fill="#333" />
                                <circle cx="50" cy="53" r="23" fill="#FFD1B3" />
                                <circle cx="43" cy="50" r="3" fill="#333" />
                                <circle cx="57" cy="50" r="3" fill="#333" />
                                <path d="M44 58 Q50 64, 56 58" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
                                <circle cx="38" cy="55" r="2.5" fill="#FF9E9E" />
                                <circle cx="62" cy="55" r="2.5" fill="#FF9E9E" />
                                <rect x="72" y="55" width="15" height="15" rx="2" fill="#FF6B00" />
                            </svg>
                        </div>
                        
                        <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                            Multi-Store Order
                        </h3>
                        
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                            Adding products from another store increases the delivery charge to <strong className="text-[#FF6B00]">₹{nextStoreCharge}</strong> (+₹5). Do you wish to proceed?
                        </p>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={cancelAddToCart}
                                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-full text-xs sm:text-sm active:scale-95 transition-transform"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmAddToCart}
                                className="flex-1 py-3 bg-[#FF6B00] text-white font-bold rounded-full text-xs sm:text-sm active:scale-95 transition-transform shadow-md"
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
