import { useState, useContext, useEffect } from 'react';
import { 
    User, Package, Settings, ChevronRight, LogOut, 
    Shield, Wrench, Store, ArrowLeft, MoreHorizontal, 
    MapPin, Lock, HelpCircle, Pencil, Languages, Heart,
    ChevronDown, ShoppingCart, Newspaper, Coins,
    Truck, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AuthContext from '../context/AuthContext';
import { useUserProfile } from '../hooks/queries/useUsers';
import { useData } from '../context/DataContext';
import { useOrders } from '../hooks/queries/useOrders';
import LogoutModal from '../components/LogoutModal';

const MenuLink = ({ icon, title, to, onClick, isRed = false }) => {
    const Wrapper = to ? Link : 'button';
    return (
        <Wrapper 
            to={to} 
            onClick={onClick}
            className={`w-full flex items-center justify-between py-3.5 px-2 hover:bg-gray-100/50 dark:hover:bg-gray-800 transition-colors group ${!to ? 'cursor-pointer focus:outline-none' : ''}`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 ${isRed ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
                    {icon}
                </div>
                <span className={`text-[15px] font-medium ${isRed ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                    {title}
                </span>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </Wrapper>
    );
};



const Profile = () => {
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const { setIsFooterHidden } = useData();
    const { user: authUser, logout } = useContext(AuthContext);
    const { cartCount } = useCart();

    const { data: userProfile } = useUserProfile();
    const { data: ordersData } = useOrders();
    
    const user = userProfile?.data || authUser;
    const orders = ordersData?.data || ordersData || [];
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Filter relevant statuses for admins
    const statusCounts = orders.reduce((acc, order) => {
        const s = order.status;
        if (s === 'Delivered') acc.delivered++;
        if (s === 'Cancelled') acc.cancelled++;
        if (s === 'Out for Delivery') acc.outForDelivery++;
        if (s === 'Processing') acc.processing++;
        return acc;
    }, { delivered: 0, cancelled: 0, outForDelivery: 0, processing: 0 });

    const roles = user ? (Array.isArray(user.role) ? user.role : [user.role || 'customer']) : [];
    const isAdminView = roles.some(role => ['admin', 'store_admin', 'delivery_boy'].includes(role));

    useEffect(() => {
        setIsFooterHidden(showLogoutModal);
        return () => setIsFooterHidden(false);
    }, [showLogoutModal, setIsFooterHidden]);

    const handleLogout = () => setShowLogoutModal(true);
    const confirmLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="min-h-screen bg-[#E8EAEF] dark:bg-gray-900 transition-colors duration-200 w-full relative pb-48">
            
            {/* Logout Modal */}
            <LogoutModal 
                isOpen={showLogoutModal} 
                onClose={() => setShowLogoutModal(false)} 
                onConfirm={confirmLogout} 
            />

            {/* Premium Light Green Header Card / Dark Mode Adjusted */}
            <div className="fixed top-0 left-0 right-0 z-50 w-full bg-[#CBF9B2] dark:bg-[#1a381a] rounded-b-[2.5rem] px-4 pt-4 pb-4 shadow-sm overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/30 dark:bg-[#2E5A2E]/20 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10">
                    <div className="w-full px-4 relative flex items-center justify-center min-h-[42px]">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2">
                            <button onClick={() => navigate(-1)} className="w-[42px] h-[42px] flex items-center justify-center bg-white dark:bg-gray-800 rounded-full text-gray-900 dark:text-white transition-transform active:scale-95 shadow-sm border border-gray-100/50 dark:border-gray-700">
                                <ArrowLeft size={22} />
                            </button>
                        </div>
                        <div className="flex flex-col text-center">
                            <h1 className="text-[18px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight">{t('Profile')}</h1>
                            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">{t('Manage account')}</p>
                        </div>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <button 
                                onClick={() => navigate('/cart')}
                                className="w-[42px] h-[42px] flex items-center justify-center bg-white dark:bg-gray-800 rounded-full text-gray-900 dark:text-white transition-transform active:scale-95 shadow-sm border border-black/5 dark:border-gray-700 relative"
                            >
                                <ShoppingCart size={22} className="text-gray-700 dark:text-gray-300" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-sm border-2 border-white dark:border-gray-800">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-[100px]">
            <div className="px-5 mt-2 max-w-3xl mx-auto w-full">
                {/* Profile Widget */}
                <div className="bg-white dark:bg-gray-800/80 rounded-[2.5rem] p-4 flex items-center justify-between mb-8 shadow-sm border border-gray-100 dark:border-gray-700">
                     <div className="flex items-center gap-5 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                               <div className="w-[64px] h-[64px] bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm">
                                    {/* Real image if available, else highly stylized fallback */}
                                    {user?.avatar ? (
                                         <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                         <img src="https://i.pravatar.cc/150?img=47" alt="Profile" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                    )}
                                    <div className="hidden w-full h-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500">
                                        <User size={24} />
                                    </div>
                               </div>
                                 {/* Flat Coin Badge - Shadow Free - Only show if > 0 */}
                                 {Number(user?.coins || 0) > 0 && (
                                     <div className="absolute -bottom-0.5 -right-0.5 bg-[#FFCE31] rounded-full px-2 py-1 flex items-center gap-1 border-2 border-white dark:border-gray-800 z-10">
                                         <Coins size={10} className="text-[#2E5A2E]" />
                                         <span className="text-[11px] font-black text-[#2E5A2E] leading-none">
                                             {user?.coins}
                                         </span>
                                     </div>
                                 )}
                          </div>
                          <div className="flex-1 min-w-0">
                               <h2 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight tracking-tight truncate">
                                   {user?.name || 'Guest User'}
                               </h2>
                               <p className="text-[13px] font-medium text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                                   {user?.email || 'Not logged in'}
                               </p>
                          </div>
                     </div>
                </div>

                {/* Performance Summary for Admins/Delivery Boys */}
                {isAdminView && (
                    <div className="grid grid-cols-4 gap-2 mb-8">
                        {/* Processing */}
                        <div className="bg-white dark:bg-gray-800/50 p-2.5 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-500 mb-2">
                                <Clock size={16} />
                            </div>
                            <span className="text-[15px] font-black text-gray-900 dark:text-white leading-none mb-1">{statusCounts.processing}</span>
                            <span className="text-[8.5px] font-bold text-gray-400 uppercase tracking-tight">{t('Process')}</span>
                        </div>

                        {/* Out for Delivery */}
                        <div className="bg-white dark:bg-gray-800/50 p-2.5 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                            <div className="w-8 h-8 rounded-full bg-[#FFCE31]/10 flex items-center justify-center text-[#2E5A2E] mb-2">
                                <Truck size={16} />
                            </div>
                            <span className="text-[15px] font-black text-gray-900 dark:text-white leading-none mb-1">{statusCounts.outForDelivery}</span>
                            <span className="text-[8.5px] font-bold text-gray-400 uppercase tracking-tight">{t('Transit')}</span>
                        </div>

                        {/* Delivered */}
                        <div className="bg-white dark:bg-gray-800/50 p-2.5 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                            <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/10 flex items-center justify-center text-green-600 mb-2">
                                <CheckCircle2 size={16} />
                            </div>
                            <span className="text-[15px] font-black text-gray-900 dark:text-white leading-none mb-1">{statusCounts.delivered}</span>
                            <span className="text-[8.5px] font-bold text-gray-400 uppercase tracking-tight">{t('Deliver')}</span>
                        </div>

                        {/* Cancelled */}
                        <div className="bg-white dark:bg-gray-800/50 p-2.5 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                            <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-500 mb-2">
                                <XCircle size={16} />
                            </div>
                            <span className="text-[15px] font-black text-gray-900 dark:text-white leading-none mb-1">{statusCounts.cancelled}</span>
                            <span className="text-[8.5px] font-bold text-gray-400 uppercase tracking-tight">{t('Cancel')}</span>
                        </div>
                    </div>
                )}

                {/* Account Section */}
                <div className="mb-6">
                     <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-4 px-2 tracking-tight">{t('Account')}</h3>
                     <div className="bg-white dark:bg-gray-800/50 rounded-[2rem] p-3 flex flex-col items-center shadow-sm border border-gray-100 dark:border-gray-700">
                          
                          <MenuLink to="/orders" icon={<Package size={18} strokeWidth={2} />} title={t('My Orders')} />
                          <div className="h-[1px] w-[calc(100%-4.5rem)] ml-auto bg-gray-200/60 dark:bg-gray-700/60 mr-4"></div>
                          
                          <MenuLink to="/edit-address" icon={<MapPin size={18} strokeWidth={2} />} title={t('My Address')} />
                          <div className="h-[1px] w-[calc(100%-4.5rem)] ml-auto bg-gray-200/60 dark:bg-gray-700/60 mr-4"></div>

                          <MenuLink to="/saved-products" icon={<Heart size={18} strokeWidth={2} />} title={t('Saved Products')} />
                          <div className="h-[1px] w-[calc(100%-4.5rem)] ml-auto bg-gray-200/60 dark:bg-gray-700/60 mr-4"></div>

                          <MenuLink to="/services" icon={<Wrench size={18} strokeWidth={2} />} title={t('Services')} />
                          <div className="h-[1px] w-[calc(100%-4.5rem)] ml-auto bg-gray-200/60 dark:bg-gray-700/60 mr-4"></div>

                          <MenuLink to="/news" icon={<Newspaper size={18} strokeWidth={2} />} title={t('News')} />
                          <div className="h-[1px] w-[calc(100%-4.5rem)] ml-auto bg-gray-200/60 dark:bg-gray-700/60 mr-4"></div>

                          {/* Settings Dropdown/Accordion */}
                          <button 
                              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                              className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-gray-100/50 dark:hover:bg-gray-800 transition-colors group focus:outline-none"
                          >
                              <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                                      <Settings size={18} strokeWidth={2} />
                                  </div>
                                  <span className="text-[15px] font-medium text-gray-900 dark:text-white">
                                      {t('Settings')}
                                  </span>
                              </div>
                              <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isSettingsOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {isSettingsOpen && (
                              <div className="w-full pl-12 pr-4 pb-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                  <button 
                                      onClick={toggleTheme}
                                      className="w-full flex items-center justify-between py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#2E5A2E] dark:hover:text-[#CBF9B2] transition-colors"
                                  >
                                      <span>{theme === 'dark' ? t('Light Mode') : t('Dark Mode')}</span>
                                      <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-[#7CA90E]' : 'bg-gray-300'}`}>
                                          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                                      </div>
                                  </button>
                                  <button 
                                      onClick={() => {
                                          const newLang = language === 'en' ? 'ta' : 'en';
                                          setLanguage(newLang);
                                          localStorage.setItem('language', newLang);
                                      }}
                                      className="w-full flex items-center justify-between py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#2E5A2E] dark:hover:text-[#CBF9B2] transition-colors"
                                  >
                                      <span>{t('Language')}</span>
                                      <span className="text-[11px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                          {language === 'en' ? 'EN' : 'TA'}
                                      </span>
                                  </button>
                              </div>
                          )}
                          
                          {/* Dynamic Roles */}
                          {roles.includes('store_admin') && (
                              <>
                                <div className="h-[1px] w-[calc(100%-4.5rem)] ml-auto bg-gray-200/60 dark:bg-gray-700/60 mr-4"></div>
                                <MenuLink to="/my-store" icon={<Store size={18} strokeWidth={2} />} title={t('My Store')} />
                              </>
                          )}
                          {roles.includes('admin') && (
                              <>
                                <div className="h-[1px] w-[calc(100%-4.5rem)] ml-auto bg-gray-200/60 dark:bg-gray-700/60 mr-4"></div>
                                <MenuLink to="/admin" icon={<Shield size={18} strokeWidth={2} />} title={t('Admin Dashboard')} />
                              </>
                          )}
                          {roles.includes('service_admin') && (
                              <>
                                <div className="h-[1px] w-[calc(100%-4.5rem)] ml-auto bg-gray-200/60 dark:bg-gray-700/60 mr-4"></div>
                                <MenuLink to="/my-service" icon={<Wrench size={18} strokeWidth={2} />} title={t('My Service')} />
                              </>
                          )}
                     </div>
                </div>

                {/* Support Section */}
                <div className="mb-4">
                     <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-4 px-2 tracking-tight">{t('Support')}</h3>
                     <div className="bg-white dark:bg-gray-800/50 rounded-[2rem] p-3 flex flex-col items-center shadow-sm border border-gray-100 dark:border-gray-700">
                          <MenuLink 
                              onClick={() => window.open('https://wa.me/919500171980', '_blank')} 
                              icon={<HelpCircle size={18} strokeWidth={2} />} 
                              title={t('Help Center')} 
                          />
                          <div className="h-[1px] w-[calc(100%-4.5rem)] ml-auto bg-gray-200/60 dark:bg-gray-700/60 mr-4"></div>
                          <MenuLink 
                              onClick={handleLogout} 
                              icon={<LogOut size={18} strokeWidth={2} />} 
                              title={t('Logout')} 
                              isRed={false} // Match mockup design text
                          />
                     </div>
                </div>
            </div>
            </div>

            {/* Floating WhatsApp Button */}
            <button 
                onClick={() => window.open('https://wa.me/919500171980', '_blank')}
                className="fixed bottom-36 right-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all z-[60] animate-in fade-in zoom-in duration-500"
                aria-label="Contact on WhatsApp"
            >
                <svg 
                    viewBox="0 0 24 24" 
                    width="30" 
                    height="30" 
                    fill="currentColor" 
                    className="text-white"
                >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.985c-.002 5.45-4.437 9.884-9.887 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </button>
        </div>
    );
};

export default Profile;
