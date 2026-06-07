import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Bell, CheckCircle, Truck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationOverlay = () => {
    const { socket } = useSocket();
    const { t } = useLanguage();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    const isAdmin = Array.isArray(user?.role) ? user?.role.includes('admin') : user?.role === 'admin';

    useEffect(() => {
        if (!socket) return;

        const handleOrderUpdated = (order) => {
            // Only show notification to the user who owns the order
            if (user && order.user === user._id) {
                addNotification({
                    id: Date.now(),
                    type: 'order_status',
                    title: t('Order Status Update'),
                    message: `${t('Order')} #${order._id.slice(-6)} ${t('is now')} ${t(order.status)}`,
                    icon: order.status === 'Out for Delivery' ? <Truck className="text-blue-500" /> : <Package className="text-green-500" />,
                    onClick: () => navigate(`/orders/${order._id}`)
                });
            }
        };

        const handleOrderCreated = (order) => {
            // Show to admin only
            if (isAdmin) {
                addNotification({
                    id: Date.now(),
                    type: 'new_order',
                    title: t('New Order Received!'),
                    message: `${t('Order')} #${order._id.slice(-6)} ${t('from')} ${order.shippingAddress?.name || t('Guest')}`,
                    icon: <Bell className="text-orange-500" />,
                    onClick: () => navigate('/admin')
                });
            }
        };

        socket.on('order:updated', handleOrderUpdated);
        socket.on('order:created', handleOrderCreated);

        return () => {
            socket.off('order:updated', handleOrderUpdated);
            socket.off('order:created', handleOrderCreated);
        };
    }, [socket, user, isAdmin, t, navigate]);

    const addNotification = (notif) => {
        setNotifications(prev => [...prev, notif]);
        setTimeout(() => {
            removeNotification(notif.id);
        }, 5000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4 pointer-events-none">
            <AnimatePresence>
                {notifications.map((notif) => (
                    <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => {
                            notif.onClick();
                            removeNotification(notif.id);
                        }}
                        className="mb-3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 pointer-events-auto cursor-pointer flex items-center gap-4 relative overflow-hidden group active:scale-[0.98] transition-transform"
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center shrink-0">
                            {notif.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{notif.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{notif.message}</p>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notif.id);
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 transition-colors"
                        >
                            <X size={16} />
                        </button>
                        <div className="absolute bottom-0 left-0 h-1 bg-[#2E5A2E] dark:bg-[#CBF9B2] animate-progress" style={{ animationDuration: '5000ms' }} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default NotificationOverlay;
