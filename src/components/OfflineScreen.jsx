import React from 'react';
import { WifiOff, Signal, AlertCircle } from 'lucide-react';

const OfflineScreen = () => {
    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Dark Blurred Backdrop */}
            <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-md animate-fade-in" />

            {/* Premium Connectivity Dialog */}
            <div className="relative bg-white dark:bg-gray-900 w-full max-w-sm rounded-[3rem] shadow-[0_25px_60px_rgba(0,0,0,0.4)] border border-white/10 dark:border-gray-800 p-10 transform animate-bounce-in text-center overflow-hidden">
                
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500" />
                
                {/* Icon Section */}
                <div className="relative mb-10">
                    <div className="w-28 h-28 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto ring-12 ring-red-50/50 dark:ring-red-900/10">
                        <WifiOff className="text-red-500 dark:text-red-400 animate-pulse" size={56} />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 p-2.5 rounded-full shadow-md border border-red-100 dark:border-gray-700">
                        <AlertCircle className="text-red-500" size={24} />
                    </div>
                </div>

                {/* Content */}
                <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                    Lost Connection
                </h1>

                <p className="text-gray-600 dark:text-gray-400 mb-10 leading-relaxed font-medium">
                    Oops! Your internet seems to have taken a break. Please check your network settings.
                </p>

                {/* Connection Status Indicator */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-end gap-1.5 h-8">
                        <div className="w-2 h-3 bg-gray-200 dark:bg-gray-800 rounded-full animate-bar-1" />
                        <div className="w-2 h-5 bg-gray-200 dark:bg-gray-800 rounded-full animate-bar-2" />
                        <div className="w-2 h-7 bg-gray-200 dark:bg-gray-800 rounded-full animate-bar-3" />
                        <div className="w-2 h-10 bg-gray-200 dark:bg-gray-800 rounded-full animate-bar-4" />
                    </div>
                    
                    <div className="flex items-center gap-2 px-6 py-2.5 bg-red-50 dark:bg-red-900/20 rounded-full border border-red-100 dark:border-red-900/30">
                        <div className="flex gap-1.5">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                        </div>
                        <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-[0.3em]">
                            Waiting for Signal
                        </p>
                    </div>
                </div>

                <p className="mt-12 text-[10px] text-gray-400 dark:text-gray-600 font-bold uppercase tracking-widest">
                    Automatically Reconnecting
                </p>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes bounce-in {
                    0% { opacity: 0; transform: scale(0.3) translateY(100px); }
                    70% { transform: scale(1.05) translateY(-10px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes bar-glow {
                    0%, 100% { background-color: #E5E7EB; transform: scaleY(1); }
                    50% { background-color: #EF4444; transform: scaleY(1.2); }
                }
                .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
                .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
                .animate-bar-1 { animation: bar-glow 1.5s infinite ease-in-out; }
                .animate-bar-2 { animation: bar-glow 1.5s infinite ease-in-out 0.2s; }
                .animate-bar-3 { animation: bar-glow 1.5s infinite ease-in-out 0.4s; }
                .animate-bar-4 { animation: bar-glow 1.5s infinite ease-in-out 0.6s; }
            `}</style>
        </div>
    );
};

export default OfflineScreen;
