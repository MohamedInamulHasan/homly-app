import { useState, useEffect, useRef, useMemo } from 'react';
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
import { sortProductsByGoldAndOpen } from '../utils/productSorting';
import { API_BASE_URL } from '../utils/api';
import { groupProducts } from '../utils/productGrouping';
import SimpleProductCard from '../components/SimpleProductCard';
import SortDropdown from '../components/SortDropdown';
import PullToRefreshLayout from '../components/PullToRefreshLayout';

const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    // const [fastMode, setFastMode] = useState(false); // Using global state now

    // React Query Hooks
    const { data: rawProducts = [], isLoading: loadingProducts, error: errorProducts } = useProducts();
    const { fastMode, toggleFastMode, globalSortOrder, setGlobalSortOrder } = useData();
    const { data: ads = [], isLoading: loadingAds } = useAds();
    const { data: rawCategories = [], isLoading: loadingCategories, error: errorCategories } = useCategories();
    const { data: rawStores = [], isLoading: storesLoading } = useStores();

    const getCurrentMeal = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Breakfast';
        if (hour >= 12 && hour < 17) return 'Lunch';
        return 'Dinner';
    };

    const currentMeal = getCurrentMeal();

    const categories = useMemo(() => {
        const raw = Array.isArray(rawCategories) ? rawCategories : (rawCategories?.data || []);
        return raw.filter(cat => {
            const name = cat.name.toLowerCase();
            // Broader check for food/hotel related categories
            const isFood = ['food', 'hotel', 'restaurant', 'veg', 'non-veg', 'bakery', 'sweets'].some(f => name.includes(f));
            if (!isFood) return true;

            const meals = ['breakfast', 'lunch', 'dinner', 'tiffin', 'meals'];
            const hasMeal = meals.some(m => name.includes(m.toLowerCase()));
            if (!hasMeal) return true;

            // Only show if it matches the current meal keyword
            // This will hide "Foods (Breakfast)" if currentMeal is "Dinner"
            return name.includes(currentMeal.toLowerCase());
        });
    }, [rawCategories, currentMeal]);

    const stores = Array.isArray(rawStores) ? rawStores : (rawStores?.data || []);
    const allCategories = categories && categories.length > 0 ? categories : [];

    // Map products from raw data (handling potential nesting)
    // Filter out unavailable products so they don't show up in groups or lists
    // Map products from raw data - Memoized accurately with availability checks
    const products = useMemo(() => {
        const raw = Array.isArray(rawProducts) ? rawProducts : (rawProducts?.data || []);
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        return raw.filter(p => {
            // Manual check
            if (p.isAvailable === false) return false;

            // Timing check
            if (p.useTimeLimit) {
                const opening = p.openingTime || '00:00';
                const closing = p.closingTime || '23:59';
                if (opening <= closing) {
                    if (currentTime < opening || currentTime > closing) return false;
                } else {
                    // Overnights
                    if (currentTime < opening && currentTime > closing) return false;
                }
            }
            return true;
        });
    }, [rawProducts]);

    console.log('🏠 Home: Products Count:', products.length);
    console.log('🏠 Home: Loading:', loadingProducts, 'Stores Loading:', storesLoading);

    const { t } = useLanguage();
    const navigate = useNavigate();
    const { cartItems, savedProducts } = useCart();

    const loadingAll = loadingProducts || storesLoading;

    // Use ads from backend only
    const slides = (ads && ads.length > 0) ? ads : [];

    // Filter products to only show from open stores
    const openStoreProducts = useMemo(() => products, [products]);

    /* ... */



    // Group products by Store - Memoized
    // If no storeId, fallback to grouping by category (orphan products)
    const groupedByStore = useMemo(() => {
        return openStoreProducts.reduce((acc, product) => {
            const storeId = product.storeId?._id || product.storeId;
            const key = storeId || `category_${product.category || 'Other'}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(product);
            return acc;
        }, {});
    }, [openStoreProducts]);

    // Create a list of sections to display (Stores + Orphan Category fallbacks)
    const displaySections = useMemo(() => {
        const sections = [];

        // 1. Add real stores
        stores.forEach(s => {
            const storeId = s._id || s.id;
            if (groupedByStore[storeId]) {
                sections.push({
                    id: storeId,
                    name: s.name,
                    address: s.address,
                    type: 'store',
                    data: s
                });
            }
        });

        // 2. Add orphan category sections
        Object.entries(groupedByStore).forEach(([key, products]) => {
            if (key.startsWith('category_')) {
                const categoryName = key.replace('category_', '');

                // Filter orphan category sections based on current meal
                const catNameLower = categoryName.toLowerCase();
                const isFood = ['food', 'hotel', 'restaurant'].some(f => catNameLower.includes(f));
                const hasMeal = ['breakfast', 'lunch', 'dinner'].some(m => catNameLower.includes(m.toLowerCase()));

                if (isFood && hasMeal && !catNameLower.includes(currentMeal.toLowerCase())) {
                    return;
                }

                sections.push({
                    id: key,
                    name: categoryName,
                    type: 'category',
                    data: { name: categoryName }
                });
            }
        });

        return sections.sort((a, b) => {
            const aOpen = a.type === 'store' ? isStoreOpen(a.data) : true;
            const bOpen = b.type === 'store' ? isStoreOpen(b.data) : true;
            if (aOpen && !bOpen) return -1;
            if (!aOpen && bOpen) return 1;
            return 0;
        });
    }, [stores, groupedByStore, currentMeal]);

    // Generate product layout distribution - DETERMINISTIC & PROPORTIONAL
    const stablizedDiversePools = useMemo(() => {
        const getCurrentMeal = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) return 'Breakfast';
            if (hour >= 12 && hour < 17) return 'Lunch';
            return 'Dinner';
        };

        const generateLayout = (storeProducts, forcedStoreId = null) => {
            if (!storeProducts || storeProducts.length === 0) return [];

            // Find the store for this product pool to check its category
            const store = stores.find(s => {
                const sId = s._id || s.id;
                const pStoreId = storeProducts[0]?.storeId?._id || storeProducts[0]?.storeId;
                return String(sId) === String(pStoreId);
            });

            const storeTypes = store ? (Array.isArray(store.type) ? store.type : [store.type]) : [];
            const isFoodStore = storeTypes.some(type =>
                ['foods', 'hotels', 'restaurants', 'food', 'hotel', 'restaurant'].includes(type?.toLowerCase())
            );

            const currentMeal = getCurrentMeal();

            const groupedAndSorted = sortProductsByGoldAndOpen(groupProducts(storeProducts, stores, { forcedStoreId }), stores);
            if (groupedAndSorted.length === 0) return [];

            const totalUniqueProducts = groupedAndSorted.length;

            // Limit slots to total unique products, capped at 10 (as before)
            const targetTotalSlots = Math.min(10, totalUniqueProducts);

            const bySub = {};
            const normalizeSub = (s) => {
                if (!s) return '';
                // 1. Remove all numbers (e.g. "5 Biscuits" -> " Biscuits")
                // 2. Remove common unit words and cleanup whitespace
                let clean = s.replace(/[0-9]/g, '').trim().toLowerCase();
                const unitWords = ['units', 'packs', 'pack', 'grams', 'gram', 'ml', 'liter', 'litre', 'kg', 'g', 'l', 'x', 'pc', 'pcs', 'pieces', 'piece', 'bottles', 'bottle', 'cans', 'can', 'boxes', 'box', 'rolls', 'roll', 'sheets', 'sheet', 'pairs', 'pair', 'sets', 'set', 'tubes', 'tube', 'jars', 'jar', 'bags', 'bag', 'strips', 'strip', 'bars', 'bar', 'cups', 'cup', 'sachets', 'sachet', 'pouches', 'pouch', 'cartons', 'carton', 'bundles', 'bundle', 'dzn', 'dozen', 'pkt', 'packet', 'pck', 'pckts', 'pckts'];
                unitWords.forEach(word => {
                    clean = clean.replace(new RegExp(`\\b${word}\\b`, 'g'), '').trim();
                });

                // 3. Improved plural normalization (Biscuits -> biscuit)
                if (clean.endsWith('s') && clean.length > 3) clean = clean.slice(0, -1);

                // 4. Final capitalization
                return clean.charAt(0).toUpperCase() + clean.slice(1);
            };

            groupedAndSorted.forEach(p => {
                // Combine multiple subcategories into a single unique group name (e.g. "Chip & Sweet")
                const rawSubs = Array.isArray(p.subcategory) ? p.subcategory : (p.subcategory ? [p.subcategory] : []);

                // CRITICAL: Filter out the category name itself (it's redundant and causes splits)
                // e.g. if category is "Snacks", ignore "Snacks" in the subcategory list
                const catNameLower = p.category.toLowerCase(); // Use product's category for filtering
                const normalizedSubs = [...new Set(
                    rawSubs
                        .filter(Boolean)
                        .map(s => s.toLowerCase())
                        .filter(s => normalizeSub(s) !== normalizeSub(catNameLower) && normalizeSub(s) !== normalizeSub(catNameLower + 's'))
                        .map(normalizeSub)
                        .filter(s => s !== '') // Remove empty strings if sub was just a number or unit word
                )].sort();

                const subKey = normalizedSubs.join(' & ') || 'Other';

                // Apply time-based filtering for Food/Hotel/Restaurant categories
                if (isFoodStore) {
                    // Only include the subcategory if it matches the current meal (Breakfast/Lunch/Dinner)
                    // This allows showing ONLY Breakfast in the morning, Lunch in afternoon, etc.
                    if (subKey !== currentMeal) return;
                }

                if (!bySub[subKey]) bySub[subKey] = [];
                bySub[subKey].push(p);

                // TRACE: Keep for verification
                if (p.title.toLowerCase().includes('britannia')) {
                    console.log(`🔍 DEBUG Grouping [${p.title}]: Raw=${JSON.stringify(rawSubs)}, Key="${subKey}"`);
                }
            });

            // If sorting is active, return a flat, strictly sorted layout bypassing grouping
            if (globalSortOrder !== 'none') {
                const sortedAll = [...groupedAndSorted].sort((a, b) => {
                    const priceA = Number(a.price || 0);
                    const priceB = Number(b.price || 0);
                    return globalSortOrder === 'lowToHigh' ? priceA - priceB : priceB - priceA;
                });

                return sortedAll.slice(0, targetTotalSlots).map((p) => ({
                    subProductList: [p],
                    localIndex: 0
                }));
            }

            // Randomize subcategory group order while maintaining proportional layout
            const subNames = Object.keys(bySub).sort();
            for (let i = subNames.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [subNames[i], subNames[j]] = [subNames[j], subNames[i]];
            }

            const layout = [];

            // Fair Round-Robin Distribution (e.g. 3+2+3+2)
            // Distribute slots one-by-one to each subcategory in a circular fashion
            let remainingSlots = targetTotalSlots;
            const finalCounts = {};
            const availableSubs = subNames.filter(sub => bySub[sub].length > 0);

            while (remainingSlots > 0 && availableSubs.length > 0) {
                let slotsAllocatedThisCycle = 0;

                for (let i = 0; i < availableSubs.length; i++) {
                    const sub = availableSubs[i];
                    if (remainingSlots > 0 && (finalCounts[sub] || 0) < bySub[sub].length) {
                        finalCounts[sub] = (finalCounts[sub] || 0) + 1;
                        remainingSlots--;
                        slotsAllocatedThisCycle++;
                    }
                }

                // If we can't allocate any more cards to any subcategory, stop
                if (slotsAllocatedThisCycle === 0) break;
            }

            // 2. Build the layout using computed counts
            subNames.forEach((sub) => {
                const count = finalCounts[sub] || 0;
                if (count > 0) {
                    console.log(`📌 Home: Subcategory "${sub}" allocated ${count} slots. [Keys: ${sub}]`);
                }
                for (let i = 0; i < count; i++) {
                    layout.push({
                        subProductList: bySub[sub],
                        localIndex: i,
                    });
                }
            });

            return layout;
        };

        const result = {};
        Object.entries(groupedByStore).forEach(([key, products]) => {
            const isStoreKey = !key.startsWith('category_');
            result[key] = generateLayout(products, isStoreKey ? key : null);
        });
        return result;
    }, [groupedByStore, stores, globalSortOrder]);

    console.log('📊 Home Debug:', {
        totalProducts: products.length,
        groupedStores: Object.keys(groupedByStore)
    });

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
            image: `${API_BASE_URL}/ads/${ad._id || ad.id}/image`, // Always use URL to avoid Base64 stripping in checkout
            price: Number(ad.price),
            storeName: ad.storeName,
            // If ad has a linked storeId, use it, otherwise keep it undefined
            storeId: ad.storeId,
            quantity: 1,
            // Ad tracking fields
            isFromAd: true,
            adTitle: ad.offerTitle || ad.title
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
    if (!loadingAll && products.length === 0 && errorProducts) {
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
                                                className="bg-white hover:bg-gray-100 text-black px-4 py-1.5 rounded-full text-sm font-bold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-1.5"
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
                                    className={`transition-all duration-300 rounded-full ${index === currentSlide ? 'w-6 h-2.5 bg-white shadow-sm' : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'}`}
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
                                        to={`/store?category=${encodeURIComponent(category.name)}`}
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
                                                    <div className="flex flex-col items-center max-w-full">
                                                        <span className="text-xs sm:text-sm md:text-base font-bold text-gray-900 dark:text-white text-center max-w-full group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate w-full" title={mainName}>
                                                            {mainName}
                                                        </span>
                                                        <span className="text-xs sm:text-sm md:text-base font-normal text-center max-w-full truncate w-full text-gray-500 dark:text-gray-400 mt-0.5 pb-0.5" title={bracketText}>
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

                {/* Search Bar - Integrated with Background */}
                <section className="py-2 sticky top-16 z-40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3 relative z-50">
                            <div className="relative flex-1 md:max-w-md">
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
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:shadow-lg transition-all duration-300"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400" size={22} />
                                </form>
                            </div>

                            <SortDropdown currentSort={globalSortOrder} onSortChange={setGlobalSortOrder} />
                        </div>

                        {/* Search Results Dropdown */}
                        {searchQuery.trim() && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-30 w-full">
                                {(() => {
                                    const q = searchQuery.toLowerCase();
                                    const filteredProducts = products.filter(product =>
                                        product.title?.toLowerCase().includes(q) ||
                                        product.description?.toLowerCase().includes(q) ||
                                        product.category?.toLowerCase().includes(q)
                                    ).sort((a, b) => {
                                        const aDisplay = t(a, 'title').toLowerCase();
                                        const bDisplay = t(b, 'title').toLowerCase();
                                        const aStarts = aDisplay.startsWith(q);
                                        const bStarts = bDisplay.startsWith(q);

                                        if (aStarts && !bStarts) return -1;
                                        if (!aStarts && bStarts) return 1;
                                        return (b.salesCount || 0) - (a.salesCount || 0);
                                    }).slice(0, 5);

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

                                        // Check if store is open
                                        const productStore = stores.find(s => (s._id || s.id) === (product.storeId?._id || product.storeId));
                                        const storeOpen = productStore ? isStoreOpen(productStore) : true;

                                        return (
                                            <div
                                                key={productId}
                                                onClick={() => {
                                                    if (storeOpen) {
                                                        navigate(`/product/${productId}`);
                                                        setSearchQuery('');
                                                    }
                                                }}
                                                className={`flex items-center gap-3 p-3 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${storeOpen ? 'hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer' : 'opacity-75 cursor-default'}`}
                                            >
                                                <div className="relative flex-shrink-0">
                                                    <img
                                                        src={product.image || `${API_BASE_URL}/products/${productId}/image`}
                                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=No+Image'; }}
                                                        alt={product.title}
                                                        className={`w-12 h-12 rounded-lg object-cover border border-gray-100 dark:border-gray-700 ${!storeOpen ? 'grayscale opacity-60' : ''}`}
                                                    />
                                                    {/* Unit Badge (Order Summary Style - More Compact) */}
                                                    {product.unit && (
                                                        <div className="absolute bottom-0 right-0 bg-white/95 backdrop-blur-none px-1 py-0 rounded-tl-sm z-10 pointer-events-none shadow-sm border-l border-t border-gray-100 dark:border-gray-700 max-w-full overflow-hidden flex items-center h-3">
                                                            <span className={`font-semibold text-gray-900 whitespace-nowrap inline-block leading-normal ${product.unit.length > 8 ? 'text-[5px]' : 'text-[7px]'}`}>
                                                                {product.unit}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {cartQuantity > 0 && (
                                                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm border border-white dark:border-gray-800 z-10">
                                                            {cartQuantity}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 px-1">
                                                    <div className="flex items-center justify-between gap-2 overflow-hidden">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                            {(() => {
                                                                const fullTitle = t(product, 'title');
                                                                const bracketIndex = fullTitle.indexOf('(');
                                                                if (bracketIndex !== -1) {
                                                                    const mainPart = fullTitle.substring(0, bracketIndex);
                                                                    const bracketPart = fullTitle.substring(bracketIndex);
                                                                    return (
                                                                        <>
                                                                            <span>{mainPart}</span>
                                                                            <span className="font-normal text-gray-500 dark:text-gray-400">{bracketPart}</span>
                                                                        </>
                                                                    );
                                                                }
                                                                return fullTitle;
                                                            })()}
                                                        </div>
                                                        {!storeOpen && (
                                                            <span className="text-[10px] font-bold text-red-500 flex-shrink-0 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-full border border-red-100 dark:border-red-800">
                                                                {t('Store Closed')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        ₹{Number(product.price).toFixed(0)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        )}
                    </div>
                </section>




                {/* Main Content Container */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">


                    {/* Loading State for Products - Inline */}
                    {/* Loading State for Products - Skeleton Grid */}
                    {/* Loading State for Products - Skeleton Grid */}
                    {loadingAll && (
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

                    {/* Sections by Store or Category (Orphans) */}
                    {!loadingAll && displaySections.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            {t('No products found')}
                        </div>
                    )}

                    {displaySections.map((section) => {
                        const productPools = stablizedDiversePools[section.id];

                        if (!productPools || productPools.length === 0) return null;

                        return (
                            <StoreSection
                                key={section.id}
                                section={section}
                                productPools={productPools}
                                t={t}
                                fastMode={fastMode}
                            />
                        );
                    })}
                </div>
            </div >
        </PullToRefreshLayout >
    );
};

// Rotating Product Card Component
// Rotating Product Card Component
const RotatingProductCard = ({ subProductList, localIndex, fastMode, rotationTick }) => {
    if (!subProductList || subProductList.length === 0) return null;

    const M = subProductList.length;

    // SIMULTANEOUS MARCHING WINDOW:
    // Every 30s (tick), all products in the group shift.
    // displayIdx = (i - T) mod M
    let displayIdx = (localIndex - rotationTick) % M;
    if (displayIdx < 0) displayIdx += M;

    const product = subProductList[displayIdx];
    if (!product) return null;

    return (
        <SimpleProductCard product={product} isFastPurchase={fastMode} />
    );
};

// Store Section Component (Handles both real stores and orphan category sections)
const StoreSection = ({ section, productPools, t, fastMode }) => {
    const scrollContainerRef = useRef(null);
    const [rotationTick, setRotationTick] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setRotationTick(prev => prev + 1);
        }, 30000); // 30 seconds interval

        return () => clearInterval(interval);
    }, []);

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

    const isStore = section.type === 'store';
    const linkUrl = isStore ? `/store/${section.id}` : `/store?category=${encodeURIComponent(section.name)}`;

    return (
        <section className="relative space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col min-w-0 flex-1">
                    <h2 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent capitalize truncate leading-normal pb-0.5">
                        {t(section.name)}
                    </h2>
                    {isStore && section.address && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {section.address}
                        </p>
                    )}
                </div>
                <Link
                    to={linkUrl}
                    state={{ from: 'home' }}
                    className="text-sm md:text-base bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-300 dark:hover:to-indigo-300 font-bold transition-all px-3 py-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-shrink-0 whitespace-nowrap"
                >
                    {isStore ? t('View Store') : t('View Category')} →
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
                    className="flex overflow-x-auto gap-3 md:gap-4 pb-4 scrollbar-hide snap-x"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    {productPools.map((cardConfig, idx) => (
                        <div
                            key={idx}
                            className="flex-none w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] snap-start"
                        >
                            <RotatingProductCard
                                subProductList={cardConfig.subProductList}
                                localIndex={cardConfig.localIndex}
                                fastMode={fastMode}
                                rotationTick={rotationTick}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Home;
