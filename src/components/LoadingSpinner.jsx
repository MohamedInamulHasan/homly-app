const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-12 h-12 border-3',
        lg: 'w-16 h-16 border-4',
    };

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div
                className={`${sizeClasses[size]} border-blue-600 border-t-transparent rounded-full animate-spin`}
            ></div>
            {message && (
                <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
                    {message}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;
