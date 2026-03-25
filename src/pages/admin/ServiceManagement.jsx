import { API_BASE_URL } from '../../utils/api';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Wrench,
    Plus,
    Upload,
    Search,
    Edit2,
    Trash2,
    MapPin,
    ArrowLeft,
    List,
    Save,
    Phone,
    GripVertical,
    Copy,
    Package
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
    useServices,
    useCreateService,
    useUpdateService,
    useDeleteService,
    useServiceItems,
    useCreateServiceItem,
    useUpdateServiceItem,
    useDeleteServiceItem,
    useUpdateServiceOrder,
    useUpdateServiceItemOrder
} from '../../hooks/queries/useServices';
import useCloudinaryUpload from '../../hooks/useCloudinaryUpload';
import { useQueryClient } from '@tanstack/react-query';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableServiceItemRow, DragHandle } from './AdminDashboard_Sortables';

const ServiceManagement = ({ serviceAdminMode = false, myServiceId = null }) => {
    const { t } = useLanguage();

    // Hooks
    const { data: allServices = [], isLoading: loadingServices } = useServices();

    // Filter services if in service admin mode
    const services = (serviceAdminMode && myServiceId)
        ? allServices.filter(s => {
            const sid = s._id || s.id;
            const targetId = myServiceId?._id || myServiceId?.id || myServiceId;
            return String(sid) === String(targetId);
        })
        : allServices;

    // Mutations for Services
    const { mutateAsync: addService } = useCreateService();
    const { mutateAsync: updateService } = useUpdateService();
    const { mutateAsync: deleteService } = useDeleteService();
    const { mutateAsync: updateOrder } = useUpdateServiceOrder();

    // Mutations for Service Items
    const { mutateAsync: addItem } = useCreateServiceItem();
    const { mutateAsync: updateItem } = useUpdateServiceItem();
    const { mutateAsync: deleteItem } = useDeleteServiceItem();
    const { mutateAsync: updateItemOrder } = useUpdateServiceItemOrder();

    const { uploadImage, uploading: uploadingImage } = useCloudinaryUpload();

    const [view, setView] = useState('list'); // 'list', 'form', 'serviceItems', 'itemForm'
    const [selectedService, setSelectedService] = useState(null);
    const [editingService, setEditingService] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Local state for DnD
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (services.length > 0) {
            setItems(services);
        }
    }, [services]);

    // Auto-select and go to service items view for service admin
    // Removed to show service card first as requested
    /*
    useEffect(() => {
        if (serviceAdminMode && myServiceId && services.length > 0) {
            const myService = services.find(
                s => (s._id || s.id) === myServiceId ||
                     String(s._id || s.id) === String(myServiceId)
            );
            if (myService && !selectedService) {
                setSelectedService(myService);
                setView('serviceItems');
            }
        }
    }, [serviceAdminMode, myServiceId, services, selectedService]);
    */

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

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => (item._id || item.id) === active.id);
                const newIndex = items.findIndex((item) => (item._id || item.id) === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                const orderedIds = newItems.map(item => item._id || item.id);
                updateOrder(orderedIds);

                return newItems;
            });
        }
    };

    const handleItemDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setDisplayServiceItems((prevItems) => {
                const oldIndex = prevItems.findIndex((item) => (item._id || item.id) === active.id);
                const newIndex = prevItems.findIndex((item) => (item._id || item.id) === over.id);
                const newItems = arrayMove(prevItems, oldIndex, newIndex);

                const orderedIds = newItems.map(item => item._id || item.id);
                updateItemOrder({ serviceId: selectedService._id || selectedService.id, orderedIds });

                return newItems;
            });
        }
    };

    const [displayServiceItems, setDisplayServiceItems] = useState([]);

    // Fetch items only when a service is selected
    const { data: serviceItems = [] } = useServiceItems(selectedService?._id || selectedService?.id);

    useEffect(() => {
        if (serviceItems && Array.isArray(serviceItems)) {
            setDisplayServiceItems(serviceItems);
        } else {
            setDisplayServiceItems([]);
        }
    }, [serviceItems]);

    // Form States
    const [serviceForm, setServiceForm] = useState({
        name: '',
        category: '',
        description: '',
        image: '',
        address: '',
        mobile: '',
    });

    const [itemForm, setItemForm] = useState({
        name: '',
        image: ''
    });

    // --- Handlers ---

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const imageUrl = await uploadImage(file);
                setServiceForm(prev => ({ ...prev, image: imageUrl }));
            } catch (error) {
                console.error('Image upload failed:', error);
                alert(t('Failed to upload image. Please try again.'));
            }
        }
    };

    // Service Handlers
    const handleEditService = (service) => {
        setEditingService(service);
        setServiceForm({
            name: service.name,
            category: service.category,
            description: service.description,
            image: service.image,
            address: service.address,
            mobile: service.mobile,
        });
        setView('form');
    };

    const handleDeleteService = async (id) => {
        if (window.confirm(t('Are you sure you want to delete this service?'))) {
            try {
                await deleteService(id);
            } catch (error) {
                console.error('Error deleting service:', error);
                alert(t('Failed to delete service.'));
            }
        }
    };

    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingService) {
                await updateService({ id: editingService._id || editingService.id, data: serviceForm });
                alert(t('Service updated successfully!'));
            } else {
                await addService(serviceForm);
                alert(t('Service added successfully!'));
            }
            setServiceForm({ name: '', category: '', description: '', image: '', address: '', mobile: '' });
            // If service admin edited their service, return to items view; otherwise back to list
            if (serviceAdminMode && editingService) {
                setView('serviceItems');
            } else {
                setEditingService(null);
                setView('list');
            }
        } catch (error) {
            console.error('Error saving service:', error);
            alert(t('Failed to save service.'));
        }
    };

    const handleManageItems = (service) => {
        setSelectedService(service);
        setView('serviceItems');
    };

    // Item Handlers
    const handleAddItem = () => {
        setItemForm({ name: '', image: '', isAvailable: true });
        setEditingItem(null);
        setView('itemForm');
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setItemForm({
            name: item.name,
            image: item.image,
            isAvailable: item.isAvailable !== false,
            description: item.description || '',
            price: item.price || ''
        });
        setView('itemForm');
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm(t('Are you sure you want to delete this item?'))) {
            try {
                await deleteItem(itemId);
            } catch (error) {
                console.error('Error deleting item:', error);
                alert(t('Failed to delete item.'));
            }
        }
    };

    const handleItemSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await updateItem({ itemId: editingItem._id || editingItem.id, data: itemForm });
                alert(t('Item updated successfully!'));
            } else {
                await addItem({ serviceId: selectedService._id || selectedService.id, data: itemForm });
                alert(t('Item added successfully!'));
            }
            setView('serviceItems');
        } catch (error) {
            console.error('Error saving item:', error);
            alert(t('Failed to save item.'));
        }
    };

    // Filtering
    // Apply filtering to 'items' (local state) instead of 'services' if we want to drag filtered list?
    // dragging filtered list is tricky because index changes.
    // If search is active, we should probably disable DnD or filter from 'items'.
    // Use 'items' for display.
    const displayedServices = Array.isArray(items) ? items.filter(s =>
        s?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s?.category?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    const handleDuplicateItem = async (item) => {
        if (!window.confirm(t('Duplicate this item?'))) return;
        try {
            const { _id, id, createdAt, updatedAt, __v, ...rest } = item;
            await addItem({
                serviceId: selectedService._id || selectedService.id,
                data: {
                    ...rest,
                    name: `${rest.name} (Copy)`
                }
            });
            alert(t('Item duplicated successfully!'));
        } catch (error) {
            console.error('Error duplicating item:', error);
            alert(t('Failed to duplicate item.'));
        }
    };

    const isSearching = searchQuery.length > 0;

    return (
        <div className="max-w-6xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {view !== 'list' && !(serviceAdminMode && view === 'serviceItems') && (
                        <button
                            onClick={() => {
                                if (view === 'itemForm') setView('serviceItems');
                                else setView('list');
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-700 dark:text-gray-200"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                        {view === 'list' && t('Service Management')}
                        {view === 'form' && (editingService ? t('Edit Service') : t('Add New Service'))}
                        {view === 'serviceItems' && `${selectedService?.name} - ${t('Items')}`}
                        {view === 'itemForm' && (editingItem ? t('Edit Item') : t('Add New Item'))}
                    </h2>
                </div>

                <div className="flex gap-2">
                    {view === 'list' && !serviceAdminMode && (
                        <button
                            onClick={() => {
                                setEditingService(null);
                                setServiceForm({ name: '', category: '', description: '', image: '', address: '', mobile: '' });
                                setView('form');
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20} />
                            {t('Add Service')}
                        </button>
                    )}
                    {view === 'serviceItems' && serviceAdminMode && selectedService && (
                        <button
                            onClick={() => handleEditService(selectedService)}
                            className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                        >
                            <Edit2 size={16} />
                            {t('Edit Details')}
                        </button>
                    )}
                    {view === 'serviceItems' && (
                        <button
                            onClick={handleAddItem}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20} />
                            {t('Add Item')}
                        </button>
                    )}
                </div>
            </div>

            {/* View: List of Services */}
            {view === 'list' && (
                <>
                    <div className="mb-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('Search services...')}
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
                        <SortableContext
                            items={displayedServices.map(s => s._id || s.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayedServices.map(service => (
                                    <SortableServiceCard
                                        key={service._id || service.id}
                                        service={service}
                                        handleManageItems={handleManageItems}
                                        handleEditService={handleEditService}
                                        handleDeleteService={handleDeleteService}
                                        t={t}
                                        serviceAdminMode={serviceAdminMode}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </>
            )}

            {/* View: Service Form */}
            {view === 'form' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <form onSubmit={handleServiceSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Service Name')}</label>
                                <input
                                    type="text"
                                    value={serviceForm.name}
                                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Category')}</label>
                                <input
                                    type="text"
                                    value={serviceForm.category}
                                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g., Home, Vehicle"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Description')}</label>
                                <textarea
                                    value={serviceForm.description}
                                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none h-24"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Address')}</label>
                                <input
                                    type="text"
                                    value={serviceForm.address}
                                    onChange={(e) => setServiceForm({ ...serviceForm, address: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Mobile')}</label>
                                <input
                                    type="text"
                                    value={serviceForm.mobile}
                                    onChange={(e) => setServiceForm({ ...serviceForm, mobile: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Service Image')}</label>
                                <div className="flex items-center gap-4">
                                    {(serviceForm.image) && (
                                        <img
                                            src={serviceForm.image}
                                            alt="Preview"
                                            className="w-16 h-16 rounded-lg object-cover bg-white"
                                        />
                                    )}
                                    <label className="flex-1 cursor-pointer">
                                        <div className="w-full px-4 py-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                                            <Upload size={20} />
                                            <span>{uploadingImage ? t('Uploading...') : t('Upload Image')}</span>
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={uploadingImage}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                            >
                                <Save size={20} />
                                {editingService ? t('Update Service') : t('Add Service')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* View: Service Items List */}
            {view === 'serviceItems' && selectedService && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleItemDragEnd}
                        >
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
                                        <th className="p-4 w-12"></th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{t('Image')}</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{t('Name')}</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{t('Price')}</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{t('Available')}</th>
                                        <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    <SortableContext
                                        items={displayServiceItems.map(item => item._id || item.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {Array.isArray(displayServiceItems) && displayServiceItems.map(item => (
                                            <SortableServiceItemRow key={item._id || item.id} item={item}>
                                                <td className="p-4">
                                                    <DragHandle className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-400">
                                                        <GripVertical size={18} />
                                                    </DragHandle>
                                                </td>
                                                <td className="p-4">
                                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 dark:border-gray-700">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100?text=No+Image'; }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="p-4 font-bold text-gray-900 dark:text-white">
                                                    <div className="truncate max-w-[200px]" title={item.name}>{item.name}</div>
                                                    <div className="text-[10px] text-gray-400 font-medium truncate max-w-[200px]">{item.description}</div>
                                                </td>
                                                <td className="p-4 font-black text-gray-900 dark:text-white">
                                                    {item.price ? `₹${item.price}` : t('Price on Request')}
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={async () => {
                                                            const currentStatus = item.isAvailable !== false;
                                                            const itemId = item._id || item.id;

                                                            // Optimistic update
                                                            // Since we don't have a global state for service items here, 
                                                            // we rely on the component's state if possible.
                                                            // Actually, let's just toggle and let the mutation handle it.
                                                            // We'll update the item directly in local display list if needed.
                                                            
                                                            try {
                                        await updateItem({
                                            itemId: itemId,
                                            data: { isAvailable: !currentStatus }
                                        });
                                    } catch (error) {
                                        console.error('Failed to toggle availability:', error);
                                    }
                                }}
                                                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${item.isAvailable !== false ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
                                                    >
                                                        <motion.span
                                                            layout
                                                            transition={{ type: "spring", stiffness: 700, damping: 30 }}
                                                            animate={{ x: item.isAvailable !== false ? 22 : 2 }}
                                                            className="inline-block h-5 w-5 transform rounded-full bg-white shadow-md"
                                                        />
                                                    </button>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleDuplicateItem(item)}
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-colors"
                                                            title={t('Duplicate')}
                                                        >
                                                            <Copy size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditItem(item)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                                                            title={t('Edit')}
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteItem(item._id || item.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                                            title={t('Delete')}
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </SortableServiceItemRow>
                                        ))}
                                    </SortableContext>
                                    {(!displayServiceItems || displayServiceItems.length === 0) && (
                                        <tr>
                                            <td colSpan="6" className="p-12 text-center">
                                                <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
                                                    <Package size={48} className="opacity-20" />
                                                    <p className="font-bold">{t('No items found. Add one to get started!')}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </DndContext>
                    </div>
                </div>
            )}

            {/* View: Item Form */}
            {view === 'itemForm' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <form onSubmit={handleItemSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Item Name')}</label>
                                <input
                                    type="text"
                                    value={itemForm.name}
                                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g., General Service"
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isAvailable"
                                    checked={itemForm.isAvailable !== false}
                                    onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('Available')}
                                </label>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Item Image')}</label>
                                <div className="flex items-center gap-4">
                                    {(itemForm.image) && (
                                        <img
                                            src={itemForm.image}
                                            alt="Preview"
                                            className="w-16 h-16 rounded-lg object-cover bg-white"
                                        />
                                    )}
                                    <label className="flex-1 cursor-pointer">
                                        <div className="w-full px-4 py-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                                            <Upload size={20} />
                                            <span>{uploadingImage ? t('Uploading...') : t('Upload Image')}</span>
                                        </div>
                                        <input type="file" accept="image/*" onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                uploadImage(file).then(url => {
                                                    setItemForm(prev => ({ ...prev, image: url }));
                                                }).catch(() => alert(t('Failed to upload image')));
                                            }
                                        }} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                            >
                                <Save size={20} />
                                {editingItem ? t('Update Item') : t('Add Item')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};



const SortableServiceCard = ({ service, handleManageItems, handleEditService, handleDeleteService, t, serviceAdminMode }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: service._id || service.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

    const isActive = service.isActive !== false;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col h-full ${!isActive ? 'grayscale opacity-80' : ''}`}
        >
            <div className="relative h-40 overflow-hidden cursor-pointer" onClick={() => handleManageItems(service)}>
                {/* Drag Handle (Only for global admin) */}
                {!serviceAdminMode && (
                    <div
                        {...attributes}
                        {...listeners}
                        className="absolute top-3 left-3 z-30 p-2 bg-black/50 hover:bg-black/70 text-white rounded-xl backdrop-blur-md transition-all cursor-grab active:cursor-grabbing border border-white/10 shadow-lg"
                    >
                        <GripVertical size={18} />
                    </div>
                )}

                <img
                    src={service.image || `${API_BASE_URL}/services/${service._id || service.id}/image`}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                    alt={service.name}
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${!isActive ? 'grayscale opacity-60' : ''}`}
                />

                {/* Advanced Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                {/* Status Badge - Floating Glassmorphism */}
                <div className="absolute top-3 right-3 z-20">
                    <div className={`backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl border border-white/20 flex items-center gap-2 ${isActive ? 'bg-emerald-500/80' : 'bg-gray-600/80'} text-white`}>
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse bg-white`} />
                        <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                            {isActive ? t('Active') : t('Inactive')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-4 flex flex-col flex-grow gap-3">
                <div className="space-y-0.5">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {service.name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-[8px] uppercase tracking-widest font-black rounded-lg border border-gray-100 dark:border-gray-600">
                            {service.category}
                        </span>
                    </div>
                </div>

                {/* Info Pill */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-3 space-y-2 border border-gray-100 dark:border-gray-800/50">
                    <div className="flex items-center gap-2 truncate">
                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                            <MapPin size={14} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 truncate opacity-80" title={service.address}>
                            {service.address || t('No address')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-orange-500/10 rounded-lg">
                            <Phone size={14} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-[10px] font-black text-gray-700 dark:text-gray-200">
                            {service.mobile || t('No contact')}
                        </span>
                    </div>
                </div>

                {/* Admin Actions */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                    <button
                        onClick={() => handleManageItems(service)}
                        className="col-span-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[1.25rem] shadow-xl shadow-blue-500/10 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                    >
                        <Package size={16} className="transition-transform group-hover/btn:rotate-12" />
                        <span className="text-[10px] font-black uppercase tracking-wider">{t('Manage Items')}</span>
                    </button>

                    <div className="col-span-2 flex items-center justify-center gap-4 mt-1 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                        <button
                            onClick={() => handleEditService(service)}
                            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors px-2.5 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        >
                            <Edit2 size={12} />
                            {t('Edit')}
                        </button>
                        {!serviceAdminMode && (
                            <button
                                onClick={() => handleDeleteService(service._id || service.id)}
                                className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors px-2.5 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            >
                                <Trash2 size={12} />
                                {t('Delete')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceManagement;
