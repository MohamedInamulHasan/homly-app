import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import StoreProducts from './pages/StoreProducts';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import OrderConfirmation from './pages/OrderConfirmation';
import News from './pages/News';
import Services from './pages/Services';
import SavedProducts from './pages/SavedProducts';
import AdminDashboard from './pages/admin/AdminDashboard';
import CategoryProducts from './pages/CategoryProducts';
import ProductGroupProducts from './pages/ProductGroupProducts';
import MyStore from './pages/MyStore';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MyService from './pages/MyService';
import EditAddress from './pages/EditAddress';

import MobileFooter from './components/MobileFooter';
import InstallPrompt from './components/InstallPrompt';
import IntroAnimation from './components/IntroAnimation';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { useData } from './context/DataContext';
import { useAuth } from './context/AuthContext';
import MaintenanceScreen from './components/MaintenanceScreen';
import useBackButton from './utils/useBackButton';
import PrivateRoute from './components/PrivateRoute';
import OfflineScreen from './components/OfflineScreen';
import { useState } from 'react';

import ScrollToTop from './components/ScrollToTop';
import { App as CapacitorApp } from '@capacitor/app';

const DeepLinkHandler = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Only register deep link listener when running inside Capacitor (native app)
        if (!window.Capacitor?.isNativePlatform?.()) return;

        let listenerHandle;
        const setupDeepLinks = async () => {
            try {
                listenerHandle = await CapacitorApp.addListener('appUrlOpen', (data) => {
                    const slug = data.url.split('antigravity-homly-app.vercel.app').pop();
                    if (slug) {
                        navigate(slug);
                    }
                });
            } catch (err) {
                console.error('Deep link setup failed:', err);
            }
        };

        setupDeepLinks();

        return () => {
            listenerHandle?.remove?.();
        };
    }, [navigate]);

    return null;
};



const Layout = ({ children, onRefresh }) => {
    const location = useLocation();
    // Use back button handler for Android navigation
    useBackButton();
    // Only hide footer on order confirmation and auth pages
    const isAuthPage = location.pathname === '/login' ||
        location.pathname === '/signup' ||
        location.pathname === '/forgot-password' ||
        location.pathname.startsWith('/reset-password');

    const isAdminRoute = location.pathname.startsWith('/admin');

    const { settings, isFooterHidden } = useData();
    const { user } = useAuth();

    // Maintenance Mode Logic
    const isMaintenanceMode = settings?.maintenanceMode === true;
    const isAdmin = Array.isArray(user?.role) ? user?.role.includes('admin') : user?.role === 'admin'; // Specific check for 'admin' role

    const isExemptRoute =
        location.pathname === '/login' ||
        location.pathname === '/signup' ||
        location.pathname === '/forgot-password' ||
        location.pathname.startsWith('/reset-password') ||
        location.pathname.startsWith('/admin');
    const shouldBlock = isMaintenanceMode && !isAdmin && !isExemptRoute;

    if (shouldBlock) {
        return <MaintenanceScreen />;
    }

    // Footer Visibility: Only show on top-level navigation pages
    const allowedFooterRoutes = ['/', '/store', '/orders', '/profile'];
    const showMobileFooter = allowedFooterRoutes.includes(location.pathname) && !isFooterHidden;

    return (
        <div className="flex flex-col min-h-screen bg-[#E8EAEF] dark:bg-gray-900 transition-colors duration-200">
            <ScrollToTop />
            {/* {showNavbar && <Navbar />} */}
            {/* <PullToRefresh onRefresh={onRefresh} resistance={2.5} className="flex-grow flex flex-col"> */}
            <main className={`flex-grow flex flex-col ${showMobileFooter ? 'pb-32 md:pb-0 md:pr-28' : ''}`}>
                {children}
            </main>
            {/* </PullToRefresh> */}
            {showMobileFooter && <MobileFooter />}
            {!isAuthPage && <InstallPrompt />}
        </div>
    );
};

import PullToRefresh from 'react-simple-pull-to-refresh';

function App() {
    const { initialLoading, refreshData } = useData();
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleRefresh = async () => {
        if (refreshData) {
            await refreshData();
        }
    };

    return (
        <AuthProvider>
            <Router>
                <DeepLinkHandler />
                
                {/* Show offline screen first if no internet */}
                {isOffline && <OfflineScreen />}

                {/* Show intro animation during initial load if online */}
                {!isOffline && initialLoading && <IntroAnimation />}

                {/* Main app content - hidden during intro or offline */}
                <div style={{ display: (initialLoading || isOffline) ? 'none' : 'block' }}>
                    <CartProvider>
                        <Layout onRefresh={handleRefresh}>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/store" element={<Shop />} />
                                <Route path="/shop" element={<Navigate to="/store" replace />} />
                                <Route path="/store/:id" element={<StoreProducts />} />
                                <Route path="/product/:id" element={<ProductDetails />} />
                                <Route path="/news" element={<News />} />
                                <Route path="/services" element={<Services />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/reset-password/:token" element={<ResetPassword />} />

                                {/* Protected Routes */}
                                <Route
                                    path="/profile"
                                    element={
                                        <PrivateRoute>
                                            <Profile />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/edit-address"
                                    element={
                                        <PrivateRoute>
                                            <EditAddress />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/cart"
                                    element={
                                        <PrivateRoute>
                                            <Cart />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/checkout"
                                    element={
                                        <PrivateRoute>
                                            <Checkout />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/orders"
                                    element={
                                        <PrivateRoute>
                                            <Orders />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/orders/:id"
                                    element={
                                        <PrivateRoute>
                                            <OrderDetails />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/order-confirmation"
                                    element={
                                        <PrivateRoute>
                                            <OrderConfirmation />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/saved-products"
                                    element={
                                        <PrivateRoute>
                                            <SavedProducts />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/my-store"
                                    element={
                                        <PrivateRoute>
                                            <MyStore />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/my-service"
                                    element={
                                        <PrivateRoute>
                                            <MyService />
                                        </PrivateRoute>
                                    }
                                />
                                <Route path="/category/:categoryName" element={<CategoryProducts />} />
                                <Route path="/product-group/:productName" element={<ProductGroupProducts />} />
                                <Route
                                    path="/admin"
                                    element={
                                        <PrivateRoute adminOnly={true}>
                                            <AdminDashboard />
                                        </PrivateRoute>
                                    }
                                />
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Layout>
                    </CartProvider>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
