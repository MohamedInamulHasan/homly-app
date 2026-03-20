import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowUpNarrowWide, ArrowDownWideNarrow, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const SortDropdown = ({ currentSort, onSortChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { t } = useLanguage();

    const sortOptions = [
        { id: 'none', label: 'Default', icon: <ListFilter size={16} /> },
        { id: 'lowToHigh', label: 'Price: Low to High', icon: <ArrowUpNarrowWide size={16} /> },
        { id: 'highToLow', label: 'Price: High to Low', icon: <ArrowDownWideNarrow size={16} /> },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = sortOptions.find(opt => opt.id === currentSort) || sortOptions[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center gap-2 p-3 sm:px-4 sm:py-3 rounded-2xl border-2 transition-all duration-300 shadow-sm active:scale-95 ${isOpen
                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/40 backdrop-blur-md shadow-blue-500/5'
                    : 'border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md'
                    }`}
                title={t(selectedOption.label)}
            >
                <div className={`${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {selectedOption.icon}
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap hidden sm:block">
                    {t(selectedOption.label)}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-300 hidden sm:block ${isOpen ? 'rotate-180 text-blue-500' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl shadow-2xl z-[100] overflow-hidden"
                    >
                        <div className="p-2 space-y-1">
                            {sortOptions.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        onSortChange(option.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${currentSort === option.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
                                        }`}
                                >
                                    <span className={`${currentSort === option.id ? 'text-white' : 'text-gray-400'}`}>
                                        {option.icon}
                                    </span>
                                    {t(option.label)}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SortDropdown;
