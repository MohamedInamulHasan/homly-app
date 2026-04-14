import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { API_BASE_URL } from '../../utils/api';

const HeroBanner = ({ slides = [], isLoading = false }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [currentSlide, setCurrentSlide] = useState(0);
    const scrollRef = useRef(null);

    // Auto-slide logic
    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            const nextSlide = (currentSlide + 1) % slides.length;
            scrollToSlide(nextSlide);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length, currentSlide]);

    const scrollToSlide = (index) => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const slideWidth = container.offsetWidth;
            container.scrollTo({
                left: slideWidth * index,
                behavior: 'smooth'
            });
            setCurrentSlide(index);
        }
    };

    const handleScroll = () => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const scrollLeft = container.scrollLeft;
            const slideWidth = container.offsetWidth;
            const newIndex = Math.round(scrollLeft / slideWidth);
            if (newIndex !== currentSlide) {
                setCurrentSlide(newIndex);
            }
        }
    };

    const handleBuy = (e, slide) => {
        e.stopPropagation(); // Don't navigate to store/link
        
        // Transform ad to item for direct purchase
        const adItem = {
            id: slide._id || slide.id,
            product: slide._id || slide.id,
            title: slide.offerTitle || slide.title || 'Offer Item',
            name: slide.offerTitle || slide.title || 'Offer Item',
            price: Number(slide.price),
            quantity: 1,
            image: slide.image || `${API_BASE_URL}/ads/${slide._id || slide.id}/image`,
            storeId: slide.storeId,
            storeName: slide.storeName,
            isFromAd: true,
            adTitle: slide.offerTitle || slide.title,
            unit: slide.unit || '' // If ads have units
        };
        
        // Navigate directly to checkout bypassing the cart
        navigate('/checkout', { 
            state: { 
                directPurchase: { 
                    items: [adItem], 
                    total: adItem.price 
                } 
            } 
        });
    };

    if (isLoading) {
        return (
            <div className="px-4 py-2">
                <div className="w-full h-44 bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse"></div>
            </div>
        );
    }

    if (slides.length === 0) {
        return (
            <section className="px-4 py-2">
                <div className="relative h-44 rounded-3xl overflow-hidden shadow-sm bg-gradient-to-br from-[#E6F9E6] to-[#D1F2D1] flex items-center justify-center">
                    <img 
                        src="https://atlas-content-cdn.pixelbin.io/ast/feed_v2/static_assets/common/vegetable_basket.png" 
                        alt="Fresh Vegetables" 
                        className="w-full h-full object-cover"
                    />
                </div>
            </section>
        );
    }

    return (
        <section className="px-4 py-2 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-sm bg-gray-100 dark:bg-gray-800 h-44">
                {/* Scrollable Container */}
                <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar h-full w-full touch-pan-x"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {slides.map((slide, index) => (
                        <div
                            key={slide._id || slide.id || index}
                            onClick={() => {
                                if (slide.link) {
                                    if (slide.link.startsWith('/')) navigate(slide.link);
                                    else window.open(slide.link, '_blank');
                                } else {
                                    navigate('/shop');
                                }
                            }}
                            className="w-full h-full flex-shrink-0 snap-center cursor-pointer relative group"
                        >
                            <img
                                src={slide.image || `${API_BASE_URL}/ads/${slide._id || slide.id}/image`}
                                alt={slide.title}
                                className="w-full h-full object-cover pointer-events-none"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://atlas-content-cdn.pixelbin.io/ast/feed_v2/static_assets/common/vegetable_basket.png'; }}
                            />

                            {/* Buy Option Overlay */}
                            {slide.price > 0 && (
                                <div className="absolute bottom-4 right-4 z-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <button
                                        onClick={(e) => handleBuy(e, slide)}
                                        className="bg-[#2E5A2E] dark:bg-[#CBF9B2] text-white dark:text-[#2E5A2E] px-4 py-2.5 rounded-2xl flex items-center gap-2 active:scale-95 transition-all font-black text-sm"
                                    >
                                        <ShoppingBag size={18} />
                                        <span>₹{slide.price}</span>
                                    </button>
                                </div>
                            )}

                            {/* Store Name Badge */}
                            {slide.storeName && (
                                <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">
                                    <p className="text-white text-[10px] font-bold tracking-tight uppercase">{slide.storeName}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                {/* Dots indicator */}
                {slides.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    scrollToSlide(index);
                                }}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-4 bg-white' : 'bg-white/40'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            ` }} />
        </section>
    );
};

export default HeroBanner;
