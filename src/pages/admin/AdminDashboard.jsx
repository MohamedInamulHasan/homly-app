import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    Settings,
    Download,
    GripVertical,
    Truck,
    Copy,
    LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService, API_BASE_URL } from '../../utils/api';
import { useData } from '../../context/DataContext'; // Retain for now, remove piecemeal
import { useLanguage } from '../../context/LanguageContext';
import { compressImage, validateImageSize } from '../../utils/imageCompression';
import StoreManagement from './StoreManagement';
import SettingsManagement from './SettingsManagement';
import ServiceManagement from './ServiceManagement';
import useCloudinaryUpload from '../../hooks/useCloudinaryUpload';

// New Query Hooks
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useUpdateProductOrder } from '../../hooks/queries/useProducts';
import { useStores } from '../../hooks/queries/useStores';
import { useNews, useCreateNews, useUpdateNews, useDeleteNews } from '../../hooks/queries/useNews';
import { useUsers, useDeleteUser, useUpdateUser } from '../../hooks/queries/useUsers';
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory, useUpdateCategoryOrder } from '../../hooks/queries/useCategories';
import { useAds, useCreateAd, useDeleteAd, useUpdateAd, useUpdateAdOrder } from '../../hooks/queries/useAds';
import { useServices, useCreateService, useDeleteService, useUpdateService } from '../../hooks/queries/useServices';
import { useServiceRequests, useUpdateServiceRequestStatus, useDeleteServiceRequest } from '../../hooks/queries/useServiceRequests';
import { useOrders, useUpdateOrderStatus, useDeleteOrder } from '../../hooks/queries/useOrders';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableAdCard, SortableProductRow, DragHandle, SortableItemContext, SortableSubcategoryItem } from './AdminDashboard_Sortables';
import { CSS } from '@dnd-kit/utilities';

