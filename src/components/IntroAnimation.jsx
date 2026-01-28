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
        }, 3500); // 3.5s minimum

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
        hidden: { opacity: 0, y: 50 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1, // Stagger effect
                duration: 0.8,
                ease: [0.2, 0.65, 0.3, 0.9], // Custom cubic bezier
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
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="relative flex items-center justify-center">
                        <div className="flex items-center">
                            {/* H */}
                            <motion.span
                                custom={0}
                                initial="hidden"
                                animate="visible"
                                variants={letterVariants}
                                className="text-7xl md:text-9xl font-bold tracking-tighter text-blue-900"
                            >
                                H
                            </motion.span>

                            {/* O */}
                            <motion.span
                                custom={1}
                                initial="hidden"
                                animate="visible"
                                variants={letterVariants}
                                className="text-7xl md:text-9xl font-bold tracking-tighter text-blue-900"
                            >
                                o
                            </motion.span>

                            {/* M L Y */}
                            {['m', 'l', 'y'].map((char, index) => (
                                <motion.span
                                    key={char}
                                    custom={index + 2}
                                    initial="hidden"
                                    animate="visible"
                                    variants={letterVariants}
                                    className="text-7xl md:text-9xl font-bold tracking-tighter text-blue-900"
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default IntroAnimation;
