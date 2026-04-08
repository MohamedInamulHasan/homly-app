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
            {/* Compact Header Section */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-200 mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 leading-none flex items-center gap-2">
                                <Newspaper className="text-blue-600 dark:text-blue-400" size={24} />
                                {t('News & Updates')}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                {isNewsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 h-[400px] animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {sortedNews.map((item, index) => {
                            return (
                                <div key={item.id} onClick={() => openNews(item)} className="group bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700/50 overflow-hidden flex flex-col cursor-pointer min-h-[450px]">
                                    {/* Image Container */}
                                        {/* Simplified Image logic for layout - slider code preserved but structure cleaned */}
                                        {item.images && item.images.length > 0 ? (
                                            <img
                                                src={item.images[0]}
                                                alt={t(item, 'title')}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                        ) : (
                                            <img
                                                src={item.image}
                                                alt={t(item, 'title')}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

                                        <div className="absolute top-4 left-4">
                                            <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg">
                                                {t(item, 'category') || 'Update'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 md:p-8 flex flex-col flex-grow relative">
                                        <div className="flex items-center text-xs ml-1 text-blue-600 dark:text-blue-400 mb-3 font-semibold uppercase tracking-wide">
                                            <Calendar size={14} className="mr-2" />
                                            {new Date(item.createdAt || item.date).toLocaleString('en-US', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </div>

                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {t(item, 'title')}
                                        </h2>

                                        <div className="prose prose-sm dark:prose-invert max-w-none flex-grow">
                                            <p className="text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                                                {item.content ? t(item, 'content') : t(item, 'description')}
                                            </p>
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform flex items-center">
                                                {t('Read more')} <ArrowLeft className="rotate-180 ml-2 h-4 w-4" />
                                            </span>
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
                                <span className="inline-block px-3 py-1 bg-blue-600/90 text-white text-xs font-bold rounded-full uppercase tracking-wider mb-3 backdrop-blur-sm shadow-sm">
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
                                <Calendar size={16} className="mr-2 text-blue-500" />
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