const AdminDashboard = () => {
    const { user, logout } = useAuth(); // Get current user & logout method
    const navigate = useNavigate();
    const isStoreAdmin = user?.role === 'store_admin';
    const isServiceAdmin = user?.role === 'service_admin';
    const isDeliveryBoy = user?.role === 'delivery_boy';
    const isAdmin = user?.role === 'admin';
    const defaultTab = isStoreAdmin ? 'stores' : isServiceAdmin ? 'services' : isDeliveryBoy ? 'orders' : 'products';
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { t } = useLanguage();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Redirect Store Admin to allowed tabs only
    useEffect(() => {
        if (isStoreAdmin && activeTab !== 'stores' && activeTab !== 'products' && activeTab !== 'orders') {
            setActiveTab('stores');
        }
    }, [isStoreAdmin, activeTab]);

    // Redirect Service Admin to allowed tabs only
    useEffect(() => {
        if (isServiceAdmin && activeTab !== 'services') {
            setActiveTab('services');
        }
    }, [isServiceAdmin, activeTab]);

    // Redirect Delivery Boy to allowed tabs only
    useEffect(() => {
        if (isDeliveryBoy && activeTab !== 'orders') {
            setActiveTab('orders');
        }
    }, [isDeliveryBoy, activeTab]);

    const handleExport = async () => {
        try {
            // Use direct window.open for Android compatibility
            const token = user?.token || localStorage.getItem('token') || localStorage.getItem('authToken');
            const exportUrl = `${API_BASE_URL}/admin/export-data?token=${token}`;
            window.open(exportUrl, '_blank');
        } catch (error) {
            console.error('Export failed:', error);
            alert(t('Export failed. Please try again.'));
        }
    };

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
                return isServiceAdmin
                    ? <ServiceManagement serviceAdminMode={true} myServiceId={user?.serviceId} />
                    : <ServiceManagement />;
            case 'service-requests':
                return <ServiceRequestManagement />;
            case 'cities':
                return <CityManagement />;
            case 'settings':
                return <SettingsManagement />;
            case 'delivery-boys':
                return <DeliveryBoyManagement />;
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
                    transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex flex-col
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

    // --- SERVICE ADMIN VIEW ---
    if (isServiceAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200 relative">
                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMobileMenu}
                    className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-600 dark:text-gray-300"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Simplified Sidebar for Service Admin */}
                <div className={`
                    fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
                    transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex flex-col
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Wrench className="text-blue-600 dark:text-blue-400" />
                            {t('My Service')}
                        </h1>
                    </div>
                    <nav className="flex-1 p-4 space-y-2">
                        <SidebarItem
                            icon={<Wrench size={20} />}
                            label={t('My Service')}
                            id="services"
                            active={activeTab === 'services'}
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
                                        <Wrench className="text-blue-600 dark:text-blue-400" size={24} />
                                    </div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {t('My Service')}
                                    </h1>
                                </div>
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

    // --- DELIVERY BOY VIEW ---
    if (isDeliveryBoy) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200 relative">
                {/* Logout Confirmation Modal */}
                {showLogoutModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all scale-100 opacity-100 flex flex-col items-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                                <LogOut size={32} className="text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">{t('Sign Out')}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                                {t('Are you sure you want to sign out?')}
                            </p>
                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    onClick={() => {
                                        logout();
                                        navigate('/login');
                                    }}
                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-md shadow-red-500/20 transition-colors"
                                >
                                    {t('Sign Out')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMobileMenu}
                    className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-600 dark:text-gray-300"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Simplified Sidebar for Delivery Boy */}
                <div className={`
                    fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
                    transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex flex-col
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <ShoppingBag className="text-blue-600 dark:text-blue-400" />
                            {t('Deliveries')}
                        </h1>
                    </div>
                    <nav className="flex-1 p-4 space-y-2 flex flex-col">
                        <SidebarItem
                            icon={<ShoppingBag size={20} />}
                            label={t('Manage Orders')}
                            id="orders"
                            active={activeTab === 'orders'}
                            onClick={setActiveTab}
                        />
                        
                        {/* Delivery Boy Logout */}
                        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setShowLogoutModal(true)}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-bold"
                            >
                                <LogOut size={20} />
                                {t('Sign Out')}
                            </button>
                        </div>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto w-full">
                    <div className="p-4 md:p-8 pt-16 md:pt-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <ShoppingBag className="text-blue-600 dark:text-blue-400" size={24} />
                                    </div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {t('Deliveries')}
                                    </h1>
                                </div>
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
                    {(isAdmin || isStoreAdmin) && (
                        <SidebarItem
                            icon={<Store size={20} />}
                            label={t('Stores')}
                            id="stores"
                            active={activeTab === 'stores'}
                            onClick={setActiveTab}
                        />
                    )}
                    {(isAdmin || isStoreAdmin) && (
                        <SidebarItem
                            icon={<Package size={20} />}
                            label={t('Products')}
                            id="products"
                            active={activeTab === 'products'}
                            onClick={setActiveTab}
                        />
                    )}
                    <SidebarItem
                        icon={<ShoppingBag size={20} />}
                        label={t('Orders')}
                        id="orders"
                        active={activeTab === 'orders'}
                        onClick={setActiveTab}
                    />

                    {/* Admin Only Sections */}
                    {isAdmin && (
                        <>
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
                                icon={<Truck size={20} />}
                                label={t('Delivery Boys')}
                                id="delivery-boys"
                                active={activeTab === 'delivery-boys'}
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
                        </>
                    )}
                    {(isAdmin || isServiceAdmin) && (
                        <>
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
                        </>
                    )}
                    <div className="my-2 border-t border-gray-100 dark:border-gray-700"></div>
                    <SidebarItem
                        icon={<Download size={20} />}
                        label={t('Export Data')}
                        id="export"
                        active={false}
                        onClick={handleExport}
                    />
                    <SidebarItem
                        icon={<MapPin size={20} />}
                        label={t('City Management')}
                        id="cities"
                        active={activeTab === 'cities'}
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
    const { mutateAsync: reorderProducts } = useUpdateProductOrder();
    const queryClient = useQueryClient();

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const currentProducts = products.filter(p => !p.storeId); // Only reorder general products
            const oldIndex = currentProducts.findIndex((p) => (p.id || p._id) === active.id);
            const newIndex = currentProducts.findIndex((p) => (p.id || p._id) === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newOrder = arrayMove(currentProducts, oldIndex, newIndex);
                const orderedIds = newOrder.map(p => p.id || p._id);
                await reorderProducts(orderedIds);
            }
        }
    };

    const { t } = useLanguage();
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        category: '',
        subcategory: [], // Multi-select array
        storeId: '',
        description: '',
        image: '',
        sliderImages: [],
        useTimeLimit: false,
        openingTime: '00:00',
        closingTime: '23:59'
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
            subcategory: Array.isArray(product.subcategory) ? product.subcategory : (product.subcategory ? [product.subcategory] : []),
            storeId: product.storeId || '',
            description: product.description,
            image: product.image || (product.images && product.images[0]) || '',
            sliderImages: product.images || [],
            stock: product.stock || 0,
            unit: product.unit || '',
            useTimeLimit: product.useTimeLimit || false,
            openingTime: product.openingTime || '00:00',
            closingTime: product.closingTime || '23:59'
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

    const handleDuplicate = async (product) => {
        if (!window.confirm(t('Duplicate this product?'))) return;
        try {
            // Exclude system fields
            const { _id, id, createdAt, updatedAt, __v, ...rest } = product;
            const newProduct = {
                ...rest,
                title: `${rest.title} (Copy)`,
                // Ensure images are handled correctly
                images: rest.images || [],
                image: rest.image
            };
            await addProduct(newProduct);
            alert(t('Product duplicated successfully!'));
        } catch (error) {
            console.error('Error duplicating product:', error);
            alert(t('Failed to duplicate product.'));
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

        // Add timing data
        productData.useTimeLimit = formData.useTimeLimit;
        productData.openingTime = formData.openingTime;
        productData.closingTime = formData.closingTime;

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
            setFormData({ title: '', price: '', category: '', subcategory: [], storeId: '', description: '', image: '', sliderImages: [], stock: 0, unit: '', useTimeLimit: false, openingTime: '00:00', closingTime: '23:59' });
            setEditingProduct(null);
            setView('list');
        } catch (error) {
            alert(t('Failed to save product. Please try again.'));
            console.error('Error saving product:', error);
        }
    };

    const filteredProducts = products
        .filter(p => !p.storeId)
        .filter(p =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );

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
                            setFormData({ title: '', price: '', category: '', subcategory: [], storeId: '', description: '', image: '', sliderImages: [], stock: 0, unit: '' });
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

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="p-4 w-12"></th>
                                            <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Image')}</th>
                                            <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Title')}</th>
                                            <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Category')}</th>
                                            <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Price')}</th>
                                            <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Availability')}</th>
                                            <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        <SortableContext
                                            items={filteredProducts.map(p => p._id || p.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {filteredProducts
                                                .filter(p => !p.storeId)
                                                .filter(p =>
                                                    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
                                                )
                                                .map(product => (
                                                    <SortableProductRow key={product.id || product._id} product={product}>
                                                        <td className="p-4">
                                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white">
                                                                <img
                                                                    src={product.image || `${API_BASE_URL}/products/${product.id || product._id}/image`}
                                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=No+Image'; }}
                                                                    alt={product.title}
                                                                    className="w-12 h-12 object-cover"
                                                                />
                                                                {product.unit && (
                                                                    <span className="absolute bottom-0 right-0 bg-white/70 backdrop-blur-[2px] text-black text-[9px] font-medium px-1.5 py-0.5 rounded-tl-md shadow-sm z-10 leading-none flex items-center justify-center">
                                                                        {product.unit}
                                                                    </span>
                                                                )}
                                                            </div>
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
                                                                let mainCategory = fullCategory;
                                                                let bracketText = '';

                                                                if (bracketIndex !== -1) {
                                                                    mainCategory = fullCategory.substring(0, bracketIndex).trim();
                                                                    bracketText = fullCategory.substring(bracketIndex).trim();
                                                                }

                                                                return (
                                                                    <div className="max-w-[150px] flex flex-col">
                                                                        <div className="truncate text-sm font-medium text-gray-900 dark:text-white" title={mainCategory}>{mainCategory}</div>
                                                                        {bracketText && (
                                                                            <div className="text-xs text-gray-400 dark:text-gray-500 truncate" title={bracketText}>{bracketText}</div>
                                                                        )}
                                                                        {product.subcategory && Array.isArray(product.subcategory) && product.subcategory.length > 0 && (
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5" title={product.subcategory.join(', ')}>
                                                                                {product.subcategory.join(', ')}
                                                                            </div>
                                                                        )}
                                                                        {product.subcategory && typeof product.subcategory === 'string' && (
                                                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5" title={product.subcategory}>
                                                                                {product.subcategory}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </td>
                                                        <td className="p-4 font-medium text-gray-900 dark:text-white">₹{product.price}</td>
                                                        <td className="p-4">
                                                            <div className="flex items-center">
                                                                <button
                                                                    onClick={async () => {
                                                                        const currentStatus = product.isAvailable !== false;
                                                                        const productId = product._id || product.id;

                                                                        // If automatically off due to time, we cannot manually turn it ON
                                                                        if (!currentStatus && !isProductScheduled(product)) {
                                                                            alert(t('Cannot enable: Product is currently outside its scheduled timing window.'));
                                                                            return;
                                                                        }

                                                                        // Optimistic update
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
                                                                    disabled={product.isAvailable === false && !isProductScheduled(product)}
                                                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${product.isAvailable !== false && isProductScheduled(product) ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                                                                        } ${(product.isAvailable === false && !isProductScheduled(product)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                    title={product.isAvailable !== false && isProductScheduled(product) ? t('Available') : !isProductScheduled(product) ? t('Timed Out') : t('Out of Stock')}
                                                                >
                                                                    <motion.span
                                                                        layout
                                                                        transition={{ type: "spring", stiffness: 700, damping: 30 }}
                                                                        animate={{ x: (product.isAvailable !== false && isProductScheduled(product)) ? 22 : 2 }}
                                                                        className="inline-block h-5 w-5 transform rounded-full bg-white shadow-md"
                                                                    />
                                                                </button>
                                                                {!isProductScheduled(product) && (
                                                                    <span className="ml-2 text-[10px] font-bold text-orange-500 flex items-center gap-1">
                                                                        <RefreshCw size={10} className="animate-spin-slow" />
                                                                        {t('TIMED')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={async () => {
                                                                        const currentIsGold = product.isGold === true;
                                                                        const productId = product._id || product.id;

                                                                        // Optimistic update
                                                                        queryClient.setQueryData(['products'], (old) => {
                                                                            const oldData = Array.isArray(old) ? old : (old?.data || []);
                                                                            return oldData.map(p =>
                                                                                (p._id || p.id) === productId
                                                                                    ? { ...p, isGold: !currentIsGold }
                                                                                    : p
                                                                            );
                                                                        });

                                                                        try {
                                                                            await updateProduct({ id: productId, data: { isGold: !currentIsGold } });
                                                                        } catch (error) {
                                                                            // Rollback
                                                                            queryClient.setQueryData(['products'], (old) => {
                                                                                const oldData = Array.isArray(old) ? old : (old?.data || []);
                                                                                return oldData.map(p =>
                                                                                    (p._id || p.id) === productId
                                                                                        ? { ...p, isGold: currentIsGold }
                                                                                        : p
                                                                                );
                                                                            });
                                                                            console.error("Failed to toggle gold status", error);
                                                                            alert(t('Failed to update product status'));
                                                                        }
                                                                    }}
                                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${product.isGold ? 'bg-yellow-400' : 'bg-gray-200 dark:bg-gray-600'}`}
                                                                    title={product.isGold ? t('Gold Product') : t('Standard Product')}
                                                                >
                                                                    <span
                                                                        className={`${product.isGold ? 'translate-x-6' : 'translate-x-1'
                                                                            } inline-block h-4 w-4 transform rounded-full bg-white shadow-md`}
                                                                    />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDuplicate(product)}
                                                                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                                    title={t('Duplicate Product')}
                                                                >
                                                                    <Copy size={18} />
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
                                                    </SortableProductRow>
                                                ))}
                                        </SortableContext>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </DndContext>
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
                                        setFormData({ ...formData, category: e.target.value, subcategory: [] });
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

                            {/* Subcategory multi-select */}
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('Subcategories')} ({t('Optional')})
                                </label>
                                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 min-h-[100px] max-h-48 overflow-y-auto">
                                    {(() => {
                                        const selectedCategoryData = categories.find(cat => cat.name === formData.category);
                                        if (selectedCategoryData?.subcategories && selectedCategoryData.subcategories.length > 0) {
                                            return (
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {selectedCategoryData.subcategories.map((sub, index) => (
                                                        <label key={index} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-500">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.subcategory.includes(sub)}
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        subcategory: checked
                                                                            ? [...prev.subcategory, sub]
                                                                            : prev.subcategory.filter(s => s !== sub)
                                                                    }));
                                                                }}
                                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                            />
                                                            <span className="text-gray-700 dark:text-gray-300 text-sm">{t(sub)}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            );
                                        }
                                        return <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">{t('Select a category to see its subcategories')}</p>;
                                    })()}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    {t('Select one or more subcategories for this product')}
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

                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600 space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('Product Timing')}</label>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, useTimeLimit: !formData.useTimeLimit })}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.useTimeLimit ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.useTimeLimit ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                                
                                {formData.useTimeLimit && (
                                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">{t('Opening')}</label>
                                            <input
                                                type="time"
                                                value={formData.openingTime}
                                                onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">{t('Closing')}</label>
                                            <input
                                                type="time"
                                                value={formData.closingTime}
                                                onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                                                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                                <p className="text-[10px] text-gray-400">
                                    {formData.useTimeLimit 
                                        ? t('Product will automatically turn off outside these hours.') 
                                        : t('Product will stay on 24/7 unless manually disabled.')}
                                </p>
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
    // const {news, addNews, updateNews, deleteNews} = useData();

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

        try {
            if (editingNews) {
                await updateNews({ id: editingNews._id || editingNews.id, data: newsItem });
                alert(t('Post updated successfully!'));
            } else {
                await addNews(newsItem);
                alert(t('Post published successfully!'));
            }

            setEditingNews(null);
            setNewsForm({
                headline: '',
                type: 'Offer',
                image: '',
                sliderImages: [],
                stock: 0,
                unit: '',
                content: '',
            });
            setView('list');
        } catch (error) {
            console.error('Error saving news:', error);
            alert(t('Failed to save post. Please try again.'));
        }
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
    const { data: rawUsers = [] } = useUsers();
    const users = Array.isArray(rawUsers) ? rawUsers : (rawUsers?.data || []);
    const deliveryBoys = users.filter(u => u.role === 'delivery_boy');
    const { user } = useAuth();
    const isStoreAdmin = user?.role === 'store_admin';
    const isServiceAdmin = user?.role === 'service_admin';
    const isDeliveryBoy = user?.role === 'delivery_boy';

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

    const updateStatus = async (id, newStatus, deliveredBy = undefined) => {
        try {
            await updateOrderStatus({ id, status: newStatus, deliveredBy });
            alert(t('Order updated successfully!'));
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
                // Alert removed to avoid spamming user if loop logic was used, but for single delete it's fine.
                // However, for consistency with 'Delete All', we might want less alerts.
                // Keeping alert for single delete.
                // alert(t('Order deleted successfully!')); 
            } catch (error) {
                console.error('Error deleting order:', error);
                alert(t('Failed to delete order'));
            }
        }
    };

    const handleDeleteAllOrders = async () => {
        if (orders.length === 0) return;

        if (window.confirm(t('Are you sure you want to delete ALL orders? This action cannot be undone.'))) {
            const confirmCount = window.prompt(t(`Type "${orders.length}" to confirm deletion of all ${orders.length} orders.`));
            if (confirmCount !== String(orders.length)) {
                alert(t('Deletion cancelled. Incorrect confirmation.'));
                return;
            }

            try {
                // Delete all orders one by one
                const deletePromises = orders.map(order => deleteOrder(order._id || order.id));
                await Promise.all(deletePromises);
                alert(t('All orders deleted successfully!'));
            } catch (error) {
                console.error('Error deleting all orders:', error);
                alert(t('Failed to delete some orders. Please try again.'));
            }
        }
    };

    // Group orders by status
    const processingOrders = orders.filter(o => o.status === 'Processing' || o.status === 'Shipped');
    const outForDeliveryOrders = orders.filter(o => o.status === 'Out for Delivery');
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
                                    <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Address & Location')}</th>
                                    <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Date & Time')}</th>
                                    <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Total')}</th>
                                    <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Status')}</th>
                                    {!isDeliveryBoy && (
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Actions')}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {ordersList.map(order => (
                                    <tr key={order._id || order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="p-4 font-medium">
                                            <Link 
                                                to={`/orders/${order._id || order.id}`}
                                                className="text-blue-600 dark:text-blue-400 hover:underline"
                                                title={t('View Order Details')}
                                            >
                                                #{String(order._id || order.id).slice(-6).toUpperCase()}
                                            </Link>
                                        </td>
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
                                                <>
                                                    <span className="truncate block font-medium text-gray-900 dark:text-white" title={`${order.shippingAddress?.street}, ${order.shippingAddress?.city}`}>
                                                        {order.shippingAddress ? `${order.shippingAddress.street}, ${order.shippingAddress.city}` : 'N/A'}
                                                    </span>
                                                    {order.shippingAddress?.location && (
                                                        <a
                                                            href={order.shippingAddress.location?.includes('maps?q=') 
                                                                ? order.shippingAddress.location.replace('https://www.google.com/maps?q=', 'https://maps.google.com/maps?q=') 
                                                                : order.shippingAddress.location}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline mt-1 text-xs"
                                                        >
                                                            <MapPin size={12} />
                                                            View Map
                                                        </a>
                                                    )}
                                                </>
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
                                            <div className="flex flex-col gap-2">
                                                <select
                                                    value={order.status}
                                                    disabled={isDeliveryBoy && (order.status === 'Delivered' || order.status === 'Cancelled')}
                                                    onChange={(e) => updateStatus(order._id || order.id, e.target.value)}
                                                    className={`px-3 py-1.5 rounded-lg border-2 text-sm font-semibold transition-colors outline-none
                                                        ${order.status === 'Delivered' ? 'border-green-100 bg-green-50 text-green-700' :
                                                            order.status === 'Out for Delivery' ? 'border-blue-100 bg-blue-50 text-blue-700' :
                                                                order.status === 'Shipped' ? 'border-blue-100 bg-blue-50 text-blue-700' :
                                                                    order.status === 'Cancelled' ? 'border-red-100 bg-red-50 text-red-700' :
                                                                        'border-yellow-100 bg-yellow-50 text-yellow-700'}`}
                                                >
                                                    <option
                                                        value="Processing"
                                                        disabled={isDeliveryBoy && (order.status === 'Out for Delivery' || order.status === 'Delivered' || order.status === 'Cancelled')}
                                                    >
                                                        {t('Processing')}
                                                    </option>
                                                    {/* Shipped removed as per request */}
                                                    <option
                                                        value="Out for Delivery"
                                                        disabled={isDeliveryBoy && (order.status === 'Delivered' || order.status === 'Cancelled')}
                                                    >
                                                        {t('Out for Delivery')}
                                                    </option>
                                                    <option
                                                        value="Delivered"
                                                        disabled={isDeliveryBoy && order.status === 'Cancelled'}
                                                    >
                                                        {t('Delivered')}
                                                    </option>
                                                    <option
                                                        value="Cancelled"
                                                        disabled={isDeliveryBoy && order.status !== 'Processing'}
                                                    >
                                                        {t('Cancelled')}
                                                    </option>
                                                </select>

                                                {/* Delivery Boy Assignment (Admin Only) - Removed as per request */}

                                                
                                                {/* Show Assigned Delivery Boy (Admin Only) */}
                                                {order.deliveredBy && !isDeliveryBoy && (
                                                    <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                        <ShoppingBag size={10} />
                                                        {order.deliveredBy?.name || t('Assigned')}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        {!isDeliveryBoy && (
                                            <td className="p-4">
                                                {editingOrder === (order._id || order.id) ? (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => saveOrder(order._id || order.id)} className="text-green-600 hover:text-green-700"><CheckCircle size={18} /></button>
                                                        <button onClick={() => setEditingOrder(null)} className="text-red-600 hover:text-red-700"><XCircle size={18} /></button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleDeleteOrder(order._id || order.id)} className="text-red-600 hover:text-red-700">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        )}
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
                <div className="flex gap-2">
                    {orders.length > 0 && !isDeliveryBoy && (
                        <button
                            onClick={handleDeleteAllOrders}
                            className="p-2 sm:px-4 sm:py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
                            title={t('Delete All Orders')}
                        >
                            <Trash2 size={20} />
                            <span className="hidden sm:inline">{t('Delete All')}</span>
                        </button>
                    )}
                    <button
                        onClick={handleManualRefresh}
                        className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-blue-600 dark:text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`}
                        title={t('Refresh Orders')}
                    >
                        <RefreshCw size={24} />
                    </button>
                </div>
            </div>

            {/* Render orders grouped by status */}
            {renderOrderTable(processingOrders, 'Processing Orders', 'text-amber-700 dark:text-amber-400')}
            {renderOrderTable(outForDeliveryOrders, 'Out for Delivery Orders', 'text-blue-700 dark:text-blue-400')}
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
    // const {categories, fetchCategories, addCategory, updateCategory, deleteCategory} = useData();
    // NEW HOOKS
    const { data: categories = [] } = useCategories();
    const { mutateAsync: addCategory } = useCreateCategory();
    const { mutateAsync: updateCategory } = useUpdateCategory();
    const { mutateAsync: deleteCategory } = useDeleteCategory();
    const { mutateAsync: updateOrder } = useUpdateCategoryOrder();
    const { t } = useLanguage();
    const [view, setView] = useState('list');
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        image: '',
        subcategories: [] // Array of subcategory names
    });
    const [newSubcategory, setNewSubcategory] = useState(''); // For adding new subcategories

    // Local state for DnD
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (categories.length > 0) {
            // Only update items if the IDs are different or length is different to avoid resetting during drag?
            // Actually, we want to sync when backend data changes, EXCEPT when we are dragging?
            // For now, simple sync.
            setItems(categories);
        }
    }, [categories]);

    const { uploadImage, uploading: uploadingCategory } = useCloudinaryUpload();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => (item._id || item.id) === active.id);
                const newIndex = items.findIndex((item) => (item._id || item.id) === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Trigger API update
                const orderedIds = newItems.map(item => item._id || item.id);
                updateOrder(orderedIds).catch(err => {
                    console.error("Failed to reorder categories:", err);
                    // Optionally revert state here or toast error
                });

                return newItems;
            });
        }
    };

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

    const handleSubcategoryDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setFormData(prev => {
                const oldIndex = prev.subcategories.indexOf(active.id);
                const newIndex = prev.subcategories.indexOf(over.id);
                return {
                    ...prev,
                    subcategories: arrayMove(prev.subcategories, oldIndex, newIndex)
                };
            });
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
                await addCategory(formData);
                alert(t('Category added successfully!'));
            }
            setFormData({ name: '', image: '', subcategories: [] });
            setNewSubcategory('');
            setEditingCategory(null);
            setView('list');
        } catch (error) {
            console.error('Error saving category - Full details:', error);
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
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="p-4 w-12"></th>
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Image')}</th>
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Name')}</th>
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    <SortableContext
                                        items={items.map(cat => cat._id || cat.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {items.length > 0 ? items.map(category => (
                                            <SortableRow key={category._id || category.id} data-id={category._id || category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors bg-white dark:bg-gray-800">
                                                <td className="p-4">
                                                    <DragHandle className="cursor-grab text-gray-400 hover:text-gray-600">
                                                        <GripVertical size={20} />
                                                    </DragHandle>
                                                </td>
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
                                                    <div className="flex gap-2 relative z-20" onPointerDown={(e) => e.stopPropagation()}>
                                                        {/* Stop propagation to prevent drag start on buttons */}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEdit(category); }}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(category._id || category.id); }}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </SortableRow>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="p-8 text-center text-gray-500 dark:text-gray-400">
                                                    {t('No categories found. Add one to get started!')}
                                                </td>
                                            </tr>
                                        )}
                                    </SortableContext>
                                </tbody>
                            </table>
                        </DndContext>
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

                                {formData.subcategories.length > 0 && (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">{t('Added Subcategories')} ({t('Drag to reorder')}):</p>
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleSubcategoryDragEnd}
                                        >
                                            <SortableContext
                                                items={formData.subcategories}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                <div className="space-y-2">
                                                    {formData.subcategories.map((sub, index) => (
                                                        <SortableSubcategoryItem key={`${sub}-${index}`} id={sub}>
                                                            <div className="flex items-center justify-between bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700 group">
                                                                <div className="flex items-center gap-3">
                                                                    <DragHandle className="text-gray-400 hover:text-gray-600">
                                                                        <GripVertical size={18} />
                                                                    </DragHandle>
                                                                    <span className="text-sm text-gray-900 dark:text-white font-medium">{sub}</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveSubcategory(index)}
                                                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                                >
                                                                    <XCircle size={18} />
                                                                </button>
                                                            </div>
                                                        </SortableSubcategoryItem>
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
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

const ServiceIdSelect = ({ value, onChange, t }) => {
    const { data: services = [] } = useServices();
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
        >
            <option value="">{t('Select Service')}</option>
            {services.map(service => (
                <option key={service._id || service.id} value={service._id || service.id}>
                    {service.name}
                </option>
            ))}
        </select>
    );
};

const UserManagement = () => {
    // const {users, fetchUsers, updateUser, deleteUser, stores} = useData();
    // NEW HOOKS
    const { data: users = [], refetch: fetchUsers } = useUsers();
    const { mutateAsync: updateUser } = useUpdateUser();
    const { mutateAsync: deleteUser } = useDeleteUser();
    const { data: stores = [] } = useStores();

    const { t } = useLanguage();
    const { user: currentUser, refreshUser } = useAuth();
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
        serviceId: '',
        location: '',
        deliverySettings: {
            workTimings: { start: '09:00', end: '21:00' },
            telegramChatId: '',
            isActive: true
        }
    });
    const [searchQuery, setSearchQuery] = useState('');

    // Stats for Top Card
    // Filter out delivery boys from general user management
    const filteredUsers = users.filter(u => u.role !== 'delivery_boy');

    // Stats for Top Card
    const totalUsers = filteredUsers.length;
    const adminCount = filteredUsers.filter(u => u.role === 'admin').length;
    const storeAdminCount = filteredUsers.filter(u => u.role === 'store_admin').length;
    const serviceAdminCount = filteredUsers.filter(u => u.role === 'service_admin').length;
    const customerCount = filteredUsers.filter(u => u.role === 'customer').length;

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
            storeId: user.storeId?._id || user.storeId || '',
            serviceId: user.serviceId?._id || user.serviceId || '',
            coins: user.coins || 0,
            location: user.location || '',
            deliverySettings: user.deliverySettings || {
                workTimings: { start: '09:00', end: '21:00' },
                telegramChatId: '',
                isActive: true
            }
        });
    };

    const handleSave = async () => {
        try {
            console.log('Updating user:', { id: editingUser._id || editingUser.id, data: formData });
            // useUpdateUser hook expects {id, data} payload
            await updateUser({ id: editingUser._id || editingUser.id, data: formData });

            // If the user being edited is the CURRENT user, refresh the profile to reflect changes (like role/serviceId)
            if (currentUser?._id === (editingUser._id || editingUser.id)) {
                console.log('🔄 Refreshing current user profile...');
                await refreshUser();
            }

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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
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
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            <Wrench size={20} />
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('Service Admins')}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{serviceAdminCount}</p>
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
                                {filteredUsers.filter(user => {
                                    const query = searchQuery.toLowerCase();
                                    return user.name?.toLowerCase().includes(query) ||
                                        user.email?.toLowerCase().includes(query);
                                }).length > 0 ? filteredUsers.filter(user => {
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
                                                    user.role === 'service_admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                                                {t(user.role === 'store_admin' ? 'Store Admin' : user.role === 'service_admin' ? 'Service Admin' : user.role.charAt(0).toUpperCase() + user.role.slice(1))}
                                            </span>
                                            {user.role === 'store_admin' && user.storeId && (
                                                <div className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                                                    {user.storeId.name || 'Store Linked'}
                                                </div>
                                            )}
                                            {user.role === 'service_admin' && user.serviceId && (
                                                <div className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                                                    {user.serviceId.name || 'Service Linked'}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                            {(() => {
                                                const loc = user.location;
                                                if (!loc) return <span className="text-gray-400">-</span>;

                                                let mapLink = loc;
                                                if (!loc.startsWith('http')) {
                                                    mapLink = `https://maps.google.com/maps?q=${loc.replace(/\s/g, '')}`;
                                                }

                                                return (
                                                    <a
                                                        href={mapLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                                                    >
                                                        <MapPin size={14} />
                                                        {t('View Map')}
                                                    </a>
                                                );
                                            })()}
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
                                                                <option value="service_admin">{t('Service Admin')}</option>
                                                                <option value="delivery_boy">{t('Delivery Boy')}</option>
                                                                <option value="admin">{t('Global Admin')}</option>
                                                            </select>
                                                        </div>
                                                        {formData.role === 'delivery_boy' && (
                                                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-4">
                                                                <h4 className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                                                                    <Wrench size={16} /> {t('Delivery Settings')}
                                                                </h4>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('Work Start')}</label>
                                                                        <input
                                                                            type="time"
                                                                            value={formData.deliverySettings?.workTimings?.start || '09:00'}
                                                                            onChange={(e) => setFormData({
                                                                                ...formData,
                                                                                deliverySettings: {
                                                                                    ...formData.deliverySettings,
                                                                                    workTimings: { ...formData.deliverySettings?.workTimings, start: e.target.value }
                                                                                }
                                                                            })}
                                                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('Work End')}</label>
                                                                        <input
                                                                            type="time"
                                                                            value={formData.deliverySettings?.workTimings?.end || '21:00'}
                                                                            onChange={(e) => setFormData({
                                                                                ...formData,
                                                                                deliverySettings: {
                                                                                    ...formData.deliverySettings,
                                                                                    workTimings: { ...formData.deliverySettings?.workTimings, end: e.target.value }
                                                                                }
                                                                            })}
                                                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-gray-500 mb-1">{t('Telegram Chat ID')}</label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="e.g. 123456789"
                                                                        value={formData.deliverySettings?.telegramChatId || ''}
                                                                        onChange={(e) => setFormData({
                                                                            ...formData,
                                                                            deliverySettings: { ...formData.deliverySettings, telegramChatId: e.target.value }
                                                                        })}
                                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="isActive"
                                                                        checked={formData.deliverySettings?.isActive ?? true}
                                                                        onChange={(e) => setFormData({
                                                                            ...formData,
                                                                            deliverySettings: { ...formData.deliverySettings, isActive: e.target.checked }
                                                                        })}
                                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                    />
                                                                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('Active for Deliveries')}</label>
                                                                </div>
                                                            </div>
                                                        )}
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
                                                        {formData.role === 'service_admin' && (
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('Assign Service')}</label>
                                                                <ServiceIdSelect
                                                                    value={formData.serviceId || ''}
                                                                    onChange={(val) => setFormData({ ...formData, serviceId: val })}
                                                                    t={t}
                                                                />
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

const DeliveryBoyManagement = () => {
    const { data: users = [], refetch: fetchUsers } = useUsers();
    const { mutateAsync: updateUser } = useUpdateUser();
    const { mutateAsync: deleteUser } = useDeleteUser();
    const { t } = useLanguage();
    
    const [editingUser, setEditingUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        address: '',
        deliverySettings: {
            workTimings: { start: '09:00', end: '21:00' },
            telegramChatId: '',
            isActive: true
        }
    });

    const deliveryBoys = users.filter(u => u.role === 'delivery_boy');

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            mobile: user.mobile || '',
            address: user.address || '',
            deliverySettings: user.deliverySettings || {
                workTimings: { start: '09:00', end: '21:00' },
                telegramChatId: '',
                isActive: true
            }
        });
    };

    const handleSave = async () => {
        try {
            await updateUser({ id: editingUser._id || editingUser.id, data: { ...formData, role: 'delivery_boy' } });
            alert(t('Delivery boy updated successfully!'));
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            alert(t('Failed to update delivery boy'));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('Are you sure you want to delete this delivery boy?'))) {
            try {
                await deleteUser(id);
                alert(t('Delivery boy deleted successfully!'));
                fetchUsers();
            } catch (error) {
                alert(t('Failed to delete delivery boy'));
            }
        }
    };

    return (
        <div className="max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('Delivery Boys')}</h2>
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-4 py-2 rounded-xl flex items-center gap-2 font-semibold">
                    <Truck size={20} />
                    {deliveryBoys.length} {t('Active Personnel')}
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder={t('Search delivery boys...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('Personnel')}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('Work Timing')}</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('Status')}</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('Actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {deliveryBoys.filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase())).map((boy) => (
                                <tr key={boy._id || boy.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                {boy.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{boy.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{boy.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                            <RefreshCw size={14} className="text-blue-500" />
                                            {boy.deliverySettings?.workTimings?.start || '09:00'} - {boy.deliverySettings?.workTimings?.end || '21:00'}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Telegram ID: {boy.deliverySettings?.telegramChatId || 'Not Set'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${boy.deliverySettings?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {boy.deliverySettings?.isActive ? t('Available') : t('Unavailable')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {(editingUser?._id || editingUser?.id) === (boy._id || boy.id) ? (
                                            <div className="text-left bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('Start Time')}</label>
                                                        <input
                                                            type="time"
                                                            value={formData.deliverySettings.workTimings.start}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                deliverySettings: {
                                                                    ...formData.deliverySettings,
                                                                    workTimings: { ...formData.deliverySettings.workTimings, start: e.target.value }
                                                                }
                                                            })}
                                                            className="w-full px-3 py-1.5 rounded-lg border dark:bg-gray-800 text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('End Time')}</label>
                                                        <input
                                                            type="time"
                                                            value={formData.deliverySettings.workTimings.end}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                deliverySettings: {
                                                                    ...formData.deliverySettings,
                                                                    workTimings: { ...formData.deliverySettings.workTimings, end: e.target.value }
                                                                }
                                                            })}
                                                            className="w-full px-3 py-1.5 rounded-lg border dark:bg-gray-800 text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">{t('Telegram Chat ID')}</label>
                                                    <input
                                                        type="text"
                                                        value={formData.deliverySettings.telegramChatId}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            deliverySettings: { ...formData.deliverySettings, telegramChatId: e.target.value }
                                                        })}
                                                        className="w-full px-3 py-1.5 rounded-lg border dark:bg-gray-800 text-sm"
                                                        placeholder="e.g., 123456789"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.deliverySettings.isActive}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            deliverySettings: { ...formData.deliverySettings, isActive: e.target.checked }
                                                        })}
                                                        className="rounded text-blue-600"
                                                    />
                                                    <span className="text-sm font-medium">{t('Active for Deliveries')}</span>
                                                </div>
                                                <div className="flex justify-end gap-2 pt-2">
                                                    <button onClick={() => setEditingUser(null)} className="text-gray-500 hover:text-gray-700 text-sm font-medium">{t('Cancel')}</button>
                                                    <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium">{t('Save Changes')}</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(boy)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(boy._id || boy.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
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

const AdsManagement = () => {
    // const {ads, addAd, deleteAd} = useData();
    // NEW HOOKS
    const { data: ads = [] } = useAds();
    const { mutateAsync: updateAdOrder } = useUpdateAdOrder();
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

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = ads.findIndex((ad) => (ad.id || ad._id) === active.id);
            const newIndex = ads.findIndex((ad) => (ad.id || ad._id) === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newOrder = arrayMove(ads, oldIndex, newIndex);
                const orderedIds = newOrder.map(ad => ad.id || ad._id);

                // Optimistic update
                queryClient.setQueryData(['ads', 'list'], newOrder);

                try {
                    await updateAdOrder(orderedIds);
                } catch (error) {
                    console.error('Failed to update ad order:', error);
                    queryClient.invalidateQueries(['ads', 'list']); // Revert on failure
                }
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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={ads.map(ad => ad.id || ad._id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ads.map(ad => (
                            <SortableAdCard key={ad._id || ad.id} ad={ad}>
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group relative">
                                    <div className="aspect-video relative">
                                        <DragHandle className="absolute top-2 left-2 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors cursor-grab active:cursor-grabbing">
                                            <GripVertical size={20} />
                                        </DragHandle>
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
                            </SortableAdCard>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
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

    const handleDeleteAllRequests = async () => {
        if (serviceRequestsData.length === 0) return;

        if (window.confirm(t('Are you sure you want to delete ALL service requests? This action cannot be undone.'))) {
            const confirmCount = window.prompt(t(`Type "${serviceRequestsData.length}" to confirm deletion of all ${serviceRequestsData.length} requests.`));
            if (confirmCount !== String(serviceRequestsData.length)) {
                alert(t('Deletion cancelled. Incorrect confirmation.'));
                return;
            }

            try {
                const deletePromises = serviceRequestsData.map(req => deleteServiceRequest(req._id || req.id));
                await Promise.all(deletePromises);
                alert(t('All service requests deleted successfully!'));
            } catch (error) {
                console.error('Error deleting all service requests:', error);
                alert(t('Failed to delete some requests.'));
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
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ClipboardList className="text-blue-600" />
                    {t('Service Requests')}
                </h2>
                {serviceRequestsData.length > 0 && (
                    <button
                        onClick={handleDeleteAllRequests}
                        className="p-2 sm:px-4 sm:py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
                        title={t('Delete All Service Requests')}
                    >
                        <Trash2 size={20} />
                        <span className="hidden sm:inline">{t('Delete All')}</span>
                    </button>
                )}
            </div>

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
                                                <td className="p-4 text-gray-600 dark:text-gray-300"> {/* New Address column */}
                                                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                                                        {request.address?.name || request.user?.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {request.address?.street}, {request.address?.city}
                                                    </div>
                                                    {/* Map Link */}
                                                    {(request.address?.location || request.user?.location) && (
                                                        <a
                                                            href={(() => {
                                                                const loc = request.address?.location || request.user?.location;
                                                                if (loc && loc.startsWith('http')) return loc;
                                                                return `https://maps.google.com/maps?q=${loc}`;
                                                            })()}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                                                        >
                                                            <MapPin size={12} />
                                                            {t('View Map')}
                                                        </a>
                                                    )}
                                                </td>
                                                <td className="p-4 text-gray-500 dark:text-gray-400 text-sm">
                                                    {formatDateTime(request.createdAt)}
                                                </td>
                                                <td className="p-4 flex flex-col gap-2">
                                                    <select
                                                        value={request.status}
                                                        onChange={(e) => handleStatusUpdate(request._id || request.id, e.target.value)}
                                                        className={`px-3 py-1.5 rounded-lg border-2 text-sm font-semibold transition-colors outline-none
                                                            ${request.status === 'Completed' ? 'border-green-100 bg-green-50 text-green-700' :
                                                                request.status === 'In Progress' ? 'border-blue-100 bg-blue-50 text-blue-700' :
                                                                    request.status === 'Cancelled' ? 'border-red-100 bg-red-50 text-red-700' :
                                                                        'border-yellow-100 bg-yellow-50 text-yellow-700'}`}
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

const CityManagement = () => {
    const { t } = useLanguage();
    const [cities, setCities] = useState([]);
    const [newCity, setNewCity] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchCities = async () => {
        try {
            setLoading(true);
            const data = await apiService.settings.get('cities');
            if (data.success && data.data) {
                // Ensure data.data.value is an array, default to empty if not
                setCities(Array.isArray(data.data.value) ? data.data.value : []);
            } else {
                setCities([]);
            }
        } catch (error) {
            console.error('Error fetching cities:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCities();
    }, []);

    const handleAddCity = async (e) => {
        e.preventDefault();
        if (!newCity.trim()) return;

        // Prevent duplicates (case-insensitive)
        if (cities.some(c => c.toLowerCase() === newCity.trim().toLowerCase())) {
            alert(t('City already exists!'));
            return;
        }

        const updatedCities = [...cities, newCity.trim()];

        try {
            const data = await apiService.settings.update('cities', updatedCities);
            if (data.success) {
                setCities(updatedCities);
                setNewCity('');
                setNewCity('');
                alert(t('City added successfully!'));
            } else {
                alert(data.message || t('Failed to add city'));
            }
        } catch (error) {
            console.error('Error adding city:', error);
            alert(`Failed to add city. Error: ${error.message}`);
        }
    };

    const handleRemoveCity = async (cityToRemove) => {
        if (!window.confirm(t(`Are you sure you want to remove ${cityToRemove}?`))) return;

        const updatedCities = cities.filter(c => c !== cityToRemove);

        try {
            const data = await apiService.settings.update('cities', updatedCities);
            if (data.success) {
                setCities(updatedCities);
                alert(t('City removed successfully!'));
            } else {
                alert(data.message || t('Failed to remove city'));
            }
        } catch (error) {
            console.error('Error removing city:', error);
            alert(t('Failed to remove city'));
        }
    };

    return (
        <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('City Management')}</h2>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8">
                <form onSubmit={handleAddCity} className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        placeholder={t('Enter city name')}
                        className="w-full flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!newCity.trim()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={20} />
                        {t('Add City')}
                    </button>
                </form>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">{t('Loading cities...')}</div>
                ) : cities.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {cities.map((city, index) => (
                            <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <span className="font-medium text-gray-900 dark:text-white">{city}</span>
                                <button
                                    onClick={() => handleRemoveCity(city)}
                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title={t('Remove')}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <MapPin className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">{t('No cities added yet. Add your first city above.')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Sortable Row Component for DnD tables
const SortableRow = ({ children, ...props }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props['data-id'] });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: 'relative',
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <SortableItemContext.Provider value={{ attributes, listeners, ref: setActivatorNodeRef }}>
            <tr ref={setNodeRef} style={style} className={`${props.className} ${isDragging ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                {children}
            </tr>
        </SortableItemContext.Provider>
    );
};

export default AdminDashboard;
