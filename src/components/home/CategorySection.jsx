import React, { useState } from 'react';
import { API_BASE_URL } from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';

const CategorySection = ({ categories = [], isLoading = false, selectedCategory = 'All', onSelectCategory }) => {
    const { t, language } = useLanguage();
    const { settings } = useData();
    const [isExpanded, setIsExpanded] = useState(false);
    const allCategoryImage = settings?.allCategoryImage || '';
    const allCategoryName = settings?.allCategoryName || '';

    if (isLoading) {
        return (
            <section className="py-4 mt-2">
                <div className="flex justify-between items-center mb-4 px-4">
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                            <div className="h-3 w-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (categories.length === 0) return null;

    return (
        <section className="py-4 mt-2">
            <div className="flex justify-between items-center mb-4 px-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('Shop By Categories')}
                </h2>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-sm font-semibold text-[#2E5A2E] dark:text-[#CBF9B2] hover:opacity-80 transition-all"
                >
                    {isExpanded ? t('Show Less') : t('See All')}
                </button>
            </div>

            <div className={isExpanded
                ? "grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-x-2 gap-y-6 px-4 py-2"
                : "flex gap-4 overflow-x-auto scrollbar-hide py-2 px-4"
            }>

                {/* All Categories Option — styled like other category items */}
                <div
                    onClick={() => onSelectCategory('All')}
                    className={`${isExpanded ? 'w-full' : 'min-w-[72px] md:min-w-[85px] lg:min-w-[110px]'} flex flex-col items-center gap-2 md:gap-3 group cursor-pointer`}
                >
                    <div className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden flex items-center justify-center transition-all group-hover:scale-105 shadow-sm border-2 bg-[#CBF9B2] dark:bg-[#CBF9B2] ${selectedCategory === 'All' ? 'border-[#2E5A2E] dark:border-[#2E5A2E]' : 'border-transparent'}`}>
                        {allCategoryImage ? (
                            <img
                                src={allCategoryImage}
                                alt="All Categories"
                                className={`w-full h-full object-cover rounded-full transition-transform ${selectedCategory === 'All' ? 'scale-90' : ''}`}
                            />
                        ) : (
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/9356/9356230.png"
                                alt="All Categories"
                                className={`w-full h-full object-cover rounded-full transition-transform p-2 ${selectedCategory === 'All' ? 'scale-90' : ''}`}
                            />
                        )}
                    </div>
                    <span className={`text-[11px] md:text-xs lg:text-sm font-bold transition-colors truncate ${selectedCategory === 'All' ? 'text-[#2E5A2E] dark:text-[#CBF9B2]' : 'text-gray-400'}`}>
                        {allCategoryName || t('All')}
                    </span>
                </div>

                {categories.map((category) => {
                    const isSelected = selectedCategory === category.name;
                    return (
                        <div
                            key={category._id || category.id}
                            onClick={() => onSelectCategory(category.name)}
                            className={`${isExpanded ? 'w-full' : 'min-w-[72px] md:min-w-[85px] lg:min-w-[110px]'} flex flex-col items-center gap-2 md:gap-3 group cursor-pointer`}
                        >
                            <div className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden flex items-center justify-center transition-all group-hover:scale-105 shadow-sm border-2 bg-[#CBF9B2] dark:bg-[#CBF9B2] ${isSelected ? 'border-[#2E5A2E] dark:border-[#2E5A2E]' : 'border-transparent'}`}>
                                <img
                                    src={`${category.image || `${API_BASE_URL}/categories/${category._id || category.id}/image`}?t=${Math.floor((category.updatedAt ? new Date(category.updatedAt).getTime() : Date.now()) / 60000)}`}
                                    alt={category.name}
                                    className={`w-full h-full object-cover rounded-full transition-transform ${isSelected ? 'scale-90' : ''}`}
                                    loading="lazy"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://cdn-icons-png.flaticon.com/512/3014/3014470.png'; }}
                                />
                            </div>
                            <div className={`flex flex-col items-center justify-center text-center w-full max-w-[80px] md:max-w-[110px] transition-colors ${isSelected ? 'text-[#2E5A2E] dark:text-[#CBF9B2]' : 'text-gray-600 dark:text-gray-400'}`}>
                                {(() => {
                                    const fullTitle = t(category.name);
                                    let mainPart = fullTitle;
                                    let bracketPart = null;

                                    const bracketIndex = fullTitle.indexOf('(');
                                    if (bracketIndex !== -1) {
                                        const part1 = fullTitle.substring(0, bracketIndex).trim();
                                        const part2 = fullTitle.substring(bracketIndex + 1, fullTitle.length - 1).trim();

                                        const isPart1Tamil = /[\u0B80-\u0BFF]/.test(part1);
                                        const isPart2Tamil = /[\u0B80-\u0BFF]/.test(part2);

                                        let tamStr = '';
                                        let engStr = '';

                                        if (isPart1Tamil && !isPart2Tamil) {
                                            tamStr = part1;
                                            engStr = part2;
                                        } else if (isPart2Tamil && !isPart1Tamil) {
                                            tamStr = part2;
                                            engStr = part1;
                                        } else {
                                            engStr = part1;
                                            tamStr = part2;
                                        }

                                        if (language === 'ta') {
                                            mainPart = tamStr || engStr;
                                            bracketPart = tamStr && engStr ? `(${engStr})` : null;
                                        } else {
                                            mainPart = engStr || tamStr;
                                            bracketPart = engStr && tamStr ? `(${tamStr})` : null;
                                        }
                                    }

                                    return (
                                        <>
                                            <span className={`text-[11px] md:text-xs lg:text-sm truncate w-full ${isSelected ? 'font-bold' : 'font-semibold'}`}>{mainPart}</span>
                                            {bracketPart && (
                                                <span className={`text-[9px] md:text-[10px] lg:text-[11px] truncate w-full opacity-80 ${isSelected ? 'font-semibold' : 'font-medium'}`}>{bracketPart}</span>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default CategorySection;
