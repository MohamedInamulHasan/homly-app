import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { isStoreOpen } from '../../utils/storeHelpers';
import { groupProducts } from '../../utils/productGrouping';
import { useData } from '../../context/DataContext';
import ProductCard from '../ProductCard';

const StoreSection = ({ section, products = [] }) => {
    const { t } = useLanguage();
    const { stores: contextStores } = useData();

    if (products.length === 0) return null;

    const navigateTo = section.type === 'store' 
        ? `/store/${section.id}` 
        : `/store?category=${encodeURIComponent(section.name)}`;

    const isOpen = section.type === 'store' ? isStoreOpen(section.data) : true;

    return (
        <section className={`px-4 py-6 dark:bg-gray-900 border-b border-gray-50 dark:border-gray-800 last:border-b-0 transition-opacity duration-300 ${!isOpen ? 'opacity-80' : ''}`}>
            {/* Header */}
            <div className="flex justify-between items-end mb-4 px-1">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                            {t(section.name)}
                        </h2>
                        {!isOpen && (
                            <span className="bg-red-50 text-red-500 text-[9px] font-bold px-2 py-0.5 rounded-md border border-red-100 uppercase">
                                {t('Closed')}
                            </span>
                        )}
                    </div>
                    {section.address && (
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5 truncate max-w-[200px]">
                            {section.address}
                        </p>
                    )}
                </div>
                <Link to={navigateTo} className="text-sm font-bold text-[#2E5A2E] dark:text-green-400 hover:opacity-70 transition-all underline decoration-2 underline-offset-4">
                    {t('See All')}
                </Link>
            </div>
            
            {/* Horizontal Scroll Layout */}
            <div className="flex overflow-x-auto scrollbar-hide gap-3 pb-2 px-1">
                {(() => {
                    const groupedProducts = groupProducts(products, contextStores, { forcedStoreId: section.type === 'store' ? section.id : null }).slice(0, 16);
                    const rowCount = groupedProducts.length <= 2 ? 1 : 2;
                    
                    return (
                        <div className={`grid grid-rows-${rowCount} grid-flow-col gap-3`}>
                            {groupedProducts.map((product) => (
                                <div key={product._id || product.id} className="w-[160px]">
                                    <ProductCard 
                                        product={product} 
                                        showCartControls={true} 
                                        showHeart={true}
                                    />
                                </div>
                            ))}
                        </div>
                    );
                })()}
            </div>
        </section>
    );
};

export default StoreSection;
