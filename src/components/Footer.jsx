import { ShoppingBag, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
    const { t } = useLanguage();
    return (
        <footer className="bg-black pt-20 pb-10 transition-colors duration-200 relative overflow-hidden">
            {/* Subtle light accent background */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#CBF9B2]/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-3 mb-8 group">
                            <div className="bg-[#CBF9B2] text-black p-2.5 rounded-2xl group-hover:rotate-6 transition-transform duration-500 shadow-lg shadow-[#000]/20">
                                <ShoppingBag size={26} strokeWidth={2.5} />
                            </div>
                            <span className="text-[26px] font-black tracking-tight text-white uppercase">
                                Homly
                            </span>
                        </Link>
                        <p className="text-gray-300 leading-relaxed mb-8 text-[15px] font-medium max-w-sm">
                            {t('Ilayangudi\'s premiere destination for groceries, fashion, and lifestyle. Premium quality at your doorstep.')}
                        </p>
                        <div className="flex gap-4">
                            {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                                <a
                                    key={social}
                                    href={`#${social}`}
                                    className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#CBF9B2] hover:text-black hover:border-transparent transition-all duration-500 group"
                                >
                                    <span className="sr-only">{social}</span>
                                    <div className="w-5 h-5 bg-current rounded-[4px] group-hover:scale-110 transition-transform" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-white text-lg mb-8 tracking-wide uppercase">{t('Experience')}</h3>
                        <ul className="space-y-4">
                            {['Home', 'Shop', 'Store', 'Orders'].map((item) => (
                                <li key={item}>
                                    <Link 
                                        to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} 
                                        className="text-gray-400 hover:text-[#CBF9B2] transition-colors flex items-center gap-3 group text-[15px] font-medium"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#CBF9B2] group-hover:scale-125 transition-all" />
                                        {t(item)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-white text-lg mb-8 tracking-wide uppercase">{t('Support')}</h3>
                        <ul className="space-y-4">
                            {['Help Center', 'Privacy Policy', 'Terms of Service', 'Refund Policy'].map((item) => (
                                <li key={item}>
                                    <Link 
                                        to="/" 
                                        className="text-gray-400 hover:text-[#CBF9B2] transition-colors flex items-center gap-3 group text-[15px] font-medium"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#CBF9B2] group-hover:scale-125 transition-all" />
                                        {t(item)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-white text-lg mb-8 tracking-wide uppercase">{t('Contact')}</h3>
                        <ul className="space-y-5">
                            <li className="flex items-start gap-4 text-gray-400 text-[15px]">
                                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 shrink-0">
                                    <MapPin className="w-5 h-5 text-[#CBF9B2]" />
                                </div>
                                <span className="pt-0.5 leading-snug">Main Road, Ilayangudi – 630 702<br/>Sivagangai District, TN</span>
                            </li>
                            <li className="flex items-center gap-4 text-gray-400 text-[15px]">
                                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 shrink-0">
                                    <Phone className="w-5 h-5 text-[#CBF9B2]" />
                                </div>
                                <span>+91 98XXX XXXXX</span>
                            </li>
                            <li className="flex items-center gap-4 text-gray-400 text-[15px]">
                                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 shrink-0">
                                    <Mail className="w-5 h-5 text-[#CBF9B2]" />
                                </div>
                                <span>hello@homly.shop</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-gray-500 text-sm font-medium flex items-center gap-2">
                        <span>© {new Date().getFullYear()} Homly.</span>
                        <span className="h-1 w-1 bg-gray-600 rounded-full"></span>
                        <span>{t('Experience Better')}</span>
                    </div>
                    <div className="flex gap-8">
                        <Link to="/" className="text-[13px] font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors">{t('Terms')}</Link>
                        <Link to="/" className="text-[13px] font-bold text-gray-500 hover:text-white uppercase tracking-wider transition-colors">{t('Privacy')}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
