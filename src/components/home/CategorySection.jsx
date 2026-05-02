import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';

const CategorySection = ({ categories = [], isLoading = false, selectedCategory = 'All', onSelectCategory }) => {
    const { t, language } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);
    const allCategoryImage = localStorage.getItem('allCategoryImage') || '';

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
                    className="text-sm font-semibold text-[#2E5A2E] dark:text-green-400 hover:opacity-80 transition-all"
                >
                    {isExpanded ? t('Show Less') : t('See All')}
                </button>
            </div>
            
            <div className={isExpanded 
                ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-2 gap-y-6 p-2 px-4"
                : "flex gap-4 overflow-x-auto scrollbar-hide py-2 px-4"
            }>
                {/* All Categories Option */}
                <div
                    onClick={() => onSelectCategory('All')}
                    className={`${
                        isExpanded ? 'w-full' : 'min-w-[72px] md:min-w-[85px] lg:min-w-[110px]'
                    } flex flex-col items-center gap-2 md:gap-3 group cursor-pointer`}
                >
                    <div className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden flex items-center justify-center transition-all group-hover:scale-105 border-2 bg-[#CBF9B2] dark:bg-[#2E5A2E] ${selectedCategory === 'All' ? 'border-[#2E5A2E] dark:border-[#CBF9B2]' : 'border-transparent'}`}>
                        {allCategoryImage ? (
                            <img src={allCategoryImage} alt="All" className="w-full h-full object-cover rounded-full" />
                        ) : (
                            <div className="grid grid-cols-3 gap-[3px] p-2 w-full h-full">
                                {[...Array(9)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`rounded-[3px] ${
                                            selectedCategory === 'All'
                                                ? 'bg-[#2E5A2E] dark:bg-[#CBF9B2]'
                                                : 'bg-[#2E5A2E]/50 dark:bg-[#CBF9B2]/60'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <span className={`text-[11px] md:text-xs lg:text-sm font-bold transition-colors truncate ${selectedCategory === 'All' ? 'text-[#2E5A2E]' : 'text-gray-400'}`}>
                        {t('All')}
                    </span>
                </div>

                {categories.map((category) => {
                    const isSelected = selectedCategory === category.name;
                    return (
                        <div
                            key={category._id || category.id}
                            onClick={() => onSelectCategory(category.name)}
                            className={`${
                                isExpanded ? 'w-full' : 'min-w-[72px] md:min-w-[85px] lg:min-w-[110px]'
                            } flex flex-col items-center gap-2 md:gap-3 group cursor-pointer`}
                        >
                            <div className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden flex items-center justify-center transition-all group-hover:scale-105 shadow-sm border-2 bg-[#CBF9B2] dark:bg-[#2E5A2E] ${isSelected ? 'border-[#2E5A2E] dark:border-[#CBF9B2]' : 'border-transparent'}`}>
                                <img
                                    src={category.image || `${API_BASE_URL}/categories/${category._id || category.id}/image`}
                                    alt={category.name}
                                    className={`w-full h-full object-cover rounded-full ${isSelected ? 'scale-90 transition-transform' : ''}`}
                                    loading="lazy"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://cdn-icons-png.flaticon.com/512/3014/3014470.png'; }}
                                />
                            </div>
                            <div className={`flex flex-col items-center justify-center text-center w-full max-w-[80px] md:max-w-[110px] transition-colors ${isSelected ? 'text-[#2E5A2E]' : 'text-gray-600 dark:text-gray-400'}`}>
                                {(() => {
                                   const fullTitle = t(category.name);
                                   let mainPart = fullTitle;
                                   let bracketPart = null;

                                   const bracketIndex = fullTitle.indexOf('(');
                                   if (bracketIndex !== -1) {
                                       const part1 = fullTitle.substring(0, bracketIndex).trim();
                                       const part2 = fullTitle.substring(bracketIndex + 1, fullTitle.length - 1).trim();
                                       
                                       // Detect which part contains Tamil characters
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
                                            // Fallback default assumption: First part is English, second is Tamil
                                            engStr = part1;
                                            tamStr = part2;
                                       }

                                       if (language === 'ta') {
                                            mainPart = tamStr || engStr; // Use Tamil if available, else fallback to whatever is there
                                            bracketPart = tamStr && engStr ? `(${engStr})` : null;
                                       } else {
                                            mainPart = engStr || tamStr; // Use English if available
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
