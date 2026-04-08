import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, X, Newspaper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';

const News = () => {
    const navigate = useNavigate();
    const { news: newsItems, loading, initialLoading } = useData();
    const { t } = useLanguage();

    const isNewsLoading = loading?.news || initialLoading;

    const [selectedNews, setSelectedNews] = useState(null);

    const sortedNews = [...newsItems].sort((a, b) => {
        const lenA = (a.content || a.description || '').length;
        const lenB = (b.content || b.description || '').length;
        return lenA - lenB;
    });

    // Helper to open modal
    const openNews = (item) => {
        setSelectedNews(item);
    };

    // Helper to close modal
    const closeNews = () => {
        setSelectedNews(null);
    };

    return (
        <div className="min-h-screen bg-[#E8EAEF] dark:bg-gray-900 transition-colors duration-200">
            {/* Premium Light Green Header Card */}
            <div className="w-full bg-[#CBF9B2] rounded-b-[2.5rem] px-4 pt-6 pb-6 shadow-sm relative overflow-hidden mb-8">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10">
                    <div className="max-w-7xl mx-auto px-2 relative">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2">
                            <button 
                                onClick={() => navigate(-1)} 
                                className="w-[42px] h-[42px] flex items-center justify-center bg-white rounded-full text-gray-900 transition-transform active:scale-95 shadow-sm border border-gray-100/50"
                            >
                                <ArrowLeft size={22} />
                            </button>
                        </div>
                        
                        <div className="flex flex-col items-center text-center">
                            <h1 className="text-[18px] font-bold text-gray-900 tracking-tight flex items-center justify-center gap-2">
                                <Newspaper className="text-[#2E5A2E]" size={20} />
                                {t('News & Updates')}
                            </h1>
                            <p className="text-[#2E5A2E] text-[13px] font-medium mt-0.5">
                                {t('Stay updated with Homly')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                {isNewsLoading ? (
                    <div className="grid grid-cols-1 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl h-24 mb-2 shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {sortedNews.map((item, index) => {
                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => openNews(item)} 
                                    className="group flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700/50 cursor-pointer"
                                >
                                    {/* Left Side: Square Image */}
                                    <div className="w-20 h-20 flex-shrink-0 relative">
                                        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                                        <img
                                            src={item.image || (item.images && item.images[0])}
                                            alt={t(item, 'title')}
                                            className="absolute inset-0 w-full h-full object-cover rounded-xl z-10"
                                            onError={(e) => { e.target.src = 'https://placehold.co/200x200?text=News'; }}
                                        />
                                    </div>

                                    {/* Middle: Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="px-1.5 py-0.5 bg-[#CBF9B2]/20 rounded text-[9px] font-bold text-[#2E5A2E] dark:text-[#CBF9B2] uppercase tracking-wider">
                                                {t(item, 'category') || t('Update')}
                                            </span>
                                            <div className="flex items-center text-[10px] text-gray-400 font-medium">
                                                <Calendar size={10} className="mr-1" />
                                                {new Date(item.createdAt || item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                        <h3 className="text-gray-900 dark:text-white text-[15px] font-semibold truncate mb-1">
                                            {t(item, 'title')}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-[11px] line-clamp-2 leading-snug">
                                            {item.content ? t(item, 'content') : t(item, 'description')}
                                        </p>
                                    </div>

                                    {/* Right Side: Simple Arrow Icon */}
                                    <div className="flex-shrink-0 pr-1">
                                        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:text-[#2E5A2E] dark:group-hover:text-[#CBF9B2] transition-colors">
                                            <ArrowLeft size={16} className="rotate-180" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* News Detail Modal */}
            {selectedNews && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={closeNews}>
                    <div
                        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all scale-100 opacity-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header Image */}
                        <div className="relative h-64 md:h-80 flex-shrink-0">
                            <img
                                src={selectedNews.image || (selectedNews.images && selectedNews.images[0])}
                                alt={t(selectedNews, 'title')}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <button
                                onClick={closeNews}
                                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                            <div className="absolute bottom-6 left-6 right-6">
                                <span className="inline-block px-3 py-1 bg-[#2E5A2E]/90 text-white text-xs font-bold rounded-full uppercase tracking-wider mb-3 backdrop-blur-sm shadow-sm">
                                    {t(selectedNews, 'category')}
                                </span>
                                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                                    {t(selectedNews, 'title')}
                                </h2>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                                <Calendar size={16} className="mr-2 text-[#2E5A2E]" />
                                {new Date(selectedNews.createdAt || selectedNews.date).toLocaleString('en-US', {
                                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </div>

                            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {t(selectedNews, 'content') || t(selectedNews, 'description')}
                            </div>


                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default News;
