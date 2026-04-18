import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { isStoreOpen } from '../../utils/storeHelpers';
import { groupProducts } from '../../utils/productGrouping';
import { useData } from '../../context/DataContext';
import ProductCard from '../ProductCard';
import { useState, useEffect, useMemo } from 'react';

const StoreSection = ({ section, products = [] }) => {
    const { t } = useLanguage();
    const { stores: contextStores, globalSortOrder } = useData();
    const [cycleIndex, setCycleIndex] = useState(0);

    // 1. Group products by their category/subcategory
    const productsByCategory = useMemo(() => {
        const grouped = products.reduce((acc, p) => {
            const cat = p.category || 'Other';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(p);
            return acc;
        }, {});

        // Sort categories by product count (most products first)
        return Object.entries(grouped)
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 3); // Take top 3
    }, [products]);

    // 2. Auto-cycle timer (10 seconds)
    useEffect(() => {
        if (productsByCategory.length === 0) return;
        const interval = setInterval(() => {
            setCycleIndex(prev => prev + 1);
        }, 10000);
        return () => clearInterval(interval);
    }, [productsByCategory]);

    if (products.length === 0) return null;

    const navigateTo = section.type === 'store' 
        ? `/store/${section.id}` 
        : `/store?category=${encodeURIComponent(section.name)}`;

    const isOpen = section.type === 'store' ? isStoreOpen(section.data) : true;

    // 3. Logic to pick exactly 7 cards based on 2-3-2 or fallback
    const displayProducts = (() => {
        const slots = [];
        const numCats = productsByCategory.length;
        
        if (numCats === 0) return [];

        let distribution = [7];
        if (numCats === 3) distribution = [2, 3, 2];
        else if (numCats === 2) distribution = [4, 3];

        productsByCategory.forEach(([catName, catProducts], i) => {
            const slotCount = distribution[i];
            const groupedInCat = groupProducts(catProducts, contextStores, { forcedStoreId: section.type === 'store' ? section.id : null });
            
            // Apply global price sorting
            const sortedInCat = [...groupedInCat].sort((a, b) => {
                const priceA = Number(a.price || 0);
                const priceB = Number(b.price || 0);
                if (globalSortOrder === 'lowToHigh') return priceA - priceB;
                if (globalSortOrder === 'highToLow') return priceB - priceA;
                return 0;
            });

            // Pick unique products starting from an offset determined by cycleIndex
            const takeCount = Math.min(slotCount, sortedInCat.length);
            for (let j = 0; j < takeCount; j++) {
                const productIndex = (cycleIndex + j) % sortedInCat.length;
                slots.push(sortedInCat[productIndex]);
            }
        });

        return slots;
    })();

    return (
        <section className={`px-4 py-8 dark:bg-gray-900 border-b border-gray-50 dark:border-gray-800 last:border-b-0 transition-opacity duration-300 ${!isOpen ? 'opacity-80' : ''}`}>
            {/* Header */}
            <div className="flex justify-between items-end mb-6 px-1">
                <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight truncate max-w-[280px] xs:max-w-[320px] sm:max-w-[450px] md:max-w-none">
                            {t(section.name)}
                        </h2>
                    </div>
                    {section.address && (
                        <p className="text-[11px] text-gray-400 font-medium mt-1 truncate max-w-[260px] sm:max-w-[400px]">
                            {section.address}
                        </p>
                    )}
                </div>
                <Link to={navigateTo} className="text-[13px] font-bold text-[#2E5A2E] dark:text-green-400 hover:opacity-70 transition-all underline decoration-[2.5px] underline-offset-[6px]">
                    {t('See All')}
                </Link>
            </div>
            
            {/* Horizontal Scroll Layout (Fixed at 7 Cards) */}
            <div className="flex overflow-x-auto scrollbar-hide gap-4 pb-2 px-1">
                <div className="flex gap-4">
                    {displayProducts.map((product, idx) => (
                        <div 
                            key={`${product._id || product.id}-${idx}-${cycleIndex}`} 
                            className="w-[165px] md:w-[190px] lg:w-[210px] shrink-0 animate-in fade-in slide-in-from-right-2 duration-500"
                        >
                            <ProductCard 
                                product={product} 
                                showCartControls={true} 
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StoreSection;
