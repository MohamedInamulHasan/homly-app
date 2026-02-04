import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { Plus, ArrowLeft, Minus, ShoppingBag, ShoppingCart, ChevronLeft, ChevronRight, Star, Share2, Bookmark, Store } from 'lucide-react';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, cartItems, updateQuantity } = useCart();
    const { products, stores, savedProducts, toggleSaveProduct } = useData();
    const { t } = useLanguage();

    const [product, setProduct] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Look up store name from stores context
    const store = product && stores?.find(s => (s._id || s.id) === product.storeId);
    const storeName = store?.name || 'Unknown Store';

    // Updated effect to handle individual product fetching
    useEffect(() => {
        const loadProduct = async () => {
            // 1. Try to find in context first (fastest)
            if (products.length > 0) {
                const foundProduct = products.find(p => (p._id || p.id) === id || (p._id || p.id) === parseInt(id));
                if (foundProduct) {
                    setProduct(foundProduct);
                    setCurrentImageIndex(0);
                    return;
                }
            }

            // 2. If not in context (e.g. direct link or paginated out), fetch from API
            try {
                // Determine if we need to show loading? We render "Product not found" only if product is null AND we are done trying.
                // For now, let's just fetch.
                const response = await import('../utils/api').then(m => m.apiService.getProduct(id));
                if (response.success && response.data) {
                    setProduct(response.data);
                    setCurrentImageIndex(0);
                }
            } catch (err) {
                console.error('Failed to fetch individual product:', err);
                // Remains null, so "Product not found" will eventually show
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

    const handleCheckout = () => {
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 pb-32 transition-colors duration-200">
            <div className="max-w-7xl mx-auto">
                {/* Navigation Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
                    >
                        <ChevronLeft className="text-gray-600 dark:text-white" size={24} />
                    </button>
                    <div className="flex gap-4">
                        <button
                            onClick={handleToggleSave}
                            className={`p-2 transition-colors ${isSaved ? 'text-blue-600 fill-current' : 'text-gray-400 hover:text-blue-600'}`}
                        >
                            <Bookmark size={24} fill={isSaved ? "currentColor" : "none"} />
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
                                    <div key={idx} className={`min-w-full h-full snap-center flex items-center justify-center bg-white relative ${product.isGold ? 'border-4 border-yellow-400/50' : ''}`}>
                                        <img
                                            src={img || 'https://via.placeholder.com/400x400?text=No+Image'}
                                            alt={`${product.title} - ${t('View')} ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'; }}
                                        />
                                        {product.isGold && (
                                            <div className="absolute top-4 left-4 z-20">
                                                <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 mr-2 rounded-full flex items-center gap-1 shadow-lg shadow-yellow-400/40">
                                                    <span>⚡</span> {t('Gold Benefit')}
                                                </div>
                                            </div>
                                        )}
                                        {/* Unit Overlay */}
                                        {product.unit && (
                                            <div className="absolute bottom-0 right-0 bg-gray-900/80 backdrop-blur-sm px-3 py-1.5 rounded-tl-xl z-20">
                                                <span className="text-sm md:text-base font-bold text-white leading-none block">
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
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md">
                                        {t(product, 'category')}
                                    </span>
                                    {product.storeId && (
                                        <div className="flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full shadow-sm">
                                            <Store size={12} className="text-gray-600 dark:text-gray-300" />
                                            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                                                {storeName}
                                            </span>
                                        </div>
                                    )}
                                </div>


                                {(() => {
                                    const fullTitle = t(product, 'title');
                                    const bracketIndex = fullTitle.indexOf('(');

                                    if (bracketIndex !== -1) {
                                        const mainTitle = fullTitle.substring(0, bracketIndex).trim();
                                        const bracketText = fullTitle.substring(bracketIndex).trim();

                                        return (
                                            <div className="mb-4">
                                                <h1 className="text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-tight">
                                                    {mainTitle}
                                                </h1>
                                                <p className="text-base md:text-xl text-gray-600 dark:text-gray-400 mt-2 font-medium">
                                                    {bracketText}
                                                </p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <h1 className="text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4 leading-tight">
                                            {fullTitle}
                                        </h1>
                                    );
                                })()}

                                <div className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-8 flex items-baseline gap-2">
                                    ₹{Number(product.price).toFixed(0)}
                                    {product.unit && (
                                        <span className="text-lg md:text-2xl font-bold text-gray-600 dark:text-gray-400">
                                            / {product.unit}
                                        </span>
                                    )}
                                </div>

                                <div className="prose prose-lg dark:prose-invert max-w-none mb-10">
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                        {t(product, 'description')}
                                    </p>
                                </div>

                                {/* Dynamic Quantity & Action Area - Replaces Old Static Section */}
                                <div className="hidden md:block mb-8">
                                    <div className="flex items-center gap-4">
                                        {quantity === 0 ? (
                                            <div className="w-full flex gap-4">
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    className="flex-1 py-4 px-8 rounded-2xl font-bold text-xl shadow-lg border-2 border-indigo-500 text-indigo-600 bg-white hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
                                                >
                                                    <ShoppingCart size={24} />
                                                    {t('Add to Cart')}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        addToCart(product);
                                                        navigate('/checkout');
                                                    }}
                                                    className="flex-1 py-4 px-8 rounded-2xl font-bold text-xl shadow-lg shadow-blue-500/30 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1"
                                                >
                                                    <ShoppingBag size={24} />
                                                    {t('Buy Now')}
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                <div className="flex gap-4">
                                                    {/* Quantity Control Pill */}
                                                    <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-2xl p-2 px-2 w-48 flex-shrink-0">
                                                        <button
                                                            onClick={() => updateQuantity(productId, Math.max(0, quantity - 1))}
                                                            className="w-12 h-12 flex items-center justify-center text-gray-600 dark:text-gray-200 bg-white dark:bg-gray-600 rounded-xl shadow-sm hover:text-red-500 transition-colors"
                                                        >
                                                            <Minus size={22} strokeWidth={2.5} />
                                                        </button>
                                                        <span className="font-bold text-2xl text-gray-900 dark:text-white w-12 text-center tabular-nums">{quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(productId, quantity + 1)}
                                                            className="w-12 h-12 flex items-center justify-center text-white bg-blue-600 rounded-xl shadow-sm hover:bg-blue-700 transition-colors"
                                                        >
                                                            <Plus size={22} strokeWidth={2.5} />
                                                        </button>
                                                    </div>

                                                    {/* Buy Now Button (Consistent Look) */}
                                                    <button
                                                        onClick={handleCheckout}
                                                        className="flex-1 py-4 px-6 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/30 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1"
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
                                onClick={() => addToCart(product)}
                                className="flex-1 py-3.5 px-4 rounded-2xl font-bold text-base shadow-md border-2 border-indigo-500 text-indigo-600 bg-white active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <ShoppingCart size={20} />
                                {t('Add to Cart')}
                            </button>
                            <button
                                onClick={() => {
                                    addToCart(product);
                                    navigate('/checkout');
                                }}
                                className="flex-1 py-3.5 px-4 rounded-2xl font-bold text-base shadow-lg shadow-blue-500/30 bg-gradient-to-r from-blue-600 to-indigo-600 text-white active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <ShoppingBag size={20} />
                                {t('Buy Now')}
                            </button>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col gap-3">
                            <div className="flex gap-3 px-2">
                                {/* Mobile Quantity Pill */}
                                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-2xl p-1.5 w-36 flex-shrink-0">
                                    <button
                                        onClick={() => updateQuantity(productId, Math.max(0, quantity - 1))}
                                        className="w-10 h-10 flex items-center justify-center text-gray-600 bg-white dark:bg-gray-600 rounded-xl shadow-sm active:scale-90 transition-transform"
                                    >
                                        <Minus size={18} strokeWidth={2.5} />
                                    </button>
                                    <span className="font-bold text-xl text-gray-900 dark:text-white tabular-nums">{quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(productId, quantity + 1)}
                                        className="w-10 h-10 flex items-center justify-center text-white bg-blue-600 rounded-xl shadow-sm active:scale-90 transition-transform"
                                    >
                                        <Plus size={18} strokeWidth={2.5} />
                                    </button>
                                </div>

                                {/* Mobile Buy Now Button (Consistent) */}
                                <button
                                    onClick={handleCheckout}
                                    className="flex-1 py-3 px-4 rounded-2xl font-bold text-base shadow-lg shadow-blue-500/30 bg-gradient-to-r from-blue-600 to-indigo-600 text-white active:scale-95 transition-transform flex items-center justify-center gap-2"
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
