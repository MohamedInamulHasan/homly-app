import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { Package } from 'lucide-react';

const IntroAnimation = () => {
    const { setInitialLoading, loading } = useData();
    const [isVisible, setIsVisible] = useState(true);

    // Data ready check including Ads and Services
    const isDataReady =
        !loading.products &&
        !loading.stores &&
        !loading.news &&
        !loading.categories &&
        !loading.ads &&
        !loading.services;

    useEffect(() => {
        // Minimum animation time to let the "ripple" play a bit
        const minTime = setTimeout(() => {
            if (isDataReady) {
                setIsVisible(false);
            }
        }, 2500); // 2.5s minimum for faster entry

        return () => clearTimeout(minTime);
    }, [isDataReady]);

    // Check data readiness periodically
    useEffect(() => {
        if (!isVisible) {
            setTimeout(() => {
                if (setInitialLoading) setInitialLoading(false);
            }, 600); // Wait for exit animation
        }
    }, [isVisible, setInitialLoading]);

    // Force exit backup
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isDataReady) setIsVisible(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, [isDataReady]);

    // Animation Variants
    const letterVariants = {
        hidden: { opacity: 0 },
        visible: (i) => ({
            opacity: 1,
            transition: {
                delay: i * 0.05, // Faster stagger
                duration: 1,
                ease: "easeOut",
            },
        }),
    };

    const boxVariants = {
        hidden: { scale: 0, opacity: 0, rotate: -180 },
        visible: {
            scale: 1,
            opacity: 1,
            rotate: 0,
            transition: {
                delay: 0.5, // Start after letters begin
                type: "spring",
                stiffness: 260,
                damping: 20,
            },
        },
    };

    const rippleVariants = {
        animate: {
            scale: [1, 2.5],
            opacity: [0.6, 0],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
            },
        },
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    // Background: Clean Gradient
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2E5A2E] dark:bg-[#1a381a] overflow-hidden"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="relative flex flex-col items-center justify-center gap-4">
                        {/* Main brand name with separate groups for word spacing */}
                        <div className="flex flex-wrap items-center justify-center gap-x-6">
                            {/* ILY Group */}
                            <div className="flex items-center">
                                {['I', 'L', 'Y'].map((char, index) => (
                                    <motion.span
                                        key={index}
                                        custom={index}
                                        initial="hidden"
                                        animate="visible"
                                        variants={letterVariants}
                                        className="inline-block text-7xl md:text-9xl font-bold tracking-tighter px-[1px] text-white"
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                            </div>

                            {/* mart Group */}
                            <div className="flex items-center">
                                {['m', 'a', 'r', 't'].map((char, index) => (
                                    <motion.span
                                        key={index}
                                        custom={index + 3}
                                        initial="hidden"
                                        animate="visible"
                                        variants={letterVariants}
                                        className="inline-block text-7xl md:text-9xl font-bold tracking-tighter px-[1px] text-white"
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                            </div>
                        </div>

                        {/* Subtle tagline with extra spacing */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 1 }}
                            className="text-sm md:text-base font-medium text-white/80 uppercase mt-4 tracking-[0.2em]"
                        >
                            Experience Premium
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default IntroAnimation;
