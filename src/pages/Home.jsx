import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Zap, Bookmark, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx'; // Keep for now if other things need it, or remove if unused.
import { useCart } from '../context/CartContext';
import { useProducts } from '../hooks/queries/useProducts';
import { useAds } from '../hooks/queries/useAds';
import { useCategories } from '../hooks/queries/useCategories';
import { useStores } from '../hooks/queries/useStores';
import { useLanguage } from '../context/LanguageContext';
import { isStoreOpen } from '../utils/storeHelpers';
import { API_BASE_URL } from '../utils/api';
import SimpleProductCard from '../components/SimpleProductCard';
import PullToRefreshLayout from '../components/PullToRefreshLayout';

const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    // const [fastMode, setFastMode] = useState(false); // Using global state now

    // React Query Hooks
    const { data: rawProducts = [], isLoading: loadingProducts, error: errorProducts } = useProducts();
    const { fastMode, toggleFastMode } = useData();
    const { data: ads = [], isLoading: loadingAds } = useAds();
    const { data: rawCategories = [], isLoading: loadingCategories } = useCategories();
    const { data: rawStores = [] } = useStores();

    const categories = Array.isArray(rawCategories) ? rawCategories : (rawCategories?.data || []);
    const stores = Array.isArray(rawStores) ? rawStores : (rawStores?.data || []);

    // Map products from raw data (handling potential nesting)
    // Filter out unavailable products so they don't show up in groups or lists (even for Admins in client view)
    const products = (Array.isArray(rawProducts) ? rawProducts : (rawProducts?.data || []))
        .filter(p => p.isAvailable !== false);

    console.log('🏠 Home: Products Count:', products.length);
    console.log('🏠 Home: Loading:', loadingProducts);

    const { t } = useLanguage();
    const navigate = useNavigate();
    const { cartItems, savedProducts } = useCart();

    // Use ads from backend only
    const slides = (ads && ads.length > 0) ? ads : [];


    // Filter products to only show from open stores
    // TEMPORARILY DISABLED - Show all products regardless of store hours
    const openStoreProducts = (products && Array.isArray(products))
        ? products
        : [];

    /* Original code with store hours filter:
    const openStoreProducts = (products && Array.isArray(products) && stores)
        ? products.filter(product => {
            // Find the store for this product
            const productStoreId = product.storeId?._id || product.storeId;
            const productStore = stores.find(s => (s._id || s.id) === productStoreId);
            // Only include products from open stores
            return productStore && isStoreOpen(productStore);
        })
        : [];
    */

    // Helper to group products by name
    const groupProductsByName = (productList) => {
        if (!productList) return [];
        const groups = {};

        // Group by name
        productList.forEach(p => {
            const key = p.title?.trim().toLowerCase();
            if (!key) return;
            if (!groups[key]) groups[key] = [];
            groups[key].push(p);
        });

        const result = [];
        Object.values(groups).forEach(group => {
            if (group.length > 1) {
                // Create a "group" product
                // Select the first product to ensure stable rendering (no flickering)
                const displayProduct = group[0];

                // Calculate price range
                const prices = group.map(p => Number(p.price));
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);

                // Check if ANY store in this group is open
                const anyStoreOpen = group.some(p => {
                    const pStoreId = p.storeId?._id || p.storeId;
                    const pStore = stores.find(s => (s._id || s.id) === pStoreId);
                    return pStore ? isStoreOpen(pStore) : true;
                });

                result.push({
                    ...displayProduct,
                    isGroup: true,
                    storeCount: group.length,
                    anyStoreOpen: anyStoreOpen,
                    minPrice: minPrice,
                    maxPrice: maxPrice,
                    // Use a unique ID for the group
                    _id: `group-${displayProduct._id || displayProduct.id}`,
                    id: `group-${displayProduct._id || displayProduct.id}`
                });
            } else {
                result.push(group[0]);
            }
        });
        return result;
    };

    // Group products by category
    const groupedProducts = openStoreProducts.reduce((acc, product) => {
        const category = product.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {});

    // Auto-scroll functionality for hero slider
    useEffect(() => {
        const timer = setInterval(() => {
            const container = document.getElementById('hero-slider');
            if (container) {
                const scrollAmount = container.clientWidth;
                const maxScroll = container.scrollWidth - container.clientWidth;

                if (container.scrollLeft >= maxScroll) {
                    container.scrollTo({ left: 0, behavior: 'smooth' });
                    setCurrentSlide(0);
                } else {
                    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                    setCurrentSlide(prev => prev + 1);
                }
            }
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const handleScroll = (e) => {
        const container = e.target;
        const slideIndex = Math.round(container.scrollLeft / container.clientWidth);
        setCurrentSlide(slideIndex);
    };

    const scrollToSlide = (index) => {
        const container = document.getElementById('hero-slider');
        if (container) {
            container.scrollTo({
                left: index * container.clientWidth,
                behavior: 'smooth'
            });
            setCurrentSlide(index);
        }
    };

    const handleBuyAd = (ad) => {
        const item = {
            id: ad._id || ad.id,
            _id: ad._id || ad.id,
            title: ad.offerTitle || ad.title, // Prioritize offer title
            image: ad.image || `${API_BASE_URL}/ads/${ad._id || ad.id}/image`,
            price: Number(ad.price),
            storeName: ad.storeName,
            // If ad has a linked storeId, use it, otherwise keep it undefined
            storeId: ad.storeId,
            quantity: 1
        };

        navigate('/checkout', {
            state: {
                directPurchase: {
                    items: [item],
                    total: Number(ad.price)
                }
            }
        });
    };

    const allCategories = categories && categories.length > 0 ? categories : [];

    // LOADING STATE: Removed blocking spinner. Now we show the layout immediately.
    // The spinner will appear inside the product lists instead.

    /* 
    if (loadingProducts && products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 animate-pulse">{t('Loading products...')}</p>
                <p className="text-xs text-red-500 mt-2">
                    Debug: {loadingProducts ? 'Loading' : 'Loaded'} |
                    Items: {products?.length || 0} |
                    Error: {errorProducts ? errorProducts.message : 'None'}
                </p>
            </div>
        );
    } 
    */

    // Show error state if backend is unreachable
    if (!loadingProducts && products.length === 0 && errorProducts) {
        return (
            <PullToRefreshLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                    <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('No Internet Connection')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
                        {t('Please check your internet connection and try again.')}
                        <br />
                        <span className="text-sm font-mono mt-2 block bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            {errorProducts?.message || 'Network Error'}
                        </span>
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition"
                    >
                        {t('Retry Connection')}
                    </button>
                </div>
            </PullToRefreshLayout>
        );
    }

    return (
        <PullToRefreshLayout>
            <div className="space-y-6 pb-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-200 min-h-screen">
                {/* Hero Slider Skeleton or Content */}
                {loadingAds ? (
                    <div className="w-full h-[250px] md:h-[500px] bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                ) : slides.length > 0 ? (
                    <section className="relative h-[250px] md:h-[500px] group overflow-hidden">
                        <div
                            id="hero-slider"
                            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full w-full"
                            onScroll={handleScroll}
                            style={{ scrollBehavior: 'smooth' }}
                        >
                            {slides.map((slide) => (
                                <div
                                    key={slide.id}
                                    className="min-w-full h-full relative snap-center"
                                >
                                    <img
                                        src={slide.image || `${API_BASE_URL}/ads/${slide._id || slide.id}/image`}
                                        alt={slide.title}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    {/* Gradient Overlay for better contrast */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

                                    {/* Buy Now Button - Only show if all fields are filled */}
                                    {slide.storeName && slide.price && slide.offerTitle && (
                                        <div className="absolute bottom-4 right-4 z-20">
                                            <button
                                                onClick={() => handleBuyAd(slide)}
                                                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-[0_4px_14px_0_rgba(255,69,0,0.39)] hover:shadow-[0_6px_20px_rgba(255,69,0,0.23)] transform hover:scale-105 transition-all duration-300 flex items-center gap-1.5"
                                            >
                                                <ShoppingCart size={16} />
                                                <span>{t('Buy Now')}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Slider Controls */}
                        <button
                            onClick={() => scrollToSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 p-3 rounded-full text-gray-800 dark:text-white transition-all shadow-xl hover:shadow-2xl opacity-0 group-hover:opacity-100 z-10 hover:scale-110"
                        >
                            <ChevronLeft size={28} />
                        </button>
                        <button
                            onClick={() => scrollToSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 p-3 rounded-full text-gray-800 dark:text-white transition-all shadow-xl hover:shadow-2xl opacity-0 group-hover:opacity-100 z-10 hover:scale-110"
                        >
                            <ChevronRight size={28} />
                        </button>

                        {/* Dots */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-full">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => scrollToSlide(index)}
                                    className={`transition-all duration-300 rounded-full ${index === currentSlide ? 'w-8 h-3 bg-white shadow-lg' : 'w-3 h-3 bg-white/60 hover:bg-white/80'}`}
                                />
                            ))}
                        </div>
                    </section>
                ) : null}


                {/* Categories Section - Loading Skeleton or Content */}
                {loadingCategories ? (
                    <section className="bg-gray-50 dark:bg-gray-900 py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse"></div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                ) : allCategories.length > 0 ? (
                    <section className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 py-8">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-6">
                                {t('Shop by Category')}
                            </h2>
                            {/* Grid: 3 columns on mobile, 4 on tablet, 6 on desktop, 8 on xl screens */}
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
                                {allCategories.map((category) => (
                                    <Link
                                        key={category._id || category.id}
                                        to={`/category/${encodeURIComponent(category.name)}`}
                                        className="flex flex-col items-center gap-2 md:gap-3 group"
                                    >
                                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_30px_rgba(37,99,235,0.3)] dark:hover:shadow-[0_20px_30px_rgba(37,99,235,0.2)] transition-all duration-300 group-hover:scale-110 bg-white dark:bg-gray-800">
                                            <img
                                                src={category.image || `${API_BASE_URL}/categories/${category._id || category.id}/image`}
                                                alt={category.name}
                                                className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-110"
                                                loading="lazy"
                                            />
                                            {/* Gradient overlay on hover */}
                                            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-300"></div>
                                        </div>
                                        {(() => {
                                            const fullName = t(category.name);
                                            const bracketIndex = fullName.indexOf('(');

                                            if (bracketIndex !== -1) {
                                                const mainName = fullName.substring(0, bracketIndex).trim();
                                                const bracketText = fullName.substring(bracketIndex).trim();

                                                return (
                                                    <div className="flex flex-col items-center gap-0.5 max-w-full">
                                                        <span className="text-xs sm:text-sm md:text-base font-bold text-gray-900 dark:text-white text-center max-w-full group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate w-full" title={mainName}>
                                                            {mainName}
                                                        </span>
                                                        <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 text-center max-w-full truncate w-full" title={bracketText}>
                                                            {bracketText}
                                                        </span>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <span className="text-xs sm:text-sm md:text-base font-bold text-gray-900 dark:text-white text-center max-w-full group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2" title={fullName}>
                                                    {fullName}
                                                </span>
                                            );
                                        })()}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                ) : null}

                {/* Mobile Search Bar - Below Categories */}
                <section className="md:hidden bg-white dark:bg-gray-800 py-2 sticky top-16 z-40 shadow-none border-none">
                    <div className="mx-auto px-4">
                        <div className="relative">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (searchQuery.trim()) {
                                        navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
                                        setSearchQuery('');
                                    }
                                }}
                                className="relative z-50"
                            >
                                <input
                                    type="text"
                                    name="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('Search products...')}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-blue-100 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-md focus:shadow-xl transition-all duration-300"
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400" size={22} />
                            </form>

                            {/* Search Results Dropdown */}
                            {searchQuery.trim() && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-30">
                                    {(() => {
                                        const filteredProducts = products.filter(product =>
                                            product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            product.category?.toLowerCase().includes(searchQuery.toLowerCase())
                                        ).slice(0, 5);

                                        if (filteredProducts.length === 0) {
                                            return (
                                                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                                    {t('No products found')}
                                                </div>
                                            );
                                        }

                                        return filteredProducts.map((product) => {
                                            const productId = product._id || product.id;
                                            const cartItem = cartItems.find(item => item.id === productId);
                                            const cartQuantity = cartItem ? cartItem.quantity : 0;
                                            const isSaved = savedProducts?.some(p => (p._id || p.id || p) === productId);

                                            return (
                                                <Link
                                                    key={productId}
                                                    to={`/product/${productId}`}
                                                    onClick={() => setSearchQuery('')}
                                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                                >
                                                    <div className="relative flex-shrink-0">
                                                        <img
                                                            src={product.image || `${API_BASE_URL}/products/${productId}/image`}
                                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=No+Image'; }}
                                                            alt={product.title}
                                                            className="w-12 h-12 rounded-lg object-cover border border-gray-100 dark:border-gray-700"
                                                        />
                                                        {cartQuantity > 0 && (
                                                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm border border-white dark:border-gray-800 z-10">
                                                                {cartQuantity}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 px-1">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                            {t(product, 'title')}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            ₹{Number(product.price).toFixed(0)}
                                                        </p>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        {isSaved ? (
                                                            <Bookmark size={18} className="text-blue-600 fill-current" />
                                                        ) : (
                                                            <Bookmark size={18} className="text-gray-300 dark:text-gray-600" />
                                                        )}
                                                    </div>
                                                </Link>
                                            );
                                        });
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Fast Mode Toggle - Below Search Bar */}
                <div className="md:hidden px-4 -mt-2 mb-4">
                    <button
                        onClick={toggleFastMode}
                        className={`p-2 rounded-full transition-all flex items-center gap-1.5 text-xs font-medium ${fastMode
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            }`}
                        title={fastMode ? t('Fast Mode ON') : t('Fast Mode')}
                    >
                        <Zap size={14} className={fastMode ? 'fill-white' : ''} />
                        <span className="pr-1">{fastMode ? t('Fast ON') : t('Fast')}</span>
                    </button>
                </div>


                {/* Main Content Container */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">


                    {/* Loading State for Products - Inline */}
                    {/* Loading State for Products - Skeleton Grid */}
                    {loadingProducts && (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse flex flex-col h-full">
                                    <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl mb-3"></div>
                                    <div className="space-y-2 flex-grow">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-2"></div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Product Sections by Category */}
                    {!loadingProducts && Object.entries(groupedProducts).length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            {t('No products found')}
                        </div>
                    )}

                    {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
                        <CategorySection
                            key={category}
                            category={category}
                            products={groupProductsByName(categoryProducts).sort((a, b) => {
                                // Helper to determine open status
                                const getStatus = (item) => {
                                    if (item.isGroup) return item.anyStoreOpen;
                                    const sId = item.storeId?._id || item.storeId;
                                    const s = stores.find(st => (st._id || st.id) === sId);
                                    return s ? isStoreOpen(s) : false;
                                };
                                const isOpenA = getStatus(a);
                                const isOpenB = getStatus(b);

                                if (isOpenA === isOpenB) return 0;
                                return isOpenA ? -1 : 1;
                            }).slice(0, 10)}
                            t={t}
                            fastMode={fastMode}
                        />
                    ))}
                </div>
            </div>
        </PullToRefreshLayout>
    );
};

// Category Section Component
const CategorySection = ({ category, products, t, fastMode }) => {
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    console.log(`🏠 Home: CategorySection [${category}] - Products:`, products?.length);

    // If no products, we check if it is still initial loading?
    // Since we removed the global blocker, we need to handle empty states gracefully here.
    if (!products || products.length === 0) {
        return (
            <section className="relative space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{t(category)}</h2>
                </div>
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </section>
        );
    }

    // Get category image from first product or use default
    const categoryImage = products[0]?.image;

    return (
        <section className="relative space-y-4">
            {/* Category Header */}
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent truncate flex-1 min-w-0" title={t(category)}>
                    {t(category)}
                </h2>
                <Link
                    to={`/category/${encodeURIComponent(category)}`}
                    className="text-sm md:text-base bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-300 dark:hover:to-indigo-300 font-bold transition-all px-3 py-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-shrink-0 whitespace-nowrap"
                >
                    {t('View All')} →
                </Link>
            </div>

            {/* Products Carousel */}
            <div className="relative group">
                {/* Scroll Buttons - Desktop Only */}
                <button
                    onClick={() => scroll('left')}
                    className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                    aria-label="Scroll left"
                >
                    <ChevronLeft size={20} className="text-gray-700 dark:text-gray-300" />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                    aria-label="Scroll right"
                >
                    <ChevronRight size={20} className="text-gray-700 dark:text-gray-300" />
                </button>

                {/* Scrollable Products Container */}
                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-3 md:gap-4 pb-4 snap-x snap-mandatory scrollbar-hide scroll-smooth"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    {products.map((product) => (
                        <div
                            key={product._id || product.id}
                            className="flex-none w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] snap-start"
                        >
                            <SimpleProductCard product={product} isFastPurchase={fastMode} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Home;
