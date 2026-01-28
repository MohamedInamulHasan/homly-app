import { AlertTriangle } from 'lucide-react';

const MaintenanceScreen = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-700 transform transition-all hover:scale-[1.02]">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <AlertTriangle className="text-red-500 dark:text-red-400" size={40} />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Currently Not Taking Orders
                </h1>

                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    We are currently performing system maintenance or are not accepting orders at this time. Please check back later!
                </p>

                <div className="space-y-3">
                    <div className="h-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 w-1/3 animate-[loading_2s_ease-in-out_infinite]"></div>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">
                        System Maintenance
                    </p>
                </div>
            </div>

            <p className="mt-8 text-sm text-gray-400 dark:text-gray-600">
                &copy; {new Date().getFullYear()} Homly. All rights reserved.
            </p>

            <style jsx>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
            `}</style>
        </div>
    );
};

export default MaintenanceScreen;
