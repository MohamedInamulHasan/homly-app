import React, { useState, useEffect } from 'react';
import { WifiOff, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const ConnectionStatus = () => {
    const { t } = useLanguage();
    const [status, setStatus] = useState('online'); // 'online', 'offline', 'slow'
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const checkConnection = () => {
            if (!navigator.onLine) {
                setStatus('offline');
                setIsVisible(true);
            } else if (navigator.connection) {
                const type = navigator.connection.effectiveType;
                if (type === 'slow-2g' || type === '2g') {
                    setStatus('slow');
                    setIsVisible(true);
                } else {
                    // Connection is good, but if we were previously showing a warning, hide it after a delay
                    if (status !== 'online') {
                        setTimeout(() => {
                            setStatus('online');
                            setIsVisible(false);
                        }, 3000);
                    }
                }
            } else {
                setStatus('online');
                setIsVisible(false);
            }
        };

        window.addEventListener('online', checkConnection);
        window.addEventListener('offline', checkConnection);
        
        if (navigator.connection) {
            navigator.connection.addEventListener('change', checkConnection);
        }

        // Initial check
        checkConnection();

        return () => {
            window.removeEventListener('online', checkConnection);
            window.removeEventListener('offline', checkConnection);
            if (navigator.connection) {
                navigator.connection.removeEventListener('change', checkConnection);
            }
        };
    }, [status]);

    return (
        <AnimatePresence>
            {isVisible && status !== 'online' && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="fixed top-6 left-0 right-0 z-[10001] px-4 pointer-events-none"
                >
                    <div className="max-w-md mx-auto pointer-events-auto">
                        <div className={`
                            relative overflow-hidden rounded-3xl border backdrop-blur-md shadow-2xl p-4 flex items-center gap-4 transition-colors duration-500
                            ${status === 'offline' 
                                ? 'bg-red-600/90 border-red-400 text-white' 
                                : 'bg-amber-500/90 border-amber-300 text-white'}
                        `}>
                            {/* Animated Background Pulse */}
                            <div className="absolute inset-0 bg-white/5 animate-pulse" />

                            <div className="flex-shrink-0 p-2.5 bg-white/20 rounded-2xl shadow-inner relative z-10">
                                {status === 'offline' ? <WifiOff size={22} className="animate-pulse" /> : <AlertTriangle size={22} className="animate-bounce" />}
                            </div>
                            
                            <div className="flex-1 relative z-10">
                                <h3 className="font-black text-sm uppercase tracking-wider">
                                    {status === 'offline' ? t('No Internet Connection') : t('Slow Connection')}
                                </h3>
                                <p className="text-[10px] opacity-80 font-bold uppercase tracking-tight mt-0.5">
                                    {status === 'offline' 
                                        ? t('Please check your network settings.') 
                                        : t('Your connection is slow. Features may be limited.')}
                                </p>
                            </div>

                            <button 
                                onClick={() => setIsVisible(false)}
                                className="relative z-10 p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={18} />
                            </button>

                            {/* Bottom Progress Indicator */}
                            <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-white/40"
                                    animate={{ x: ['-100%', '100%'] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConnectionStatus;
