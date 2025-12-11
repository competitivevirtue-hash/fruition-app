import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, Grape, Banana, Cherry } from 'lucide-react';
import Logo from './Logo';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500); // Wait for exit animation
        }, 2500);

        return () => clearTimeout(timer);
    }, [onComplete]);

    const fruits = [
        { Icon: Apple, color: '#ef4444', delay: 0, x: '20%' },
        { Icon: Grape, color: '#8b5cf6', delay: 0.2, x: '50%' },
        { Icon: Banana, color: '#fbbf24', delay: 0.4, x: '80%' },
        { Icon: Cherry, color: '#ec4899', delay: 0.6, x: '35%' },
    ];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="splash-screen"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="falling-fruits">
                        {fruits.map((fruit, index) => (
                            <motion.div
                                key={index}
                                className="falling-fruit"
                                initial={{ y: -100, opacity: 0 }}
                                animate={{ y: '100vh', opacity: [0, 1, 1, 0] }}
                                transition={{
                                    duration: 2,
                                    delay: fruit.delay,
                                    ease: "easeIn"
                                }}
                                style={{ left: fruit.x, color: fruit.color }}
                            >
                                <fruit.Icon size={48} fill="currentColor" />
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        className="splash-content"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                        <Logo size={120} animated={true} className="mb-4" />
                        <h1 className="splash-title text-gradient" style={{ marginTop: '1rem' }}>Fruition</h1>
                        <motion.p
                            className="splash-subtitle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                        >
                            Nature's Candy, Optimized.
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SplashScreen;
