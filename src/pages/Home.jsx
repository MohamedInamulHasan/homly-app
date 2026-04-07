import { useState, useMemo } from 'react';
import { Search, ListFilter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/queries/useProducts';
import { useAds } from '../hooks/queries/useAds';
import { useCategories } from '../hooks/queries/useCategories';
import { useStores } from '../hooks/queries/useStores';
import { useLanguage } from '../context/LanguageContext';
import { isStoreOpen } from '../utils/storeHelpers';
import HomeHeader from '../components/home/HomeHeader';
import HeroBanner from '../components/home/HeroBanner';
import CategorySection from '../components/home/CategorySection';
import StoreSection from '../components/home/StoreSection';
import PullToRefreshLayout from '../components/PullToRefreshLayout';

const Home = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { t } = useLanguage();

    // Data Fetching
    const { data: rawProducts = [], isLoading: loadingProducts } = useProducts();
    const { data: ads = [], isLoading: loadingAds } = useAds();
    const { data: rawCategories = [], isLoading: loadingCategories } = useCategories();
    const { data: rawStores = [], isLoading: loadingStores } = useStores();

    const products = useMemo(() => {
        const raw = Array.isArray(rawProducts) ? rawProducts : (rawProducts?.data || []);
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        return raw.filter(p => {
            if (p.isAvailable === false) return false;
            if (p.useTimeLimit) {
                const opening = p.openingTime || '00:00';
                const closing = p.closingTime || '23:59';
                if (opening <= closing) {
                    if (currentTime < opening || currentTime > closing) return false;
                } else {
                    if (currentTime < opening && currentTime > closing) return false;
                }
            }
            return true;
        });
    }, [rawProducts]);

    const stores = Array.isArray(rawStores) ? rawStores : (rawStores?.data || []);

    // Filter categories
    const featuredCategories = useMemo(() => {
        const raw = Array.isArray(rawCategories) ? rawCategories : (rawCategories?.data || []);
        return raw.filter(cat => !cat.isHidden);
    }, [rawCategories]);

    // Grouping Logic
    const groupedByStore = useMemo(() => {
        return products.reduce((acc, product) => {
            const storeId = product.storeId?._id || product.storeId;
            const key = storeId || `category_${product.category || 'Other'}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(product);
            return acc;
        }, {});
    }, [products]);

    // Create sections list
    const displaySections = useMemo(() => {
        const sections = [];

        // 1. Add real stores
        stores.forEach(s => {
            const storeId = s._id || s.id;
            if (groupedByStore[storeId]) {
                sections.push({
                    id: storeId,
                    name: s.name,
                    address: s.address,
                    type: 'store',
                    data: s
                });
            }
        });

        // 2. Add orphan category sections
        Object.entries(groupedByStore).forEach(([key, products]) => {
            if (key.startsWith('category_')) {
                const categoryName = key.replace('category_', '');
                sections.push({
                    id: key,
                    name: categoryName,
                    type: 'category',
                    data: { name: categoryName }
                });
            }
        });

        // Sort by Store Status
        return sections.sort((a, b) => {
            const aOpen = a.type === 'store' ? isStoreOpen(a.data) : true;
            const bOpen = b.type === 'store' ? isStoreOpen(b.data) : true;
            if (aOpen && !bOpen) return -1;
            if (!aOpen && bOpen) return 1;
            return 0;
        });
    }, [stores, groupedByStore]);

    const isLoadingAll = loadingProducts || loadingStores || loadingCategories;

    return (
        <PullToRefreshLayout>
            <div className="min-h-screen bg-[#E8EAEF] dark:bg-gray-900 pb-24 transition-colors duration-200">
                
                {/* Premium Light Green Header Card (Matches Store Products Design) */}
                <div className="w-full bg-[#CBF9B2] rounded-b-[2.5rem] px-2 pt-4 pb-5 shadow-sm relative overflow-hidden mb-4">
                    {/* Background Accents (Subtle light accents) */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        <HomeHeader />
                    </div>
                </div>

                {/* Search Bar (Now Below the Design with Filter) */}
                <section className="px-4 relative z-20 mb-8">
                    <div className="flex items-center gap-3 max-w-2xl mx-auto">
                        <div className="relative group flex-1">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (searchQuery.trim()) {
                                        navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
                                    }
                                }}
                            >
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('Search by fresh groceries...')}
                                    className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-300"
                                />
                                <Search 
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2E5A2E] transition-colors" 
                                    size={20} 
                                />
                            </form>
                        </div>
                        
                        {/* Round Filter Button (Matching Store design but no shadow) */}
                        <button className="w-14 h-14 bg-white rounded-full flex-shrink-0 flex items-center justify-center border border-gray-200 transition-all active:scale-90 group">
                            <ListFilter size={24} className="text-gray-900 group-hover:text-[#2E5A2E] transition-colors" />
                        </button>
                    </div>
                </section>



                {/* Ads */}
                <HeroBanner slides={ads} isLoading={loadingAds} />

                {/* Categories */}
                <CategorySection categories={featuredCategories} isLoading={loadingCategories} />

                {/* Store Sections */}
                {isLoadingAll ? (
                   <section className="px-4 py-4 mt-2">
                        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-6"></div>
                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="aspect-[4/5] bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse"></div>
                            ))}
                        </div>
                    </section>
                ) : displaySections.length > 0 ? (
                    <div className="space-y-4">
                        {displaySections.map((section) => (
                            <StoreSection 
                                key={section.id} 
                                section={section} 
                                products={groupedByStore[section.id]} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        {t('No products found')}
                    </div>
                )}

            </div>
        </PullToRefreshLayout>
    );
};

export default Home;
