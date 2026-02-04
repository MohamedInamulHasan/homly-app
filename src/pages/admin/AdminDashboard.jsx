import { API_BASE_URL } from '../../utils/api';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Package,
    Store,
    Newspaper,
    ShoppingBag,
    Users,
    Plus,
    Upload,
    Search,
    CheckCircle,
    XCircle,
    ChevronRight,
    MapPin,
    Phone,
    Mail,
    ArrowLeft,
    List,
    Menu,
    X,
    Edit2,
    Save,
    Pencil,

    Trash2,
    Image as ImageIcon,
    RefreshCw,
    Wrench,
    Zap,
    ClipboardList,
    Shield,
    Settings
} from 'lucide-react';
import { useData } from '../../context/DataContext'; // Retain for now, remove piecemeal
import { useLanguage } from '../../context/LanguageContext';
import { compressImage, validateImageSize } from '../../utils/imageCompression';
import StoreManagement from './StoreManagement';
import SettingsManagement from './SettingsManagement';
import useCloudinaryUpload from '../../hooks/useCloudinaryUpload';

// New Query Hooks
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../../hooks/queries/useProducts';
import { useStores } from '../../hooks/queries/useStores';
import { useNews, useCreateNews, useUpdateNews, useDeleteNews } from '../../hooks/queries/useNews';
import { useUsers, useDeleteUser, useUpdateUser } from '../../hooks/queries/useUsers';
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from '../../hooks/queries/useCategories';
import { useAds, useCreateAd, useDeleteAd, useUpdateAd } from '../../hooks/queries/useAds';
import { useServices, useCreateService, useDeleteService, useUpdateService } from '../../hooks/queries/useServices';
import { useServiceRequests, useUpdateServiceRequestStatus, useDeleteServiceRequest } from '../../hooks/queries/useServiceRequests';
import { useOrders, useUpdateOrderStatus, useDeleteOrder } from '../../hooks/queries/useOrders';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

