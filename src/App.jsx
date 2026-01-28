import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import CategoryProducts from './pages/CategoryProducts';
import ProductGroupProducts from './pages/ProductGroupProducts';

import ScrollToTop from './components/ScrollToTop';

const Layout = ({ children, onRefresh }) => {
    const location = useLocation();
    // Use back button handler for Android navigation
    useBackButton();
    // Only hide footer on order confirmation and auth pages
    const hideMobileFooter = location.pathname === '/order-confirmation' ||
        location.pathname === '/login' ||
        location.pathname === '/signup' ||
        location.pathname === '/forgot-password' ||
        location.pathname.startsWith('/reset-password') ||
        location.pathname.startsWith('/admin');

    const isAuthPage = location.pathname === '/login' ||
        location.pathname === '/signup' ||
        location.pathname === '/forgot-password' ||
        location.pathname.startsWith('/reset-password');

    const isAdminRoute = location.pathname.startsWith('/admin');

    const { settings } = useData();
    const { user } = useAuth();

    // Maintenance Mode Logic
    const isMaintenanceMode = settings?.maintenanceMode === true;
    const isAdmin = user?.role === 'admin'; // Specific check for 'admin' role

    // Allow access if:
    // 1. Maintenance mode is OFF
    // 2. OR User is an Admin
    // 3. OR User is on a public auth page (Login/Signup) - OPTIONAL: Decided to block even auth to prevent confusion, 
    //    BUT Super Admins need to login! So we MUST allow Login page access.

    // Refined Logic:
    // If Mode is ON:
    // - Show Maintenance Screen
    // - EXCEPT if user is Admin (but we don't know if they are admin until they login)
    // - So we must allow access to /login, /admin (which redirects to login if not auth)

    // Wait, if we block everything, how does an Admin login?
    // We should probably allow the '/login' and '/admin' routes.

    // We should probably allow the '/login' and '/admin' routes.
    // Also allow signup and password reset flows so admins/users can recover accounts even during maintenance.
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

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <ScrollToTop />
            {!isAuthPage && <Navbar />}
            {/* <PullToRefresh onRefresh={onRefresh} resistance={2.5} className="flex-grow flex flex-col"> */}
            <main className={`flex-grow ${hideMobileFooter ? '' : 'pb-32'} md:pb-0 min-h-screen`}>
                {children}
            </main>
            {/* </PullToRefresh> */}
            {!isAuthPage && !isAdminRoute && <MobileFooter />}
            {!isAuthPage && <InstallPrompt />}
        </div>
    );
};

import MyStore from './pages/MyStore';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// ... existing imports ...

// ... existing imports ...

import PullToRefresh from 'react-simple-pull-to-refresh';

function App() {
    const { initialLoading, refreshData } = useData();

    const handleRefresh = async () => {
        if (refreshData) {
            await refreshData();
        }
    };

    return (
        <AuthProvider>
            <Router>
                {/* Show intro animation during initial load */}
                {initialLoading && <IntroAnimation />}

                {/* Main app content - hidden during intro */}
                <div style={{ display: initialLoading ? 'none' : 'block' }}>
                    <Layout onRefresh={handleRefresh}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/store" element={<Shop />} />
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
                        </Routes>
                    </Layout>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
