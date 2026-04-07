import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/api';

const HeroBanner = ({ slides = [], isLoading = false }) => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

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
        <section className="px-4 py-2 relative overflow-hidden">
            <div className="relative h-44 rounded-3xl overflow-hidden shadow-sm bg-gray-100 dark:bg-gray-800">
                {slides.map((slide, index) => (
                    <div
                        key={slide._id || slide.id || index}
                        onClick={() => navigate('/store')}
                        className={`absolute inset-0 transition-opacity duration-1000 cursor-pointer ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img
                            src={slide.image || `${API_BASE_URL}/ads/${slide._id || slide.id}/image`}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://atlas-content-cdn.pixelbin.io/ast/feed_v2/static_assets/common/vegetable_basket.png'; }}
                        />
                    </div>
                ))}
                
                {/* Dots indicator */}
                {slides.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentSlide ? 'w-4 bg-white shadow-sm' : 'bg-white/40'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default HeroBanner;
