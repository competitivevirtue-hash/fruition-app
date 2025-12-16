import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Share2, Award, Zap, DollarSign, Heart, Hash } from 'lucide-react';
import { useFruit } from '../context/FruitContext';
import { useAuth } from '../context/AuthContext';

const SLIDES = [
    { id: 'intro', bg: 'linear-gradient(135deg, #FF6B6B, #845EC2)' },
    { id: 'count', bg: 'linear-gradient(135deg, #FF9671, #FFC75F)' },
    { id: 'health', bg: 'linear-gradient(135deg, #00C9A7, #845EC2)' },
    { id: 'spend', bg: 'linear-gradient(135deg, #4D8076, #FFC75F)' }, // Money Green/Gold
    { id: 'top', bg: 'linear-gradient(135deg, #D65DB1, #845EC2)' },
    { id: 'summary', bg: 'linear-gradient(135deg, #2C3E50, #000000)' }
];

const YearInFruit = ({ isOpen, onClose }) => {
    const { getStats } = useFruit();
    const { userProfile } = useAuth();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadStats();
        } else {
            setCurrentSlide(0); // Reset on close
        }
    }, [isOpen]);

    const loadStats = async () => {
        setLoading(true);
        // Safety timeout
        const timer = setTimeout(() => {
            if (loading) setLoading(false);
        }, 8000);

        try {
            const data = await getStats();
            // Clear timeout if successful
            clearTimeout(timer);

            const consumed = data.consumed || [];

            // Aggregation
            const totalItems = consumed.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
            const totalCalories = consumed.reduce((acc, item) => acc + (Number(item.calories) || 0), 0);
            const totalSpend = consumed.reduce((acc, item) => acc + (Number(item.valueConsumed) || 0), 0);

            // Calculate Top Fruit
            const fruitCounts = {};
            consumed.forEach(item => {
                const name = item.fruitName || 'Unknown';
                fruitCounts[name] = (fruitCounts[name] || 0) + (Number(item.amount) || 0);
            });

            // Find max
            let topFruitName = 'None';
            let topFruitCount = 0;
            Object.entries(fruitCounts).forEach(([name, count]) => {
                if (count > topFruitCount) {
                    topFruitCount = count;
                    topFruitName = name;
                }
            });

            // Unique varieties
            const uniqueFruits = Object.keys(fruitCounts).length;

            setStats({
                totalItems,
                totalCalories,
                totalSpend,
                topFruitName,
                topFruitCount,
                uniqueFruits: uniqueFruits, // Correction: was 'fruits' global var
                sampleData: consumed.length > 0 // Flag if we have data
            });
        } catch (error) {
            console.error("YearInFruit Error:", error);
            // Even on error, we stop loading so user isn't stuck
        } finally {
            setLoading(false);
        }
    };

    const nextSlide = (e) => {
        e.stopPropagation();
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(curr => curr + 1);
        } else {
            // Loop or maybe close? Let's just stay on summary
        }
    };

    // Keyboard nav
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            if (e.key === 'ArrowRight' || e.key === 'Space') {
                if (currentSlide < SLIDES.length - 1) setCurrentSlide(curr => curr + 1);
            }
            if (e.key === 'ArrowLeft') {
                if (currentSlide > 0) setCurrentSlide(curr => curr - 1);
            }
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentSlide]);

    if (!isOpen) return null;

    if (loading) {
        return (
            <div className="modal-overlay" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)', zIndex: 9999 }}>
                <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '1rem' }}>Crunching the numbers...</div>
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    style={{
                        padding: '8px 16px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)',
                        border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.9rem'
                    }}
                >
                    Cancel
                </button>
            </div>
        );
    }

    const currentBg = SLIDES[currentSlide].bg;

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 3000,
                background: '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
        >
            <motion.div
                key={currentSlide} // Key change triggers animation
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                onClick={nextSlide}
                style={{
                    width: '100%', height: '100%',
                    maxWidth: '450px', maxHeight: '800px', // Phone-like ratio
                    background: currentBg,
                    position: 'relative',
                    display: 'flex', flexDirection: 'column',
                    padding: '2rem',
                    cursor: 'pointer',
                    borderRadius: '0px' // Full screen feel or card? Let's do huge card
                }}
            >
                {/* Progress Bar */}
                <div style={{ display: 'flex', gap: '4px', position: 'absolute', top: '20px', left: '20px', right: '20px' }}>
                    {SLIDES.map((_, idx) => (
                        <div key={idx} style={{
                            flex: 1, height: '4px', borderRadius: '4px',
                            background: idx <= currentSlide ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)'
                        }} />
                    ))}
                </div>

                {/* Close Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    style={{ position: 'absolute', top: '40px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', zIndex: 10 }}
                >
                    <X size={32} />
                </button>

                {/* CONTENT PER SLIDE */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: 'white' }}>

                    {SLIDES[currentSlide].id === 'intro' && (
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                            <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '10px' }}>YOUR 2025</h1>
                            <h2 style={{ fontSize: '2rem', fontWeight: 300 }}>IN FRUIT</h2>
                            <p style={{ marginTop: '2rem', fontSize: '1.2rem', opacity: 0.8 }}>Ready to see your stats?</p>
                            <div style={{ marginTop: 'auto', paddingTop: '3rem', fontSize: '0.9rem', opacity: 0.6 }}>Tap to continue</div>
                        </motion.div>
                    )}

                    {SLIDES[currentSlide].id === 'count' && (
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '20px' }}>You consumed</div>
                            <div style={{ fontSize: '6rem', fontWeight: 900, lineHeight: 1 }}>{stats.totalItems}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, marginTop: '10px' }}>Pieces of Fruit</div>
                            <p style={{ marginTop: '2rem', opacity: 0.8 }}>That's vitamin power!</p>
                        </motion.div>
                    )}

                    {SLIDES[currentSlide].id === 'health' && (
                        <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                            <Heart size={64} style={{ marginBottom: '20px' }} />
                            <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Total Energy</div>
                            <div style={{ fontSize: '5rem', fontWeight: 900 }}>{stats.totalCalories.toLocaleString()}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 400 }}>Calories</div>
                            <p style={{ marginTop: '2rem', maxWidth: '80%' }}>Think of all the energy you gave your body.</p>
                        </motion.div>
                    )}

                    {SLIDES[currentSlide].id === 'spend' && (
                        <motion.div initial={{ rotate: -10, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
                            <DollarSign size={64} style={{ marginBottom: '20px' }} />
                            <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Estimated Value</div>
                            <div style={{ fontSize: '5rem', fontWeight: 900 }}>${stats.totalSpend.toFixed(2)}</div>
                            <p style={{ marginTop: '2rem' }}>Invested in your health.</p>
                        </motion.div>
                    )}

                    {SLIDES[currentSlide].id === 'top' && (
                        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Your Top Fruit</div>
                            <div style={{ fontSize: '4rem', fontWeight: 900, color: '#fff', textShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
                                {stats.topFruitName}
                            </div>
                            <div style={{ fontSize: '2rem', marginTop: '10px', opacity: 0.9 }}>
                                {stats.topFruitCount} times
                            </div>
                            <Award size={80} style={{ marginTop: '2rem', opacity: 0.8 }} />
                        </motion.div>
                    )}

                    {SLIDES[currentSlide].id === 'summary' && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ width: '100%' }}
                        >
                            <div style={{
                                background: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                                padding: '2rem',
                                borderRadius: '20px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
                            }}>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 900 }}>THE RECAP</h2>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>TOTAL FRUIT</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalItems}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>CALORIES</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalCalories.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>TOP PICK</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.topFruitName}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>DIVERSITY</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.uniqueFruits} types</div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.8 }}>
                                    Member #{userProfile?.memberId || '?'} • Fruitopia 2025
                                </div>
                            </div>

                            <button style={{
                                marginTop: '2rem',
                                width: '100%',
                                padding: '16px',
                                borderRadius: '30px',
                                border: 'none',
                                background: 'white',
                                color: 'black',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                cursor: 'pointer'
                            }}>
                                <Share2 size={20} /> Share
                            </button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default YearInFruit;
