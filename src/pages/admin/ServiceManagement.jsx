import { API_BASE_URL } from '../../utils/api';
import { useState, useEffect } from 'react';
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
    GripVertical
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

const ServiceManagement = () => {
    const { t } = useLanguage();

    // Hooks
    const { data: services = [] } = useServices();

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
            setEditingService(null);
            setView('list');
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
        setItemForm({ name: '', image: '' });
        setEditingItem(null);
        setView('itemForm');
    };

    const handleEditItem = (item) => {
        setEditingItem(item);
        setItemForm({
            name: item.name,
            image: item.image,
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

    const isSearching = searchQuery.length > 0;

    return (
        <div className="max-w-6xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {view !== 'list' && (
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
                    {view === 'list' && (
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
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleItemDragEnd}
                        >
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="p-4 w-10"></th>
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Name')}</th>
                                        <th className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('Actions')}</th>
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
                                                    <DragHandle className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-400">
                                                        <GripVertical size={18} />
                                                    </DragHandle>
                                                </td>
                                                <td className="p-4 font-medium text-gray-900 dark:text-white">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-12 h-12 rounded-lg object-cover bg-white"
                                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100?text=No+Image'; }}
                                                        />
                                                        {item.name}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEditItem(item)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteItem(item._id || item.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
                                            <td colSpan="4" className="p-8 text-center text-gray-500 dark:text-gray-400">
                                                {t('No items found. Add one to get started!')}
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



const SortableServiceCard = ({ service, handleManageItems, handleEditService, handleDeleteService, t }) => {
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

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group relative"
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 left-2 z-20 p-2 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-lg cursor-grab hover:bg-white dark:hover:bg-black/70 text-gray-700 dark:text-gray-200"
            >
                <GripVertical size={16} />
            </div>

            <div className="h-48 overflow-hidden relative">
                <img
                    src={service.image || `${API_BASE_URL}/services/${service._id || service.id}/image`}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x200?text=No+Image'; }}
                    alt={service.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    {service.category}
                </div>
            </div>
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{service.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>

                <div className="flex flex-col gap-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2"><MapPin size={16} /> {service.address}</div>
                    <div className="flex items-center gap-2"><Phone size={16} /> {service.mobile}</div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => handleManageItems(service)}
                        className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                        {t('Manage Items')}
                    </button>
                    <button
                        onClick={() => handleEditService(service)}
                        className="p-2 border border-gray-200 dark:border-gray-700 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                        <Edit2 size={20} />
                    </button>
                    <button
                        onClick={() => handleDeleteService(service._id || service.id)}
                        className="p-2 border border-gray-200 dark:border-gray-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceManagement;