const AdminDashboard = () => {
    const { user } = useData(); // Get current user
    const isStoreAdmin = user?.role === 'store_admin';
    const [activeTab, setActiveTab] = useState(isStoreAdmin ? 'stores' : 'products');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { t } = useLanguage();

    // Redirect Store Admin to 'stores' tab if they try to go elsewhere (basic protection)
    useEffect(() => {
        if (isStoreAdmin && activeTab !== 'stores' && activeTab !== 'products' && activeTab !== 'orders') {
            setActiveTab('stores');
        }
    }, [isStoreAdmin, activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'products':
                return <ProductManagement />;
            case 'stores':
                return <StoreManagement />;
            case 'news':
                return <NewsManagement />;
            case 'orders':
                return <OrderManagement />;
            case 'users':
                return <UserManagement />;
            case 'categories':
                return <CategoryManagement />;
            case 'ads':
                return <AdsManagement />;
            case 'services':
                return <ServiceManagement />;
            case 'service-requests':
                return <ServiceRequestManagement />;
            case 'settings':
                return <SettingsManagement />;
            default:
                return <ProductManagement />;
        }
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    // --- STORE ADMIN VIEW ---
    if (isStoreAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200 relative">
                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMobileMenu}
                    className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-600 dark:text-gray-300"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Sidebar Overlay for Mobile */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Simplified Sidebar for Store Admin */}
                <div className={`
                    fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
                    transform transition-transform duration-300 ease-in-out md:translate-x-0 md:hidden flex flex-col
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Store className="text-blue-600 dark:text-blue-400" />
                            {t('My Store')}
                        </h1>
                    </div>
                    <nav className="flex-1 p-4 space-y-2">
                        <SidebarItem
                            icon={<Store size={20} />}
                            label={t('Store Details')}
                            id="stores"
                            active={activeTab === 'stores'}
                            onClick={setActiveTab}
                        />
                        <SidebarItem
                            icon={<Package size={20} />}
                            label={t('Products')}
                            id="products"
                            active={activeTab === 'products'}
                            onClick={setActiveTab}
                        />
                        <SidebarItem
                            icon={<ShoppingBag size={20} />}
                            label={t('Orders')}
                            id="orders"
                            active={activeTab === 'orders'}
                            onClick={setActiveTab}
                        />
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto w-full">
                    <div className="p-4 md:p-8 pt-16 md:pt-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <Store className="text-blue-600 dark:text-blue-400" size={24} />
                                    </div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {activeTab === 'stores' ? t('My Store') :
                                            activeTab === 'products' ? t('Product Inventory') :
                                                activeTab === 'orders' ? t('Orders') : t('My Store')}
                                    </h1>
                                </div>
                                {/* Hide user name on mobile */}
                                <div className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                                    {user?.name}
                                </div>
                            </div>
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- GLOBAL ADMIN VIEW ---
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200 relative">
            {/* Mobile Menu Button */}
            <button
                onClick={toggleMobileMenu}
                className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-600 dark:text-gray-300"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Overlay for Mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
                transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex flex-col
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <LayoutDashboard className="text-blue-600 dark:text-blue-400" />
                        {t('Admin Panel')}
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <SidebarItem
                        icon={<Store size={20} />}
                        label={t('Stores')}
                        id="stores"
                        active={activeTab === 'stores'}
                        onClick={setActiveTab}
                    />
                    <SidebarItem
                        icon={<Package size={20} />}
                        label={t('Products')}
                        id="products"
                        active={activeTab === 'products'}
                        onClick={setActiveTab}
                    />
                    <SidebarItem
                        icon={<ShoppingBag size={20} />}
                        label={t('Orders')}
                        id="orders"
                        active={activeTab === 'orders'}
                        onClick={setActiveTab}
                    />

                    {/* Admin Only Sections */}
                    <SidebarItem
                        icon={<Newspaper size={20} />}
                        label={t('News')}
                        id="news"
                        active={activeTab === 'news'}
                        onClick={setActiveTab}
                    />
                    <SidebarItem
                        icon={<Users size={20} />}
                        label={t('Users')}
                        id="users"
                        active={activeTab === 'users'}
                        onClick={setActiveTab}
                    />
                    <SidebarItem
                        icon={<List size={20} />}
                        label={t('Categories')}
                        id="categories"
                        active={activeTab === 'categories'}
                        onClick={setActiveTab}
                    />
                    <SidebarItem
                        icon={<ImageIcon size={20} />}
                        label={t('Ads')}
                        id="ads"
                        active={activeTab === 'ads'}
                        onClick={setActiveTab}
                    />
                    <SidebarItem
                        icon={<Wrench size={20} />}
                        label={t('Services')}
                        id="services"
                        active={activeTab === 'services'}
                        onClick={setActiveTab}
                    />
                    <SidebarItem
                        icon={<ClipboardList size={20} />}
                        label={t('Service Requests')}
                        id="service-requests"
                        active={activeTab === 'service-requests'}
                        onClick={setActiveTab}
                    />
                    <div className="my-2 border-t border-gray-100 dark:border-gray-700"></div>
                    <SidebarItem
                        icon={<Settings size={20} />}
                        label={t('Settings')}
                        id="settings"
                        active={activeTab === 'settings'}
                        onClick={setActiveTab}
                    />
                    {/* End Settings Link */}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto w-full">
                <div className="p-4 md:p-8 pt-16 md:pt-8">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

const SidebarItem = ({ icon, label, id, active, onClick, hidden = false }) => {
    if (hidden) return null;

    return (
        <button
            onClick={() => onClick(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${active
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
        >
            {icon}
            {label}
        </button>
    );
};

// --- Sub-Components ---

const ProductManagement = () => {
    // const { products, stores, categories, addProduct, updateProduct, deleteProduct } = useData(); // OLD

    // NEW HOOKS
    const { data: rawProducts = [] } = useProducts();
    const { data: rawStores = [] } = useStores();
    const { data: rawCategories = [] } = useCategories();

    const products = Array.isArray(rawProducts) ? rawProducts : (rawProducts?.data || []);
    const stores = Array.isArray(rawStores) ? rawStores : (rawStores?.data || []);
    const categories = Array.isArray(rawCategories) ? rawCategories : (rawCategories?.data || []);

    const { mutateAsync: addProduct } = useCreateProduct();
    const { mutateAsync: updateProduct } = useUpdateProduct();
    const { mutateAsync: deleteProduct } = useDeleteProduct();
    const queryClient = useQueryClient();

    const { t } = useLanguage();
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        category: '',
        subcategory: '', // For products in categories with subcategories
        storeId: '',
        description: '',
        image: '',
        sliderImages: []
    });

    const { uploadImage, uploading } = useCloudinaryUpload();

    const handleImageUpload = async (e, isSlider = false) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            try {
                // Upload logic
                for (const file of files) {
                    const imageUrl = await uploadImage(file);
                    if (isSlider) {
                        setFormData(prev => ({ ...prev, sliderImages: [...prev.sliderImages, imageUrl] }));
                    } else {
                        setFormData(prev => ({ ...prev, image: imageUrl }));
                    }
                }
            } catch (error) {
                console.error('Upload failed:', error);
                alert('Image upload failed. Please try again.');
            }
        }
    };

    const removeSliderImage = (index) => {
        setFormData(prev => ({
            ...prev,
            sliderImages: prev.sliderImages.filter((_, i) => i !== index)
        }));
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            title: product.title,
            price: product.price,
            category: product.category,
            subcategory: product.subcategory || '',
            storeId: product.storeId || '',
            description: product.description,
            image: product.image || (product.images && product.images[0]) || '',
            sliderImages: product.images || [],
            stock: product.stock || 0,
            unit: product.unit || ''
        });
        setView('form');
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('Are you sure you want to delete this product?'))) {
            try {
                await deleteProduct(id);
                alert(t('Product deleted successfully!'));
            } catch (error) {
                alert(t('Failed to delete product. Please try again.'));
                console.error('Error deleting product:', error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare the images array
        const imagesArray = formData.sliderImages.length > 0
            ? formData.sliderImages
            : (formData.image ? [formData.image] : []);

        const productData = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            subcategory: formData.subcategory, // Added subcategory
            price: parseFloat(formData.price),
            image: formData.image || imagesArray[0], // Main image (required)
            images: imagesArray, // Array of images (optional)
            stock: parseInt(formData.stock) || 0,
            unit: formData.unit // Send unit as is (empty string if not provided)
        };

        // Add storeId only if it's not empty
        if (formData.storeId) {
            productData.storeId = formData.storeId;
        }

        try {
            if (editingProduct) {
                const updateData = { ...productData };

                // Don't send proxy URL for main image
                if (updateData.image && (updateData.image.includes(API_BASE_URL) || updateData.image.includes('/api/products'))) {
                    delete updateData.image;
                }

                // Filter out proxy URLs from slider images if they exist
                if (updateData.images && updateData.images.length > 0) {
                    updateData.images = updateData.images.filter(img =>
                        !img.includes(API_BASE_URL) && !img.includes('/api/products')
                    );
                    // If we filtered everything (no new images), we might need to handle logic differently
                    // But usually sliderImages replaces the array. 
                    // WAIT: If we remove existing images from the array, they will be DELETED from the product?
                    // Usually yes. But here the problem is we are sending the LINK back.
                    // If we send back `['http.../api/products/1/image', 'base64...']`
                    // The backend saves that.
                    // The issue is SPECIFICALLY when the backend serves that saved link, it redirects to itself.
                    // For slider images, we PROBABLY want to keep the existing valid URLs if they are external (Cloudinary).
                    // BUT if they are our own proxy links, we are stuck.
                    // Actually, `product.images` should be the actual Cloudinary URLs if we use Cloudinary.
                    // The proxy is used when we DON'T have a direct link (legacy or local).
                    // If `product.images` contains proxy links, it means valid data is lost or text is "corrupted" to proxy link.
                    // Let's assume for slider images we keep them AS IS for now unless we are sure.
                    // Only main image is the primary offender usually.
                }

                await updateProduct({ id: editingProduct.id || editingProduct._id, data: updateData }); // Correct signature
                alert(t('Product updated successfully!'));
            } else {
                await addProduct(productData);
                alert(t('Product uploaded successfully!'));
            }
            setFormData({ title: '', price: '', category: '', subcategory: '', storeId: '', description: '', image: '', sliderImages: [], stock: 0, unit: 'kg' });
            setEditingProduct(null);
            setView('list');
        } catch (error) {
            alert(t('Failed to save product. Please try again.'));
            console.error('Error saving product:', error);
        }
    };

    return (
        <div className="max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {view === 'list' ? t('Product Inventory') : editingProduct ? t('Edit Product') : t('Add New Product')}
                </h2>
                <button
                    onClick={() => {
                        if (view === 'list') {
                            setEditingProduct(null);
                            setFormData({ title: '', price: '', category: '', subcategory: '', storeId: '', description: '', image: '', sliderImages: [], stock: 0, unit: '' });
                            setView('form');
                        } else {
                            setView('list');
                        }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    {view === 'list' ? <Plus size={20} /> : <List size={20} />}
                    {view === 'list' ? t('Add Product') : t('View List')}
                </button>
            </div>

            {view === 'list' ? (
                <>
                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('Search products...')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Image')}</th>
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Title')}</th>
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Category')}</th>
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Price')}</th>
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Availability')}</th>
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {products
                                        .filter(p => !p.storeId)
                                        .filter(p =>
                                            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
                                        )
                                        .map(product => (
                                            <tr key={product.id || product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="p-4">
                                                    <img
                                                        src={product.image || `${API_BASE_URL}/products/${product.id || product._id}/image`}
                                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=No+Image'; }}
                                                        alt={product.title}
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                    />
                                                </td>
                                                <td className="p-4 font-medium text-gray-900 dark:text-white">
                                                    {(() => {
                                                        const fullTitle = product.title;
                                                        const bracketIndex = fullTitle?.indexOf('(');

                                                        if (bracketIndex !== -1) {
                                                            const mainTitle = fullTitle.substring(0, bracketIndex).trim();
                                                            const bracketText = fullTitle.substring(bracketIndex).trim();
                                                            return (
                                                                <div className="max-w-[150px] sm:max-w-xs">
                                                                    <div className="truncate" title={mainTitle}>{mainTitle}</div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={bracketText}>{bracketText}</div>
                                                                </div>
                                                            );
                                                        }
                                                        return (
                                                            <div className="max-w-[150px] sm:max-w-xs truncate" title={fullTitle}>
                                                                {fullTitle}
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="p-4 text-gray-500 dark:text-gray-400">
                                                    {(() => {
                                                        const fullCategory = product.category;
                                                        const bracketIndex = fullCategory?.indexOf('(');

                                                        if (bracketIndex !== -1) {
                                                            const mainCategory = fullCategory.substring(0, bracketIndex).trim();
                                                            const bracketText = fullCategory.substring(bracketIndex).trim();
                                                            return (
                                                                <div className="max-w-[120px]">
                                                                    <div className="truncate" title={mainCategory}>{mainCategory}</div>
                                                                    <div className="text-xs text-gray-400 dark:text-gray-500 truncate" title={bracketText}>{bracketText}</div>
                                                                </div>
                                                            );
                                                        }
                                                        return (
                                                            <div className="max-w-[120px] truncate" title={fullCategory}>
                                                                {fullCategory}
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="p-4 font-medium text-gray-900 dark:text-white">₹{product.price}</td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={async () => {
                                                            const currentStatus = product.isAvailable !== false;
                                                            const productId = product._id || product.id;

                                                            // Optimistic update - instant UI response
                                                            queryClient.setQueryData(['products'], (old) => {
                                                                const oldData = Array.isArray(old) ? old : (old?.data || []);
                                                                return oldData.map(p =>
                                                                    (p._id || p.id) === productId
                                                                        ? { ...p, isAvailable: !currentStatus }
                                                                        : p
                                                                );
                                                            });

                                                            try {
                                                                await updateProduct({
                                                                    id: productId,
                                                                    data: { ...product, isAvailable: !currentStatus }
                                                                });
                                                            } catch (error) {
                                                                // Rollback on error
                                                                queryClient.setQueryData(['products'], (old) => {
                                                                    const oldData = Array.isArray(old) ? old : (old?.data || []);
                                                                    return oldData.map(p =>
                                                                        (p._id || p.id) === productId
                                                                            ? { ...p, isAvailable: currentStatus }
                                                                            : p
                                                                    );
                                                                });
                                                                console.error('Failed to toggle availability:', error);
                                                                alert(t('Failed to update status'));
                                                            }
                                                        }}
                                                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${product.isAvailable !== false ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                                                            }`}
                                                        title={product.isAvailable !== false ? t('Available') : t('Out of Stock')}
                                                    >
                                                        <motion.span
                                                            layout
                                                            transition={{ type: "spring", stiffness: 700, damping: 30 }}
                                                            animate={{ x: product.isAvailable !== false ? 22 : 2 }}
                                                            className="inline-block h-5 w-5 transform rounded-full bg-white shadow-md"
                                                        />
                                                    </button>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={async () => {
                                                                const currentIsGold = product.isGold === true;
                                                                const productId = product._id || product.id;
                                                                try {
                                                                    await updateProduct({ id: productId, data: { isGold: !currentIsGold } });
                                                                } catch (error) {
                                                                    console.error("Failed to toggle gold status", error);
                                                                    alert(t('Failed to update product status'));
                                                                }
                                                            }}
                                                            className={`p-2 rounded-lg transition-colors ${product.isGold
                                                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400'
                                                                }`}
                                                            title={t('Toggle Gold Card')}
                                                        >
                                                            <Zap size={18} fill={product.isGold ? "currentColor" : "none"} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(product)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product.id || product._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Product Title')}</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder={t('e.g., Wireless Headphones')}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Price')}</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Mention (e.g., kg, packs)')}</label>
                                <input
                                    type="text"
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder={t('e.g., 1 kg, 500g, 1 Pack')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Category')}</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => {
                                        setFormData({ ...formData, category: e.target.value, subcategory: '' });
                                    }}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                >
                                    <option value="">{t('Select Category')}</option>
                                    {categories && categories.length > 0 && categories.map((cat) => (
                                        <option key={cat._id || cat.id} value={cat.name}>
                                            {t(cat.name)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Subcategory dropdown - always visible, optional */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('Subcategory')} ({t('Optional')})
                                </label>
                                <select
                                    value={formData.subcategory}
                                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">{t('None')}</option>
                                    {(() => {
                                        const selectedCategory = categories.find(cat => cat.name === formData.category);
                                        if (selectedCategory?.subcategories && selectedCategory.subcategories.length > 0) {
                                            return selectedCategory.subcategories.map((sub, index) => (
                                                <option key={index} value={sub}>
                                                    {t(sub)}
                                                </option>
                                            ));
                                        }
                                        return null;
                                    })()}
                                </select>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {t('Select a subcategory if the main category has any')}
                                </p>
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Store')}</label>
                                <select
                                    value={formData.storeId}
                                    onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">{t('Select Store (Optional)')}</option>
                                    {stores.map(store => (
                                        <option key={store.id || store._id} value={store.id || store._id}>
                                            {t(store, 'name')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Main Image')}</label>
                                <div className="flex items-center gap-4">
                                    {formData.image && (
                                        <img src={formData.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                                    )}
                                    <label className="flex-1 cursor-pointer">
                                        <div className="w-full px-4 py-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                                            <Upload size={20} />
                                            <span>{uploading ? 'Uploading...' : t('Upload Image')}</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, false)}
                                            className="hidden"
                                            required={!formData.image}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Slider Images (Optional)')}</label>
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-4">
                                        {formData.sliderImages.map((img, idx) => (
                                            <div key={idx} className="relative w-20 h-20 group">
                                                <img src={img} alt={`Slider ${idx}`} className="w-full h-full rounded-lg object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeSliderImage(idx)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <label className="cursor-pointer">
                                            <div className="w-20 h-20 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center">
                                                <Plus size={24} />
                                            </div>
                                            <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, true)} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Description')}</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="4"
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder={t('Product description...')}
                                required
                            ></textarea>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                {editingProduct ? <Save size={20} /> : <Plus size={20} />}
                                {editingProduct ? t('Update Product') : t('Add Product')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};


const NewsManagement = () => {
    // const { news, addNews, updateNews, deleteNews } = useData();

    // NEW HOOKS
    const { data: news = [] } = useNews();
    const { mutateAsync: addNews } = useCreateNews();
    const { mutateAsync: updateNews } = useUpdateNews();
    const { mutateAsync: deleteNews } = useDeleteNews();

    const { t } = useLanguage();
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [editingNews, setEditingNews] = useState(null);
    const [newsForm, setNewsForm] = useState({
        headline: '',
        type: 'Offer',
        image: '',
        sliderImages: [],
        stock: 0,
        unit: '',
        content: '',
    });

    const { uploadImage, uploading: uploadingNews } = useCloudinaryUpload();

    const handleNewsImageUpload = async (e, isSlider = false) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            try {
                if (isSlider) {
                    const promises = files.map(file => uploadImage(file));
                    const urls = await Promise.all(promises);
                    setNewsForm(prev => ({ ...prev, sliderImages: [...prev.sliderImages, ...urls] }));
                } else {
                    const imageUrl = await uploadImage(files[0]);
                    setNewsForm(prev => ({ ...prev, image: imageUrl }));
                }
            } catch (error) {
                console.error('Error uploading news image:', error);
                alert(t('Failed to upload image. Please try another image.'));
            }
        }
    };

    const removeNewsSliderImage = (index) => {
        setNewsForm(prev => ({
            ...prev,
            sliderImages: prev.sliderImages.filter((_, i) => i !== index)
        }));
    };

    const handleEditNews = (item) => {
        setEditingNews(item);
        setNewsForm({
            headline: item.title, // Map title to headline
            type: item.category, // Map category to type
            image: item.image,
            sliderImages: item.images || [],
            content: item.content || item.description, // Map content to content form field
        });
        setView('form');
    };

    const handleDeleteNews = async (id) => {
        if (window.confirm(t('Are you sure you want to delete this post?'))) {
            try {
                await deleteNews(id);
                alert(t('Post deleted successfully!'));
            } catch (error) {
                console.error('Error deleting news:', error);
                alert(t('Failed to delete post. Please try again.'));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newsItem = {
            title: newsForm.headline,
            category: newsForm.type,
            image: newsForm.image,
            images: newsForm.sliderImages.length > 0 ? newsForm.sliderImages : (newsForm.image ? [newsForm.image] : []),
            content: newsForm.content
        };

        setEditingNews(null);
        setView('list');
    };

    return (
        <div className="max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {view === 'list' ? t('News & Offers') : editingNews ? t('Edit Post') : t('Publish News & Offers')}
                </h2>
                <button
                    onClick={() => {
                        if (view === 'list') {
                            setEditingNews(null);
                            setNewsForm({ headline: '', type: 'Offer', image: '', sliderImages: [], content: '' });
                            setView('form');
                        } else {
                            setView('list');
                        }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    {view === 'list' ? <Plus size={20} /> : <ArrowLeft size={20} />}
                    {view === 'list' ? t('Add Post') : t('Back')}
                </button>
            </div>

            {view === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {news.map(item => (
                        // ... News modifications within NewsManagement ...
                        <div key={item._id || item.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col group relative">
                            {/* Removed absolute overlay icons */}
                            <div className="h-48 overflow-hidden">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.category === 'Offer' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                        {item.category}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                                    {item.content || item.description}
                                </p>

                                {/* New Footer for Actions */}
                                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEditNews(item); }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                        title={t('Edit')}
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteNews(item._id || item.id); }}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title={t('Delete')}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Headline')}</label>
                            <input
                                type="text"
                                value={newsForm.headline}
                                onChange={(e) => setNewsForm({ ...newsForm, headline: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Type')}</label>
                                <select
                                    value={newsForm.type}
                                    onChange={(e) => setNewsForm({ ...newsForm, type: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option>{t('Offer')}</option>
                                    <option>{t('News')}</option>
                                    <option>{t('Deal')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Post Image')}</label>
                                <div className="flex items-center gap-4">
                                    {newsForm.image && (
                                        <img src={newsForm.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                                    )}
                                    <label className="flex-1 cursor-pointer">
                                        <div className="w-full px-4 py-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                                            <Upload size={20} />
                                            <span>{uploadingNews ? t('Uploading...') : t('Upload Image')}</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleNewsImageUpload}
                                            className="hidden"
                                            required={!newsForm.image}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Content')}</label>
                            <textarea
                                rows="5"
                                value={newsForm.content}
                                onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            ></textarea>
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                                {editingNews ? <Save size={20} /> : <Newspaper size={20} />}
                                {editingNews ? t('Update Post') : t('Publish')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

const OrderManagement = () => {
    const { data: orders = [] } = useOrders();
    const { mutateAsync: updateOrderStatus } = useUpdateOrderStatus();
    const { mutateAsync: deleteOrder } = useDeleteOrder();
    const { t } = useLanguage();

    const [editingOrder, setEditingOrder] = useState(null);
    const [editAddress, setEditAddress] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        // useOrders query will be refetched automatically if query keys change or on manual invalidation
        // but since we want a visual feedback:
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await updateOrderStatus({ id, status: newStatus });
            alert(t('Order status updated successfully!'));
        } catch (error) {
            console.error('Error updating status:', error);
            alert(t('Failed to update status'));
        }
    };

    const handleEditOrder = (order) => {
        setEditingOrder(order._id || order.id);
        const street = order.shippingAddress?.street || '';
        const city = order.shippingAddress?.city || '';
        setEditAddress(`${street}${street && city ? ', ' : ''}${city}`);
    };

    const saveOrder = async (id) => {
        // Note: The backend typically handles address updates via a different endpoint or specific logic
        // For now, if we only have updateOrderStatus, we might need a more generic update hook
        // but let's assume updateOrderStatus is what's used for the main interaction.
        // If saveOrder is for address, we might need useUpdateOrder (generic).
        // For now, I'll placeholder it as alert since address editing in order list is less common.
        alert(t('Feature coming soon: Full order editing. Status updates are functional.'));
        setEditingOrder(null);
    };

    const handleDeleteOrder = async (id) => {
        if (window.confirm(t('Are you sure you want to delete this order?'))) {
            try {
                await deleteOrder(id);
                alert(t('Order deleted successfully!'));
            } catch (error) {
                console.error('Error deleting order:', error);
                alert(t('Failed to delete order'));
            }
        }
    };

    // Group orders by status
    const processingOrders = orders.filter(o => o.status === 'Processing');
    const shippedOrders = orders.filter(o => o.status === 'Shipped');
    const deliveredOrders = orders.filter(o => o.status === 'Delivered');
    const cancelledOrders = orders.filter(o => o.status === 'Cancelled');

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return (
            <div>
                <div className="font-medium text-gray-900 dark:text-gray-200 whitespace-nowrap">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </div>
            </div>
        );
    };

    const renderOrderTable = (ordersList, statusLabel, statusColor) => {
        if (ordersList.length === 0) return null;

        return (
            <div key={statusLabel} className="mb-8">
                <h3 className={`text-lg font-semibold mb-4 ${statusColor}`}>
                    {t(statusLabel)} ({ordersList.length})
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Order ID')}</th>
                                    <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Customer')}</th>
                                    <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Mobile')}</th>
                                    <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Address')}</th>
                                    <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Date & Time')}</th>
                                    <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Total')}</th>
                                    <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Status')}</th>
                                    <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {ordersList.map(order => (
                                    <tr key={order._id || order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">#{String(order._id || order.id).slice(-6).toUpperCase()}</td>
                                        <td className="p-4 text-gray-600 dark:text-gray-300">{order.shippingAddress?.name || order.user}</td>
                                        <td className="p-4 text-gray-600 dark:text-gray-300">{order.shippingAddress?.mobile || 'N/A'}</td>
                                        <td className="p-4 text-gray-500 dark:text-gray-400 text-sm max-w-xs">
                                            {editingOrder === (order._id || order.id) ? (
                                                <input
                                                    type="text"
                                                    value={editAddress}
                                                    onChange={(e) => setEditAddress(e.target.value)}
                                                    className="w-full px-2 py-1 border rounded"
                                                />
                                            ) : (
                                                <span className="truncate block" title={`${order.shippingAddress?.street}, ${order.shippingAddress?.city}`}>
                                                    {order.shippingAddress ? `${order.shippingAddress.street}, ${order.shippingAddress.city}` : 'N/A'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">
                                            {formatDateTime(order.createdAt || order.date)}
                                        </td>
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">₹{(
                                            (order.items?.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0) || 0) +
                                            (Number(order.shipping) || 20) -
                                            (Number(order.discount) || 0)
                                        ).toFixed(0)}</td>
                                        <td className="p-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order._id || order.id, e.target.value)}
                                                className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {/* Current status is always shown */}
                                                <option value={order.status}>{t(order.status)}</option>

                                                {/* Show valid next statuses based on current status */}
                                                {order.status === 'Processing' && (
                                                    <>
                                                        <option value="Shipped">{t('Shipped')}</option>
                                                        <option value="Cancelled">{t('Cancelled')}</option>
                                                    </>
                                                )}
                                                {order.status === 'Shipped' && (
                                                    <>
                                                        <option value="Delivered">{t('Delivered')}</option>
                                                        <option value="Cancelled">{t('Cancelled')}</option>
                                                    </>
                                                )}
                                                {/* Delivered and Cancelled are final states - no changes allowed */}
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            {editingOrder === (order._id || order.id) ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => saveOrder(order._id || order.id)} className="text-green-600 hover:text-green-700"><CheckCircle size={18} /></button>
                                                    <button onClick={() => setEditingOrder(null)} className="text-red-600 hover:text-red-700"><XCircle size={18} /></button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEditOrder(order)} className="text-blue-600 hover:text-blue-700">
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button onClick={() => handleDeleteOrder(order._id || order.id)} className="text-red-600 hover:text-red-700">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('Manage Orders')}</h2>
                <button
                    onClick={handleManualRefresh}
                    className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-blue-600 dark:text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`}
                    title={t('Refresh Orders')}
                >
                    <RefreshCw size={24} />
                </button>
            </div>

            {/* Render orders grouped by status */}
            {renderOrderTable(processingOrders, 'Processing Orders', 'text-amber-700 dark:text-amber-400')}
            {renderOrderTable(shippedOrders, 'Shipped Orders', 'text-blue-700 dark:text-blue-400')}
            {renderOrderTable(deliveredOrders, 'Delivered Orders', 'text-green-700 dark:text-green-400')}
            {renderOrderTable(cancelledOrders, 'Cancelled Orders', 'text-red-700 dark:text-red-400')}

            {orders.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                    <p className="text-gray-500 dark:text-gray-400">{t('No orders found')}</p>
                </div>
            )}
        </div>
    );
};

const CategoryManagement = () => {
    // const { categories, fetchCategories, addCategory, updateCategory, deleteCategory } = useData();
    // NEW HOOKS
    const { data: categories = [] } = useCategories();
    const { mutateAsync: addCategory } = useCreateCategory();
    const { mutateAsync: updateCategory } = useUpdateCategory();
    const { mutateAsync: deleteCategory } = useDeleteCategory();
    const { t } = useLanguage();
    const [view, setView] = useState('list');
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        image: '',
        subcategories: [] // Array of subcategory names
    });
    const [newSubcategory, setNewSubcategory] = useState(''); // For adding new subcategories

    // Categories are automatically fetched by useCategories hook

    const { uploadImage, uploading: uploadingCategory } = useCloudinaryUpload();

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const imageUrl = await uploadImage(file);
                setFormData(prev => ({ ...prev, image: imageUrl }));
            } catch (error) {
                console.error('Error uploading category image:', error);
                alert(t('Failed to upload image. Please try another image.'));
            }
        }
    };

    const handleAddSubcategory = () => {
        if (newSubcategory.trim()) {
            setFormData(prev => ({
                ...prev,
                subcategories: [...prev.subcategories, newSubcategory.trim()]
            }));
            setNewSubcategory('');
        }
    };

    const handleRemoveSubcategory = (index) => {
        setFormData(prev => ({
            ...prev,
            subcategories: prev.subcategories.filter((_, i) => i !== index)
        }));
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        // Use API fallback for image if not directly stored
        const imageUrl = category.image || `${API_BASE_URL}/categories/${category._id || category.id}/image`;
        setFormData({
            name: category.name,
            image: imageUrl,
            subcategories: category.subcategories || []
        });
        setView('form');
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('Are you sure you want to delete this category?'))) {
            try {
                await deleteCategory(id);
                alert(t('Category deleted successfully!'));
            } catch (error) {
                const errorMessage = error?.message || error?.data?.message || t('Failed to delete category. Please try again.');
                alert(errorMessage);
                console.error('Error deleting category:', error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingCategory) {
                const updateData = { ...formData };
                // Check if image is a backend proxy URL (hasn't been changed)
                // If it contains API_BASE_URL or '/api/categories', don't send it
                if (updateData.image && (updateData.image.includes(API_BASE_URL) || updateData.image.includes('/api/categories'))) {
                    delete updateData.image;
                }

                await updateCategory({ id: editingCategory._id || editingCategory.id, data: updateData });
                alert(t('Category updated successfully!'));
            } else {
                console.log('Adding category with data:', formData);
                const result = await addCategory(formData);
                console.log('Category add result:', result);
                alert(t('Category added successfully!'));
            }
            setFormData({ name: '', image: '', subcategories: [] });
            setNewSubcategory('');
            setEditingCategory(null);
            setView('list');
            // Categories will auto-refresh via React Query
        } catch (error) {
            console.error('Error saving category - Full details:', error);

            // Display specific error message from backend
            const errorMessage = error?.message || error?.data?.message || 'Failed to save category. Please try again.';
            alert(t(errorMessage));
        }
    };

    return (
        <div className="max-w-5xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {view === 'list' ? t('Categories') : editingCategory ? t('Edit Category') : t('Add New Category')}
                </h2>
                <button
                    onClick={() => {
                        if (view === 'list') {
                            setEditingCategory(null);
                            setFormData({ name: '', image: '', subcategories: [] });
                            setNewSubcategory('');
                            setView('form');
                        } else {
                            setView('list');
                        }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    {view === 'list' ? <Plus size={20} /> : <List size={20} />}
                    {view === 'list' ? t('Add Category') : t('View List')}
                </button>
            </div>

            {view === 'list' ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Image')}</th>
                                    <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Name')}</th>
                                    <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {categories.length > 0 ? categories.map(category => (
                                    <tr key={category._id || category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="p-4">
                                            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-700">
                                                <img
                                                    src={category.image || `${API_BASE_URL}/categories/${category._id || category.id}/image`}
                                                    alt={category.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://via.placeholder.com/64?text=No+Image";
                                                    }}
                                                />
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">
                                            {(() => {
                                                const fullName = category.name;
                                                const bracketIndex = fullName?.indexOf('(');

                                                if (bracketIndex !== -1) {
                                                    const mainName = fullName.substring(0, bracketIndex).trim();
                                                    const bracketText = fullName.substring(bracketIndex).trim();
                                                    return (
                                                        <div className="max-w-[150px]">
                                                            <div className="truncate" title={mainName}>{mainName}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={bracketText}>{bracketText}</div>
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <div className="max-w-[150px] truncate" title={fullName}>
                                                        {fullName}
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category._id || category.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" className="p-8 text-center text-gray-500 dark:text-gray-400">
                                            {t('No categories found. Add one to get started!')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Category Name')}</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder={t('e.g., Vegetables')}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Subcategories')} ({t('Optional')})</label>
                            <div className="space-y-3">
                                {/* Input field with add button */}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        value={newSubcategory}
                                        onChange={(e) => setNewSubcategory(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddSubcategory();
                                            }
                                        }}
                                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder={t('e.g., Spices, Snacks, Beverages')}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddSubcategory}
                                        className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                                    >
                                        <Plus size={20} />
                                        {t('Add')}
                                    </button>
                                </div>

                                {/* List of added subcategories */}
                                {formData.subcategories.length > 0 && (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">{t('Added Subcategories')}:</p>
                                        {formData.subcategories.map((sub, index) => (
                                            <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 px-3 py-2 rounded-lg">
                                                <span className="text-sm text-gray-900 dark:text-white">{sub}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSubcategory(index)}
                                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-400">{t('Add subcategories for this main category (e.g., for Grocery: Spices, Snacks, Beverages)')}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Category Image')}</label>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                {formData.image && (
                                    <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-gray-200 dark:ring-gray-700">
                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://via.placeholder.com/80?text=No+Image";
                                            }}
                                        />
                                    </div>
                                )}
                                <label className="flex-1 cursor-pointer">
                                    <div className="w-full px-4 py-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                                        <Upload size={20} />
                                        <span>{uploadingCategory ? t('Uploading...') : (formData.image ? t('Change Image') : t('Upload Image'))}</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        required={!formData.image}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={uploadingCategory}
                                className={`w-full sm:w-auto px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${uploadingCategory
                                    ? 'bg-gray-400 cursor-not-allowed text-white'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {uploadingCategory ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>{t('Uploading...')}</span>
                                    </>
                                ) : (
                                    <>
                                        {editingCategory ? <Save size={20} /> : <Plus size={20} />}
                                        {editingCategory ? t('Update Category') : t('Add Category')}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

const UserManagement = () => {
    // const { users, fetchUsers, updateUser, deleteUser, stores } = useData();
    // NEW HOOKS
    const { data: users = [], refetch: fetchUsers } = useUsers();
    const { mutateAsync: updateUser } = useUpdateUser();
    const { mutateAsync: deleteUser } = useDeleteUser();
    const { data: stores = [] } = useStores();

    const { t } = useLanguage();
    const [editingUser, setEditingUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        address: '',
        role: 'customer',
        storeId: '',
        location: ''
    });
    const [searchQuery, setSearchQuery] = useState('');

    // Stats for Top Card
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const storeAdminCount = users.filter(u => u.role === 'store_admin').length;
    const customerCount = users.filter(u => u.role === 'customer').length;

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log('Fetching users...');
                await fetchUsers();
                console.log('Users fetched successfully, count:', users.length);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError(err?.message || 'Failed to load users');
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
    }, []);

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            mobile: user.mobile || '',
            address: user.address || '',
            role: user.role || 'customer',
            storeId: user.storeId?._id || user.storeId || '', // Handle populated object or direct ID
            coins: user.coins || 0,
            location: user.location || ''
        });
    };

    const handleSave = async () => {
        try {
            console.log('Updating user:', { id: editingUser._id || editingUser.id, data: formData });
            // useUpdateUser hook expects { id, data } payload
            await updateUser({ id: editingUser._id || editingUser.id, data: formData });
            alert(t('User updated successfully!'));
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            console.error('Error updating user - Full details:', error);
            const errorMessage = error?.message || error?.data?.message || 'Failed to update user. Please try again.';
            alert(t(errorMessage));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('Are you sure you want to delete this user?'))) {
            try {
                console.log('Deleting user with ID:', id);
                await deleteUser(id);
                alert(t('User deleted successfully!'));
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user - Full details:', error);
                const errorMessage = error?.message || error?.data?.message || 'Failed to delete user. Please try again.';
                alert(t(errorMessage));
            }
        }
    };

    return (
        <div className="max-w-6xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('User Database')}</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            <Users size={20} />
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('Total Users')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                            <CheckCircle size={20} />
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('Customers')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{customerCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                            <Store size={20} />
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('Store Admins')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{storeAdminCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
                            <Shield size={20} />
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('Admins')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{adminCount}</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder={t('Search users by name or email...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
            </div>

            {loading && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">{t('Loading users...')}</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-6 mb-6">
                    <p className="text-red-600 dark:text-red-400">{t('Error')}: {error}</p>
                    <button
                        onClick={() => fetchUsers()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        {t('Retry')}
                    </button>
                </div>
            )}

            {!loading && !error && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('User')}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('Contact')}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('Role')}</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('Location')}</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {users.filter(user => {
                                    const query = searchQuery.toLowerCase();
                                    return user.name?.toLowerCase().includes(query) ||
                                        user.email?.toLowerCase().includes(query);
                                }).length > 0 ? users.filter(user => {
                                    const query = searchQuery.toLowerCase();
                                    return user.name?.toLowerCase().includes(query) ||
                                        user.email?.toLowerCase().includes(query);
                                }).map((user) => (
                                    <tr key={user._id || user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{user.name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                                                <div className="flex items-center gap-1 text-gray-900 dark:text-white whitespace-nowrap">
                                                    <Mail size={14} className="text-gray-400" />
                                                    <span>{user.email}</span>
                                                </div>
                                                {user.mobile && (
                                                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                        <span className="hidden sm:inline text-gray-300">|</span>
                                                        <Phone size={14} className="text-gray-400" />
                                                        <span>{user.mobile}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap 
                                                ${user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                    user.role === 'store_admin' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                                                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                                                {t(user.role === 'store_admin' ? 'Store Admin' : user.role.charAt(0).toUpperCase() + user.role.slice(1))}
                                            </span>
                                            {user.role === 'store_admin' && user.storeId && (
                                                <div className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                                                    {user.storeId.name || 'Store Linked'}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                            {user.location || ''}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {editingUser && (editingUser._id || editingUser.id) === (user._id || user.id) ? (
                                                <div className="space-y-4 text-left">
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('Edit User Role')}</h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Role')}</label>
                                                            <select
                                                                value={formData.role}
                                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                            >
                                                                <option value="customer">{t('Customer')}</option>
                                                                <option value="store_admin">{t('Store Admin')}</option>
                                                                <option value="admin">{t('Global Admin')}</option>
                                                            </select>
                                                        </div>
                                                        {formData.role === 'store_admin' && (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Assign Store')}</label>
                                                                <select
                                                                    value={formData.storeId}
                                                                    onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                                >
                                                                    <option value="">{t('Select Store')}</option>
                                                                    {stores.map(store => (
                                                                        <option key={store._id || store.id} value={store._id || store.id}>
                                                                            {store.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Full Name')}</label>
                                                            <input
                                                                type="text"
                                                                value={formData.name}
                                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Email Address')}</label>
                                                                <input
                                                                    type="email"
                                                                    value={formData.email}
                                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Location')}</label>
                                                                <input
                                                                    type="text"
                                                                    value={formData.location}
                                                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                                    placeholder={t('Enter location')}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Bonus Coins')}</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={formData.coins}
                                                                onChange={(e) => setFormData({ ...formData, coins: parseInt(e.target.value) || 0 })}
                                                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            onClick={() => setEditingUser(null)}
                                                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                                        >
                                                            {t('Cancel')}
                                                        </button>
                                                        <button
                                                            onClick={handleSave}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                                        >
                                                            <Save size={18} />
                                                            {t('Save')}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2 justify-end items-center">
                                                    <div className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium border border-yellow-200 dark:border-yellow-700 mr-2">
                                                        <span className="mr-1">🪙</span> {user.coins || 0}
                                                    </div>
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user._id || user.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="p-8 text-center text-gray-500 dark:text-gray-400">
                                            {t('No users found.')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdsManagement = () => {
    // const {ads, addAd, deleteAd} = useData();
    // NEW HOOKS
    const { data: ads = [] } = useAds();
    const { data: stores = [] } = useStores(); // Add useStores hook
    const { mutateAsync: addAd } = useCreateAd();
    const { mutateAsync: updateAd } = useUpdateAd();
    const { mutateAsync: deleteAd } = useDeleteAd();
    const { t } = useLanguage();
    const [newAdUrl, setNewAdUrl] = useState('');
    const [newAdTitle, setNewAdTitle] = useState('');
    const [storeName, setStoreName] = useState('');
    const [storeId, setStoreId] = useState(''); // Add storeId state
    const [price, setPrice] = useState('');
    const [offerTitle, setOfferTitle] = useState('');
    const [editingAdId, setEditingAdId] = useState(null); // Track editing state
    const { uploadImage, uploading: uploadingAd } = useCloudinaryUpload();

    const handleAdImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const imageUrl = await uploadImage(file);
                setNewAdUrl(imageUrl);
            } catch (error) {
                console.error('Error uploading ad image:', error);
                alert(t('Failed to upload image. Please try another image.'));
            }
        }
    };

    const handleAddAd = async (e) => {
        e.preventDefault();

        const isFallbackUrl = newAdUrl && newAdUrl.includes('/ads/') && newAdUrl.includes('/image');

        const adData = {
            title: newAdTitle || '',
            storeName: storeName || '',
            storeId: storeId || null,
            price: price ? parseFloat(price) : null,
            offerTitle: offerTitle || ''
        };

        // Only include image if it's NOT the fallback URL (i.e. user uploaded new one or it's a real external URL)
        if (!isFallbackUrl && newAdUrl) {
            adData.image = newAdUrl;
        }

        try {
            if (editingAdId) {
                await updateAd({ id: editingAdId, data: adData });
                alert(t('Ad updated successfully!'));
            } else {
                if (newAdUrl) {
                    await addAd(adData);
                    alert(t('Ad added successfully!'));
                }
            }

            // Reset Form and State
            setNewAdUrl('');
            setNewAdTitle('');
            setStoreName('');
            setStoreId('');
            setPrice('');
            setOfferTitle('');
            setEditingAdId(null);
        } catch (error) {
            console.error('Error saving ad:', error);
            alert(t('Failed to save ad. Please try again.'));
        }
    };

    const handleEditAd = (ad) => {
        setEditingAdId(ad._id || ad.id);
        setNewAdUrl(ad.image || `${API_BASE_URL}/ads/${ad._id || ad.id}/image`);
        setNewAdTitle(ad.title || '');
        setStoreName(ad.storeName || '');
        setStoreId(ad.storeId?._id || ad.storeId || ''); // Handle populated or raw ID
        setPrice(ad.price || '');
        setOfferTitle(ad.offerTitle || '');

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setNewAdUrl('');
        setNewAdTitle('');
        setStoreName('');
        setStoreId('');
        setPrice('');
        setOfferTitle('');
        setEditingAdId(null);
    };

    const handleDeleteAd = async (id) => {
        if (window.confirm(t('Are you sure you want to delete this ad?'))) {
            try {
                await deleteAd(id);
                alert(t('Ad deleted successfully!'));
            } catch (error) {
                console.error('Error deleting ad:', error);
                alert(t('Failed to delete ad. Please try again.'));
            }
        }
    };

    return (
        <div className="max-w-6xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('Ads Slider Management')}</h2>

            {/* Add New/Edit Ad Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {editingAdId ? t('Edit Ad') : t('Add New Ad Image')}
                    </h3>
                    {editingAdId && (
                        <button
                            onClick={handleCancelEdit}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            {t('Cancel Edit')}
                        </button>
                    )}
                </div>
                <form onSubmit={handleAddAd} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('Ad Image')} <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-4">
                                {newAdUrl && (
                                    <img src={newAdUrl} alt="Preview" className="w-20 h-20 rounded-lg object-cover" />
                                )}
                                <label className="flex-1 cursor-pointer">
                                    <div className="w-full px-4 py-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                                        <Upload size={20} />
                                        <span>{uploadingAd ? t('Uploading...') : t('Upload Image')}</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAdImageUpload}
                                        className="hidden"
                                        required={!newAdUrl}
                                    />
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('Store')} <span className="text-gray-400 text-xs">({t('Optional')})</span>
                            </label>
                            <select
                                value={storeId}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    setStoreId(selectedId);
                                    const selectedStore = stores.find(s => (s.id || s._id) === selectedId);
                                    setStoreName(selectedStore ? selectedStore.name : '');
                                }}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">{t('Select Store')}</option>
                                {stores.map(store => (
                                    <option key={store.id || store._id} value={store.id || store._id}>
                                        {store.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('Price')} <span className="text-gray-400 text-xs">({t('Optional')})</span>
                            </label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder={t('e.g., 100')}
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('Offer Title')} <span className="text-gray-400 text-xs">({t('Optional')})</span>
                            </label>
                            <input
                                type="text"
                                value={offerTitle}
                                onChange={(e) => setOfferTitle(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder={t('e.g., Special offer shawarma + chicken = 100 offer')}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!newAdUrl || uploadingAd}
                            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {editingAdId ? <Pencil size={20} /> : <Plus size={20} />}
                            {editingAdId ? t('Update Ad') : t('Add Ad')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Ads List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map(ad => (
                    <div key={ad._id || ad.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group relative">
                        <div className="aspect-video relative">
                            <img
                                src={ad.image || `${API_BASE_URL}/ads/${ad.id || ad._id}/image`}
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x200?text=No+Ad+Image'; }}
                                alt={ad.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditAd(ad)}
                                        className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <Pencil size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAd(ad._id || ad.id)}
                                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 space-y-2">
                            {ad.storeName && (
                                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{ad.storeName}</p>
                            )}
                            {ad.offerTitle && (
                                <p className="font-medium text-gray-900 dark:text-white">{ad.offerTitle}</p>
                            )}
                            {ad.price && (
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">₹{ad.price}</p>
                            )}
                            {!ad.storeName && !ad.offerTitle && !ad.price && ad.title && (
                                <p className="font-medium text-gray-900 dark:text-white">{ad.title}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const ServiceManagement = () => {
    // const {services, addService, updateService, deleteService} = useData();
    // NEW HOOKS
    const { data: rawServices = [] } = useServices();
    const services = Array.isArray(rawServices) ? rawServices : (rawServices?.data || []);
    const { mutateAsync: addService } = useCreateService();
    const { mutateAsync: updateService } = useUpdateService();
    const { mutateAsync: deleteService } = useDeleteService();

    const { t } = useLanguage();
    const [view, setView] = useState('list');
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        address: '',
        mobile: ''
    });

    const { uploadImage, uploading: uploadingService } = useCloudinaryUpload();

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const imageUrl = await uploadImage(file);
                setFormData(prev => ({ ...prev, image: imageUrl }));
            } catch (error) {
                console.error('Error uploading service image:', error);
                alert(t('Failed to upload image. Please try another image.'));
            }
        }
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description,
            image: service.image,
            address: service.address || '',
            mobile: service.mobile || ''
        });
        setView('form');
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('Are you sure you want to delete this service?'))) {
            try {
                await deleteService(id);
                alert(t('Service deleted successfully!'));
            } catch (error) {
                console.error('Error deleting service:', error);
                const errorMessage = error.response?.data?.message || error.message || t('Failed to delete service.');
                alert(errorMessage);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingService) {
                const updateData = { ...formData };

                // Don't send proxy URL for image
                if (updateData.image && (updateData.image.includes(API_BASE_URL) || updateData.image.includes('/api/services'))) {
                    delete updateData.image;
                }

                await updateService({ id: editingService._id || editingService.id, data: updateData });
                alert(t('Service updated successfully!'));
            } else {
                await addService(formData);
                alert(t('Service added successfully!'));
            }
            setFormData({ name: '', description: '', image: '', address: '', mobile: '' });
            setEditingService(null);
            setView('list');
        } catch (error) {
            console.error('Error saving service:', error);
            const errorMessage = error.response?.data?.message || error.message || t('Failed to save service.');
            alert(errorMessage);
        }
    };

    return (
        <div className="max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {view === 'list' ? t('Service Management') : editingService ? t('Edit Service') : t('Add New Service')}
                </h2>
                <button
                    onClick={() => {
                        if (view === 'list') {
                            setEditingService(null);
                            setFormData({ name: '', description: '', image: '', address: '', mobile: '' });
                            setView('form');
                        } else {
                            setView('list');
                        }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    {view === 'list' ? <Plus size={20} /> : <ArrowLeft size={20} />}
                    {view === 'list' ? t('Add Service') : t('Back')}
                </button>
            </div>

            {view === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map(service => (
                        <div key={service._id || service.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group">
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={service.image || `${API_BASE_URL}/services/${service.id || service._id}/image`}
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x200?text=No+Service+Image'; }}
                                    alt={service.name}
                                    className="w-full h-full object-cover"
                                />

                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{service.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} />
                                        <span>{service.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} />
                                        <span>{service.mobile}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 justify-end">
                                    <button
                                        onClick={() => handleEdit(service)}
                                        className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <Edit2 size={16} />
                                        {t('Edit')}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(service._id || service.id)}
                                        className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2 text-sm"
                                    >
                                        <Trash2 size={16} />
                                        {t('Delete')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Service Name')}</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Image')}</label>
                            <div className="flex items-center gap-4">
                                {formData.image && (
                                    <img src={formData.image} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                                )}
                                <label className="flex-1 cursor-pointer">
                                    <div className="w-full px-4 py-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                                        <Upload size={20} />
                                        <span>{uploadingService ? t('Uploading...') : t('Upload Image')}</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        required={!formData.image}
                                    />
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Description')}</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="4"
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Address')}</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Mobile Number')}</label>
                                <input
                                    type="text"
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Save size={20} />
                                {editingService ? t('Update Service') : t('Add Service')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

const ServiceRequestManagement = () => {
    // const {fetchServiceRequests, updateServiceRequestStatus, deleteServiceRequest} = useData();
    // NEW HOOKS
    const { data: serviceRequestsData = [], isLoading } = useServiceRequests();
    const { mutateAsync: updateServiceRequestStatus } = useUpdateServiceRequestStatus();
    const { mutateAsync: deleteServiceRequest } = useDeleteServiceRequest();

    // Extract requests array from hook data
    const requests = serviceRequestsData;

    // Logic below expects 'fetchServiceRequests' to be a function?
    // Let's check original code: "const data = await fetchServiceRequests();"
    // So we need to refactor "useEffect -> loadRequests" logic too.

    // REFACTORING LOGIC TO REMOVE MANUAL FETCH
    // We will comment out the manual fetch logic below in a separate pass or here if possible.
    // For now, let's just make the hook available.
    const { t } = useLanguage();
    // const [requests, setRequests] = useState([]); // Removed
    // const [loading, setLoading] = useState(true); // Removed - derived from query if needed

    /* useEffect / loadRequests removed - handled by useServiceRequests hook */
    const loading = isLoading; // Use actual loading state from hook

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateServiceRequestStatus({ id, status: newStatus });
            // setRequests not needed, query invalidation handles update
        } catch (error) {
            console.error('Error updating status:', error);
            alert(t('Failed to update status'));
        }
    };

    const handleDeleteRequest = async (id) => {
        if (window.confirm(t('Are you sure you want to delete this service request?'))) {
            try {
                await deleteServiceRequest(id);
                // setRequests... // No need, query auto-updates
            } catch (error) {
                console.error('Error deleting request:', error);
                alert(t('Failed to delete request'));
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <ClipboardList className="text-blue-600" />
                {t('Service Requests')}
            </h2>

            {/* Format Date Helper */}
            {(() => {
                const formatDateTime = (dateString) => {
                    if (!dateString) return 'N/A';
                    const date = new Date(dateString);
                    return (
                        <div>
                            <div className="font-medium text-gray-900 dark:text-gray-200 whitespace-nowrap">
                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </div>
                        </div>
                    );
                };

                return (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[200px]">{t('Service')}</th>
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Customer')}</th>
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Mobile')}</th>
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Date & Time')}</th>
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Status')}</th>
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="p-8 text-center text-gray-500 dark:text-gray-400">
                                                {t('No service requests found')}
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.map(request => (
                                            <tr key={request._id || request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                            <img
                                                                src={request.service?.image || `${API_BASE_URL}/services/${request.service?._id || request.service?.id}/image`}
                                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150?text=No+Image'; }}
                                                                alt={request.service?.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <span className="font-medium text-gray-900 dark:text-white truncate block max-w-[200px]" title={request.service?.name || t('Unknown Service')}>
                                                            {request.service?.name || t('Unknown Service')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-600 dark:text-gray-300">
                                                    <div className="truncate max-w-[150px]" title={request.user?.name || t('Unknown User')}>
                                                        {request.user?.name || t('Unknown User')}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-600 dark:text-gray-300">
                                                    {request.user?.mobile || t('N/A')}
                                                </td>
                                                <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">
                                                    {formatDateTime(request.createdAt)}
                                                </td>
                                                <td className="p-4">
                                                    <select
                                                        value={request.status}
                                                        onChange={(e) => handleStatusUpdate(request._id || request.id, e.target.value)}
                                                        className={`text-sm border rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium
                                                            ${request.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                                request.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                    request.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                        'bg-red-50 text-red-700 border-red-200'
                                                            }`}
                                                    >
                                                        <option value="Pending">{t('Pending')}</option>
                                                        <option value="In Progress">{t('In Progress')}</option>
                                                        <option value="Completed">{t('Completed')}</option>
                                                        <option value="Cancelled">{t('Cancelled')}</option>
                                                    </select>
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => handleDeleteRequest(request._id || request.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title={t('Delete Request')}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default AdminDashboard;
