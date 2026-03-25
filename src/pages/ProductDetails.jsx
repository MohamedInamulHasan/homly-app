import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Plus, ArrowLeft, Minus, ShoppingBag, ShoppingCart, ChevronLeft, ChevronRight, Star, Share2, Bookmark, Store } from 'lucide-react';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, cartItems, updateQuantity } = useCart();
    const { products, stores, savedProducts, toggleSaveProduct } = useData();
    const { user } = useAuth();
    const { t } = useLanguage();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Look up store name from stores context
    const store = product && stores?.find(s => (s._id || s.id) === product.storeId);
    const storeName = store?.name || 'Unknown Store';

    // Updated effect to handle individual product fetching
    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);
            // 1. Try to find in context first (fastest)
            if (products.length > 0) {
                const foundProduct = products.find(p => (p._id || p.id) === id || (p._id || p.id) === parseInt(id));
                if (foundProduct) {
                    setProduct(foundProduct);
                    setCurrentImageIndex(0);
                    setLoading(false);
                    return;
                }
            }

            // 2. If not in context (e.g. direct link or paginated out), fetch from API
            try {
                const response = await import('../utils/api').then(m => m.apiService.getProduct(id));
                if (response.success && response.data) {
                    setProduct(response.data);
                    setCurrentImageIndex(0);
                } else {
                    setProduct(null);
                }
            } catch (err) {
                console.error('Failed to fetch individual product:', err);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [id, products]);

    const productId = product ? (product._id || product.id) : null;
    const cartItem = product ? cartItems.find(item => item.id === productId) : null;
    const quantity = cartItem ? cartItem.quantity : 0;

    // Check if product is saved (savedProducts contains objects now due to populate, so check IDs)
    const isSaved = product && savedProducts.some(p => (p._id || p.id || p) === (product._id || product.id));

    const handleToggleSave = async () => {
        if (product) {
            await toggleSaveProduct(product._id || product.id);
        }
    };

    const handleAddToCart = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        addToCart(product);
    };

    const handleCheckout = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!cartItem) {
            addToCart(product);
        }
        navigate('/checkout');
    };

    const handleScroll = (e) => {
        const container = e.target;
        const slideIndex = Math.round(container.scrollLeft / container.clientWidth);
        setCurrentImageIndex(slideIndex);
    };

    const scrollToImage = (index) => {
        const container = document.getElementById('product-slider');
        if (container) {
            container.scrollTo({
                left: index * container.clientWidth,
                behavior: 'smooth'
            });
            setCurrentImageIndex(index);
        }
    };

    const handleShare = async () => {
        try {
            const shareTitle = t(product, 'title') || product.title;
            const sharePrice = Number(product.price).toFixed(0);
            const shareUrl = window.location.href;
            const shareText = `${t('Checkout this')} ${shareTitle} ${t('for only')} ₹${sharePrice} ${t('on')} ILY mart!`;

            if (navigator.share) {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl,
                });
            } else {
                // Fallback to WhatsApp sharing
                const message = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
                window.open(`https://wa.me/?text=${message}`, '_blank');
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error sharing:', err);
            }
        }
    };

    // Show loading skeleton while fetching
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        {/* Back button skeleton */}
                        <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Image skeleton */}
                            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>

                            {/* Details skeleton */}
                            <div className="space-y-4">
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mt-8"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show not found only after loading completes
    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center px-4 transition-colors duration-200">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('Product not found')}</h2>
                <Link to="/store" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">{t('Return to Store')}</Link>
            </div>
        );
    }

    const images = product.images || [product.image];
    const totalPrice = (Number(product.price) * (quantity || 1)).toFixed(0);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-2 pb-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-7xl mx-auto">
                {/* Navigation Header */}
                <div className="flex items-center justify-between mb-1 px-1">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all group"
                    >
                        <ArrowLeft className="text-gray-600 dark:text-gray-300 group-hover:-translate-x-1 transition-transform" size={24} />
                        <span className="text-lg font-bold text-gray-700 dark:text-gray-200">
                            {t('Back')}
                        </span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShare}
                            className="p-2.5 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-100 dark:border-gray-700"
                        >
                            <Share2 size={20} />
                        </button>
                        <button
                            onClick={handleToggleSave}
                            className="p-2.5 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 border border-gray-100 dark:border-gray-700"
                        >
                            <Bookmark
                                size={20}
                                className={`transition-colors ${isSaved ? 'text-blue-600 fill-blue-600' : 'text-gray-500 dark:text-gray-400'}`}
                            />
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {/* Image Slider Section */}
                        <div className="relative aspect-square lg:aspect-auto lg:h-[600px] group">

                            <div
                                id="product-slider"
                                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full w-full"
                                onScroll={handleScroll}
                                style={{ scrollBehavior: 'smooth' }}
                            >
                                {images.map((img, idx) => (
                                    <div key={idx} className="min-w-full h-full snap-center flex items-center justify-center bg-white relative">
                                        {product.isGold && (
                                            <div className="absolute top-0 left-0 z-20">
                                                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-sm font-bold px-4 py-1 rounded-br-2xl shadow-md block">
                                                    {t('Gold Benefit')}
                                                </span>
                                            </div>
                                        )}
                                        <img
                                            src={img || 'https://via.placeholder.com/400x400?text=No+Image'}
                                            alt={`${product.title} - ${t('View')} ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'; }}
                                        />
                                        {/* Unit Overlay */}
                                        {product.unit && (
                                            <div className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 px-4 py-2 rounded-tl-2xl z-20 shadow-lg border-t border-l border-white/20">
                                                <span className="text-base md:text-lg font-bold text-white leading-none block">
                                                    {product.unit}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Slider Controls */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => scrollToImage(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/50 backdrop-blur-sm p-2 rounded-full text-gray-800 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black/70 z-10"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={() => scrollToImage(currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/50 backdrop-blur-sm p-2 rounded-full text-gray-800 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-black/70 z-10"
                                    >
                                        <ChevronRight size={24} />
                                    </button>

                                    {/* Dots */}
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                        {images.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => scrollToImage(idx)}
                                                className={`w-2.5 h-2.5 rounded-full transition-all ${currentImageIndex === idx
                                                    ? 'bg-blue-600 w-6'
                                                    : 'bg-white/60 hover:bg-white/80'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Product Info Section */}
                        <div className="p-8 lg:p-12 flex flex-col h-full">
                            <div className="mb-auto">
                                {product.storeId && (
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <Store size={14} className="text-gray-500 dark:text-gray-400" />
                                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                            {storeName}
                                        </span>
                                    </div>
                                )}

                                {(() => {
                                    const fullTitle = t(product, 'title') || product.title;
                                    const bracketMatch = fullTitle.match(/[\(\[\{（]/);
                                    const bracketIndex = bracketMatch ? bracketMatch.index : -1;

                                    let mainTitle = fullTitle;
                                    let bracketText = '';

                                    if (bracketIndex !== -1) {
                                        mainTitle = fullTitle.substring(0, bracketIndex).trim();
                                        bracketText = fullTitle.substring(bracketIndex).trim();
                                    }

                                    return (
                                        <div className="mb-4 flex flex-wrap items-baseline gap-x-1">
                                            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent break-words leading-tight">
                                                {mainTitle}
                                            </h1>
                                            {bracketText && (
                                                <span className="text-xl md:text-2xl font-light text-gray-500 dark:text-gray-400 break-words leading-tight">
                                                    {bracketText}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })()}
                                {/* Category and Store Tags Removed (Store moved above title) */}

                                <div className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-8 flex items-baseline gap-2">
                                    ₹{Number(product.price).toFixed(0)}
                                    {product.unit && (
                                        <span className="text-lg md:text-2xl font-bold text-gray-600 dark:text-gray-400">
                                            / {product.unit}
                                        </span>
                                    )}
                                </div>

                                <div className="prose prose-lg dark:prose-invert max-w-none mb-10">
                                    {(() => {
                                        const desc = t(product, 'description');
                                        if (!desc) return null;

                                        // 1. Initial Split & Flatten
                                        let rawLines = desc.split('\n');
                                        let processedLines = rawLines.flatMap(line => {
                                            const trimmed = line.trim();
                                            // Start/End with pipe usually indicates table row(s)
                                            if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
                                                return [line];
                                            }
                                            // Existing "Word - Value" split logic
                                            if (line.includes(' - ')) {
                                                return line.split(/(?<!^)\s+(?=[a-zA-Z0-9]+\s+-)/);
                                            }
                                            return [line];
                                        });

                                        // 2. Group Table Lines
                                        const groupedElements = [];
                                        let currentTableRows = [];

                                        processedLines.forEach((line) => {
                                            const trimmed = line.trim();
                                            if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('-')) {
                                                // It's a table row (or multiple rows in one line)
                                                // Split by pipe to get segments: "| A - B | C - D |" -> ["", " A - B ", " C - D ", ""]
                                                const segments = trimmed.split('|').filter(s => s.trim().length > 0);
                                                segments.forEach(segment => {
                                                    const parts = segment.split('-');
                                                    if (parts.length >= 2) {
                                                        const col1 = parts[0].trim();
                                                        const col2 = parts.slice(1).join('-').trim(); // Handle generic value with dashes?
                                                        currentTableRows.push({ col1, col2 });
                                                    }
                                                });
                                            } else {
                                                // Flush table if exists
                                                if (currentTableRows.length > 0) {
                                                    groupedElements.push({ type: 'table', rows: currentTableRows });
                                                    currentTableRows = [];
                                                }
                                                if (trimmed) {
                                                    groupedElements.push({ type: 'text', content: line });
                                                }
                                            }
                                        });
                                        // Flush remaining table
                                        if (currentTableRows.length > 0) {
                                            groupedElements.push({ type: 'table', rows: currentTableRows });
                                        }

                                        // 3. Render
                                        const isHeader = (line) => {
                                            const trimmed = line.trim();
                                            return trimmed.length > 1 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
                                        };

                                        const bulletCount = groupedElements.filter(el => el.type === 'text' && !isHeader(el.content)).length;

                                        return groupedElements.map((element, index) => {
                                            if (element.type === 'table') {
                                                return (
                                                    <div key={index} className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
                                                        {element.rows.map((row, rIndex) => (
                                                            <div key={rIndex} className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center text-center transition-all hover:shadow-md hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-800">
                                                                <span className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-1.5">{row.col1}</span>
                                                                <span className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300">{row.col2}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            }

                                            const line = element.content;
                                            const trimmedLine = line.trim();

                                            if (isHeader(line)) {
                                                return (
                                                    <h3 key={index} className="text-gray-900 dark:text-white font-bold text-lg mt-4 mb-2 first:mt-0">
                                                        {trimmedLine}
                                                    </h3>
                                                );
                                            }

                                            const showBullet = bulletCount > 1;

                                            return (
                                                <div key={index} className={`flex items-start ${showBullet ? 'gap-3' : ''} mb-1.5 text-gray-600 dark:text-gray-300 leading-relaxed`}>
                                                    {showBullet && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0" />
                                                    )}
                                                    <p>
                                                        {trimmedLine.split(/(\b[A-Z][A-Z0-9\s]+\b)/g).map((part, i) => {
                                                            if (part.length > 1 && part === part.toUpperCase() && /[A-Z]/.test(part)) {
                                                                return <strong key={i} className="text-gray-900 dark:text-white font-bold">{part}</strong>;
                                                            }
                                                            return part;
                                                        })}
                                                    </p>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>

                                {/* Dynamic Quantity & Action Area - Replaces Old Static Section */}
                                <div className="hidden md:block mb-8">
                                    <div className="flex items-center gap-4">
                                        {quantity === 0 ? (
                                            <div className="w-full flex gap-4">
                                                <button
                                                    onClick={handleAddToCart}
                                                    className="flex-1 py-4 px-8 rounded-2xl font-bold text-xl shadow-lg border-2 border-indigo-500 text-indigo-600 bg-white hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
                                                >
                                                    <ShoppingCart size={24} />
                                                    {t('Add to Cart')}
                                                </button>
                                                <button
                                                    onClick={handleCheckout}
                                                    className="flex-1 py-4 px-8 rounded-2xl font-bold text-xl shadow-md shadow-blue-500/10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
                                                >
                                                    <ShoppingBag size={24} />
                                                    {t('Buy Now')}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                <div className="flex gap-4">
                                                    {/* Quantity Control Pill */}
                                                    <div className={`flex items-center justify-between h-14 rounded-2xl p-1.5 w-48 flex-shrink-0 ${product.isGold ? 'bg-white/60 border border-slate-200' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                                        <button
                                                            onClick={() => updateQuantity(productId, Math.max(0, quantity - 1))}
                                                            className={`w-12 h-12 flex items-center justify-center rounded-xl shadow-sm transition-colors ${product.isGold ? 'bg-white text-slate-700 hover:text-red-600 border border-slate-100' : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:text-red-600 border border-gray-100 dark:border-gray-500'}`}
                                                        >
                                                            <Minus size={22} strokeWidth={2.5} />
                                                        </button>
                                                        <span className={`font-bold text-2xl w-12 text-center tabular-nums ${product.isGold ? 'text-slate-800' : 'text-gray-900 dark:text-white'}`}>{quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(productId, quantity + 1)}
                                                            className={`w-12 h-12 flex items-center justify-center rounded-xl shadow-sm transition-colors ${product.isGold ? 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-800 hover:from-slate-300 hover:to-slate-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'}`}
                                                        >
                                                            <Plus size={22} strokeWidth={2.5} />
                                                        </button>
                                                    </div>

                                                    {/* Buy Now Button (Consistent Look) */}
                                                    <button
                                                        onClick={handleCheckout}
                                                        className="flex-1 py-4 px-6 rounded-2xl font-bold text-lg shadow-md shadow-blue-500/10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1"
                                                    >
                                                        <ShoppingBag size={24} />
                                                        {t('Buy Now')}
                                                    </button>
                                                </div>

                                                {/* Total Price Display - Below Buttons */}
                                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                                                    <span className="font-bold text-gray-600 dark:text-gray-300">{t('Total Amount')}</span>
                                                    <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                                        ₹{(Number(product.price) * quantity).toFixed(0)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Desktop Action Button - REMOVED (Merged into above section) */}
                            </div>

                        </div>
                    </div>
                </div>
            </div>


            {/* Sticky Action Footer - Mobile Only */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_-1px_rgba(0,0,0,0.1)] z-50 md:hidden">
                <div className="max-w-7xl mx-auto">
                    {quantity === 0 ? (
                        <div className="w-full flex gap-3 px-2">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 py-3.5 px-4 rounded-2xl font-bold text-base shadow-md border-2 border-indigo-500 text-indigo-600 bg-white active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <ShoppingCart size={20} />
                                {t('Add to Cart')}
                            </button>
                            <button
                                onClick={handleCheckout}
                                className="flex-1 py-3.5 px-4 rounded-2xl font-bold text-base shadow-md shadow-blue-500/10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <ShoppingBag size={20} />
                                {t('Buy Now')}
                            </button>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col gap-3">
                            <div className="flex gap-3 px-2">
                                {/* Mobile Quantity Pill */}
                                <div className={`flex items-center justify-between rounded-2xl p-1.5 w-36 flex-shrink-0 ${product.isGold ? 'bg-white/60 border border-slate-200' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                    <button
                                        onClick={() => updateQuantity(productId, Math.max(0, quantity - 1))}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-sm active:scale-90 transition-transform ${product.isGold ? 'bg-white text-slate-700 border border-slate-100' : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-500'}`}
                                    >
                                        <Minus size={18} strokeWidth={2.5} />
                                    </button>
                                    <span className={`font-bold text-xl tabular-nums ${product.isGold ? 'text-slate-800' : 'text-gray-900 dark:text-white'}`}>{quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(productId, quantity + 1)}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-sm active:scale-90 transition-transform ${product.isGold ? 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-800' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'}`}
                                    >
                                        <Plus size={18} strokeWidth={2.5} />
                                    </button>
                                </div>

                                {/* Mobile Buy Now Button (Consistent) */}
                                <button
                                    onClick={handleCheckout}
                                    className="flex-1 py-3 px-4 rounded-2xl font-bold text-base shadow-md shadow-blue-500/10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white active:scale-95 transition-transform flex items-center justify-center gap-2"
                                >
                                    <ShoppingBag size={20} />
                                    {t('Buy Now')}
                                </button>
                            </div>

                            {/* Mobile Total Price - Below Buttons */}
                            <div className="mx-2 flex items-center justify-between py-2.5 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{t('Total')}:</span>
                                <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                                    ₹{(Number(product.price) * quantity).toFixed(0)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
