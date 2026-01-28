import { ShoppingBag, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
    const { t } = useLanguage();
    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-16 pb-8 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-6 group">
                            <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <ShoppingBag size={24} />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-600">
                                ShopEase
                            </span>
                        </Link>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                            {t('Your one-stop destination for premium shopping. Quality products, fast delivery, and exceptional service.')}
                        </p>
                        <div className="flex gap-4">
                            {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                                <a
                                    key={social}
                                    href={`#${social}`}
                                    className="h-10 w-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300"
                                >
                                    <span className="sr-only">{social}</span>
                                    <div className="w-5 h-5 bg-current rounded-sm" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-6">{t('Quick Links')}</h3>
                        <ul className="space-y-4">
                            {['Home', 'Shop', 'About Us', 'Contact', 'Cart', 'Checkout', 'Orders'].map((item) => (
                                <li key={item}>
                                    <Link to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-colors" />
                                        {t(item)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-6">{t('Customer Service')}</h3>
                        <ul className="space-y-4">
                            {['FAQ', 'Shipping Policy', 'Returns & Refunds', 'Privacy Policy'].map((item) => (
                                <li key={item}>
                                    <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-colors" />
                                        {t(item)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-6">{t('Contact Us')}</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-500 dark:text-gray-400">
                                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                                <span>123 Commerce St, Business City, NY 10012</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                <span>support@shopease.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center md:text-left">
                        © {new Date().getFullYear()} ShopEase. {t('All rights reserved')}.
                    </p>
                    <div className="flex gap-6">
                        <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('Terms')}</Link>
                        <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('Privacy')}</Link>
                        <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t('Cookies')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
