import React from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';

const CategorySection = ({ categories = [], isLoading = false }) => {
    const { t } = useLanguage();

    if (isLoading) {
        return (
            <section className="px-4 py-4 mt-2">
                <div className="flex justify-between items-center mb-4 px-1">
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                </div>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
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
        <section className="px-4 py-4 mt-2">
            <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('Shop By Categories')}
                </h2>
                <Link to="/store" className="text-sm font-semibold text-[#2E5A2E] dark:text-green-400 hover:opacity-80 transition-all">
                    {t('See All')}
                </Link>
            </div>
            
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 px-1">
                {categories.map((category) => (
                    <Link
                        key={category._id || category.id}
                        to={`/store?category=${encodeURIComponent(category.name)}`}
                        className="flex flex-col items-center gap-2 md:gap-3 group min-w-[72px] md:min-w-[85px] lg:min-w-[110px]"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden bg-[#CBF9B2] dark:bg-green-900/30 flex items-center justify-center transition-all group-hover:scale-110 shadow-sm border-none">
                            <img
                                src={category.image || `${API_BASE_URL}/categories/${category._id || category.id}/image`}
                                alt={category.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://cdn-icons-png.flaticon.com/512/3014/3014470.png'; }}
                            />
                        </div>
                        <span className="text-[11px] md:text-xs lg:text-sm font-semibold text-gray-600 dark:text-gray-400 group-hover:text-[#2E5A2E] text-center max-w-[80px] md:max-w-[110px] transition-colors truncate">
                            {t(category.name)}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default CategorySection;
