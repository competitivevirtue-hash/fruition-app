import React from 'react';
import { motion } from 'framer-motion';
import { Apple, Grape, Banana, Cherry } from 'lucide-react';
import Logo from './Logo';
import './SplashScreen.css'; // Reuse existing styles

const LoadingSplash = () => {
    // Dynamic "Neuro-Text" to reduce anxiety
    const [loadingText, setLoadingText] = React.useState('Initializing system...');
    const loadingMessages = [
        "Aligning bio-rhythms...",
        "Syncing with cloud matrix...",
        "Calibrating fruit sensors...",
        "Optimizing neural pathways...",
        "Preparing your dashboard..."
    ];

    React.useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setLoadingText(loadingMessages[i % loadingMessages.length]);
            i++;
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="splash-screen" style={{ zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {/* Background Texture/Gradient */}
            <div style={{ position: 'absolute', inset: 0, background: 'var(--background-gradient)', zIndex: -1 }} />

            {/* Pulsing Logo (Centered) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{ marginBottom: '2rem' }}
                >
                    <Logo size={140} animated={true} />
                </motion.div>
                <h1 className="splash-title text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Fruition</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.7 }}>
                    Bio-Intelligent Tracking
                </p>
            </div>

            {/* Neuro-Optimized Bottom Loader */}
            <div style={{
                width: '100%',
                padding: '0 2rem 4rem', // Bottom padding
                maxWidth: '500px'
            }}>
                {/* Text removed as per user request */}

                {/* Progress Bar Container */}
                <div style={{
                    width: '100%',
                    height: '6px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {/* Progress Bar Fill */}
                    <motion.div
                        className="progress-fill"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 4.5, ease: "easeInOut" }}
                        style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                            borderRadius: '10px',
                            boxShadow: '0 0 15px var(--color-primary)'
                        }}
                    />

                    {/* "Shine" Effect */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        style={{
                            position: 'absolute',
                            top: 0, bottom: 0,
                            width: '50%',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                            transform: 'skewX(-20deg)'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default LoadingSplash;
