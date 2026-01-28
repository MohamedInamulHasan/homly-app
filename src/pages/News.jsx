import { useEffect } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';

const News = () => {
    const navigate = useNavigate();
    const { news: newsItems, loading } = useData();
    const { t } = useLanguage();


    const sortedNews = [...newsItems].sort((a, b) => {
        const lenA = (a.content || a.description || '').length;
        const lenB = (b.content || b.description || '').length;
        return lenA - lenB;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        {t('Back')}
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('News & Offers')}</h1>
                    <div className="w-5" /> {/* Spacer for alignment */}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                    {loading?.news ? (
                        // Loading Skeleton
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700/50 flex flex-col h-[450px] animate-pulse">
                                <div className="h-56 bg-gray-200 dark:bg-gray-700 shrink-0"></div>
                                <div className="p-6 flex flex-col flex-grow space-y-4">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                    <div className="space-y-2 flex-grow">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        sortedNews.map((item) => {
                            const contentLength = (item.content || item.description || '').length;
                            const isSmall = contentLength < 200;

                            return (
                                <div key={item.id} className={`bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 dark:border-gray-700/50 group flex flex-col ${isSmall ? '' : 'h-full'}`}>
                                    {/* Image Section - Now with Slider */}
                                    <div className="relative h-56 shrink-0 overflow-hidden group/slider">
                                        {item.images && item.images.length > 1 ? (
                                            <div className="h-full w-full relative">
                                                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full w-full">
                                                    {item.images.map((img, idx) => (
                                                        <div key={idx} className="min-w-full h-full snap-center">
                                                            <img
                                                                src={img}
                                                                alt={`${item.title} - ${idx + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                                                    {item.images.map((_, idx) => (
                                                        <div key={idx} className="w-1.5 h-1.5 rounded-full bg-white/70" />
                                                    ))}
                                                </div>
                                                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                                    {item.images.length} photos
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full w-full relative">
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                                            </div>
                                        )}

                                        {/* Category Badge */}
                                        <div className="absolute top-4 left-4 z-10 pointer-events-none">
                                            <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-md text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-lg border border-blue-400/30">
                                                {t(item, 'category')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-6 flex flex-col flex-grow relative">
                                        {/* Decorative Background Element - Scaled down for cards */}
                                        <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 text-gray-900 dark:text-white transform rotate-12 pointer-events-none">
                                            <Calendar size={80} strokeWidth={1} />
                                        </div>

                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wide">
                                            <Calendar size={12} className="mr-2 text-blue-500" />
                                            {new Date(item.createdAt || item.date).toLocaleString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>

                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                            {t(item, 'title')}
                                        </h2>

                                        <div className="prose prose-sm dark:prose-invert max-w-none flex-grow">
                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                                                {item.content ? t(item, 'content') : t(item, 'description')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default News;
