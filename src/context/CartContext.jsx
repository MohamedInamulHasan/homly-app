import { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../utils/api';
import { useData } from './DataContext';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { isStoreOpen, calculateDeliveryCharge, getStoreName } from '../utils/storeHelpers';

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
    const { t, language } = useLanguage();
    const [pendingProduct, setPendingProduct] = useState(null);
    const [showStoreWarning, setShowStoreWarning] = useState(false);
    const [nextStoreCharge, setNextStoreCharge] = useState(25);
    const [warningStoreNames, setWarningStoreNames] = useState('');
    const [newStoreName, setNewStoreName] = useState('');



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

        // Never show the multi-store warning for free (gold) products,
        // or when the cart already contains a free/gold product
        const isNewProductFree = product.isGold === true;
        const cartHasFreeProduct = cartItems.some(item => item.isGold);

        if (!force && !isNewProductFree && !cartHasFreeProduct && newStoreId && cartItems.length > 0) {
            const currentUniqueStores = new Set(
                cartItems.map(item => (item.storeId?._id || item.storeId || '').toString()).filter(Boolean)
            );

            if (!currentUniqueStores.has(newStoreId) && currentUniqueStores.size > 0) {
                const nextCharge = 20 + currentUniqueStores.size * 5;

                // Get names of existing stores in the cart
                const currentStoreIds = Array.from(currentUniqueStores);
                const storeNames = currentStoreIds.map(id => getStoreName(id, stores));
                let storesText = '';
                if (storeNames.length === 1) {
                    storesText = storeNames[0];
                } else if (storeNames.length === 2) {
                    storesText = `${storeNames[0]} and ${storeNames[1]}`;
                } else if (storeNames.length > 2) {
                    storesText = `${storeNames.slice(0, -1).join(', ')} and ${storeNames[storeNames.length - 1]}`;
                }

                const newStoreNameVal = getStoreName(newStoreId, stores) || 'another store';

                setWarningStoreNames(storesText);
                setNewStoreName(newStoreNameVal);
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

            {/* Multi-Store Warning — Simple speech bubble, right-center of screen */}
            {showStoreWarning && (
                <div className="fixed inset-0 z-[9999] select-none pointer-events-auto">
                    {/* Blurred backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        style={{ animation: 'msOverlayIn 0.2s ease-out forwards' }}
                        onClick={cancelAddToCart}
                    />

                    {/* Speech bubble — right side, vertically centered */}
                    <div
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                        style={{ animation: 'msBubblePop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards', opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Bubble tail on the right side (pointing right) */}
                        <div
                            className="absolute right-[-10px] top-1/3 w-0 h-0"
                            style={{
                                borderTop: '9px solid transparent',
                                borderBottom: '9px solid transparent',
                                borderLeft: '10px solid white',
                            }}
                        />

                        <div className="bg-white dark:bg-gray-900 rounded-[1.6rem] rounded-tr-sm px-5 py-4 shadow-2xl border border-gray-100 dark:border-gray-700 w-[240px]">
                            {/* Note label */}
                            <p className="text-[11px] font-bold text-orange-500 uppercase tracking-widest mb-1.5">
                                {t('Note!')}
                            </p>

                            {/* Message */}
                            <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 leading-snug mb-4">
                                {language === 'ta' ? (
                                    <>
                                        நீங்கள் ஏற்கனவே <span className="text-orange-500 font-black">{warningStoreNames}</span> கடைகளில் இருந்து பொருட்களைச் சேர்த்துள்ளீர்கள். <span className="text-orange-500 font-black">{newStoreName}</span> இலிருந்து சேர்த்தால் ₹5 கூடுதலாக வசூலிக்கப்படும். சேர்க்கலாமா?
                                    </>
                                ) : (
                                    <>
                                        You already added products from <span className="text-orange-500 font-black">{warningStoreNames}</span>. If you add from <span className="text-orange-500 font-black">{newStoreName}</span>, it can take 5 rs extra. Can I add it?
                                    </>
                                )}
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={cancelAddToCart}
                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-xs active:scale-95 transition-transform"
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    onClick={confirmAddToCart}
                                    className="px-5 py-2 text-white font-extrabold rounded-xl text-xs active:scale-95 transition-transform shadow-md"
                                    style={{ background: 'linear-gradient(135deg, #FF6B00, #FF9D00)' }}
                                >
                                    {t('Yes, Add')}
                                </button>
                            </div>
                        </div>
                    </div>

                    <style>{`
                        @keyframes msOverlayIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        @keyframes msBubblePop {
                            from { transform: translateY(-50%) scale(0.7) translateX(20px); opacity: 0; }
                            to { transform: translateY(-50%) scale(1) translateX(0px); opacity: 1; }
                        }
                    `}</style>
                </div>
            )}
        </CartContext.Provider>
    );
};
