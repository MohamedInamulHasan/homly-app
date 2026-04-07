import { useState, useContext, useEffect } from 'react';
import { 
    User, Package, Settings, ChevronRight, LogOut, 
    Shield, Wrench, Store, ArrowLeft, MoreHorizontal, 
    MapPin, Lock, HelpCircle, Pencil, Languages, Heart,
    ChevronDown
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AuthContext from '../context/AuthContext';
import { useUserProfile } from '../hooks/queries/useUsers';
import { useData } from '../context/DataContext';

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

    const { data: userProfile } = useUserProfile();
    
    const user = userProfile?.data || authUser;
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        setIsFooterHidden(showLogoutModal);
        return () => setIsFooterHidden(false);
    }, [showLogoutModal, setIsFooterHidden]);

    const handleLogout = () => setShowLogoutModal(true);
    const confirmLogout = () => { logout(); navigate('/login'); };

    const roles = user ? (Array.isArray(user.role) ? user.role : [user.role || 'customer']) : [];

    return (
        <div className="min-h-screen bg-[#E8EAEF] dark:bg-gray-900 transition-colors duration-200 mx-auto max-w-md w-full relative pb-48">
            
            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                            <LogOut size={32} className="text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">{t('Sign Out')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">{t('Are you sure you want to sign out?')}</p>
                        <div className="flex gap-4 w-full">
                            <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-bold transition-colors">
                                {t('Cancel')}
                            </button>
                            <button onClick={confirmLogout} className="flex-1 py-3.5 bg-red-600 text-white rounded-full font-bold shadow-md shadow-red-500/20 hover:bg-red-700 transition-colors">
                                {t('Sign Out')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Light Green Header Card */}
            <div className="w-full bg-[#CBF9B2] rounded-b-[2.5rem] px-4 pt-6 pb-6 shadow-sm relative overflow-hidden mb-8">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10">
                    <div className="max-w-2xl mx-auto px-2 flex items-center justify-between">
                        <button onClick={() => navigate(-1)} className="w-[42px] h-[42px] flex items-center justify-center bg-white rounded-full text-gray-900 transition-transform active:scale-95 shadow-sm border border-gray-100/50">
                            <ArrowLeft size={22} />
                        </button>
                        <div className="flex flex-col text-center">
                            <h1 className="text-[18px] font-bold text-gray-900 tracking-tight">{t('Profile')}</h1>
                            <p className="text-[#2E5A2E] text-[13px] font-medium mt-0.5">{t('Manage your account')}</p>
                        </div>
                        <button className="w-[42px] h-[42px] flex items-center justify-center bg-white rounded-full text-gray-900 transition-transform active:scale-95 shadow-sm border border-gray-100/50">
                            <MoreHorizontal size={22} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-5">
                {/* Profile Widget */}
                <div className="bg-white dark:bg-gray-800/80 rounded-[2.5rem] p-4 flex items-center justify-between mb-8 shadow-sm border border-gray-100 dark:border-gray-700">
                     <div className="flex items-center gap-4">
                          <div className="w-[60px] h-[60px] bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
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
                          <div>
                               <h2 className="text-[16px] font-bold text-gray-900 dark:text-white leading-tight">
                                   {user?.name || 'Guest User'}
                               </h2>
                               <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                                   {user?.email || 'Not logged in'}
                               </p>
                          </div>
                     </div>
                </div>

                {/* Account Section */}
                <div className="mb-6">
                     <h3 className="text-[16px] font-bold text-gray-900 dark:text-white mb-4 px-2 tracking-tight">{t('Account')}</h3>
                     <div className="bg-white dark:bg-gray-800/50 rounded-[2rem] p-3 flex flex-col items-center shadow-sm border border-gray-100 dark:border-gray-700">
                          
                          <MenuLink to="/orders" icon={<Package size={18} strokeWidth={2} />} title={t('My Orders')} />
                          <div className="h-[1px] w-[calc(100%-4.5rem)] ml-auto bg-gray-200/60 dark:bg-gray-700/60 mr-4"></div>
                          
                          <MenuLink to="/saved-products" icon={<Heart size={18} strokeWidth={2} />} title={t('Saved Products')} />
                          <div className="h-[1px] w-[calc(100%-4.5rem)] ml-auto bg-gray-200/60 dark:bg-gray-700/60 mr-4"></div>

                          <MenuLink to="/services" icon={<Wrench size={18} strokeWidth={2} />} title={t('Services')} />
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
    );
};

export default Profile;
