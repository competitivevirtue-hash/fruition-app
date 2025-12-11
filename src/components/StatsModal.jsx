import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Award, PieChart, AlertTriangle, Users, Activity } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useFruit } from '../context/FruitContext.jsx';
import { getFruitImage, FRUIT_INTELLIGENCE, BENEFIT_MAP } from '../utils/fruitUtils';
import './BioModal.css';

const StatsModal = ({ isOpen, onClose }) => {
    const { getStats } = useFruit();
    const [stats, setStats] = useState({ consumed: [], wasted: [] });
    const [globalCount, setGlobalCount] = useState(12405); // Default fallback
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            getStats().then(data => {
                setStats(data);
                setLoading(false);
            });

            // Listen to real-time global stats
            const unsub = onSnapshot(doc(db, 'system', 'stats'), (doc) => {
                if (doc.exists()) {
                    setGlobalCount(doc.data().totalUsers || 12405);
                }
            });

            return () => unsub();
        }
    }, [isOpen]);

    // Calculations
    const totalConsumed = stats.consumed.reduce((acc, curr) => acc + (curr.amount || 1), 0);
    const totalWasted = stats.wasted.reduce((acc, curr) => acc + (curr.amount || 1), 0);
    const totalProcessed = totalConsumed + totalWasted;

    // Avoid division by zero
    const efficiency = totalProcessed > 0 ? Math.round((totalConsumed / totalProcessed) * 100) : 100;

    // Top Fruits Logic (Normalized)
    const fruitCounts = {};
    const toTitleCase = (str) => {
        return str.toLowerCase().replace(/(?:^|\s)\w/g, match => match.toUpperCase());
    };

    stats.consumed.forEach(item => {
        const normalizedName = toTitleCase((item.fruitName || 'Unknown').trim());
        fruitCounts[normalizedName] = (fruitCounts[normalizedName] || 0) + (item.amount || 1);
    });
    const topFruits = Object.entries(fruitCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

    // Bio-Impact Logic
    const bioStats = {};
    stats.consumed.forEach(item => {
        const lowerName = item.fruitName.toLowerCase();
        const key = Object.keys(FRUIT_INTELLIGENCE).find(k => lowerName.includes(k));
        const info = FRUIT_INTELLIGENCE[key];
        if (info) {
            info.benefits.forEach(b => {
                bioStats[b] = (bioStats[b] || 0) + (item.amount || 1);
            });
        }
    });

    // Sort bio stats
    const sortedBioStats = Object.entries(bioStats)
        .sort(([, a], [, b]) => b - a)
        .map(([key, count]) => ({ ...BENEFIT_MAP[key], key, count }));

    // Badges Logic
    const badges = [
        {
            id: 'eco',
            name: 'Eco Warrior',
            desc: 'maintained > 90% efficiency',
            icon: '🌍',
            unlocked: totalProcessed > 10 && efficiency > 90,
            color: '#10b981'
        },
        {
            id: 'ninja',
            name: 'Fruit Ninja',
            desc: 'Consumed over 50 fruits',
            icon: '🥷',
            unlocked: totalConsumed >= 50,
            color: '#f59e0b'
        },
        {
            id: 'starter',
            name: 'Fresh Start',
            desc: 'Logged your first fruit',
            icon: '🌱',
            unlocked: totalConsumed > 0,
            color: '#3b82f6'
        }
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="modal-content glass-panel"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        maxWidth: '600px',
                        height: 'auto',
                        maxHeight: '85vh',
                        background: 'var(--color-surface)',
                        display: 'flex', flexDirection: 'column'
                    }}
                >
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>

                    <div style={{ padding: '0 2rem 2rem 2rem', overflowY: 'auto' }}>
                        <div style={{ paddingTop: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
                            <h2 className="text-gradient" style={{ fontSize: '2rem', margin: 0 }}>Historical Intelligence Report</h2>
                            <p style={{ color: 'var(--color-text-muted)' }}>Intelligent insights since you joined.</p>
                        </div>

                        {loading ? (
                            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Calculating stats...</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                                {/* Efficiency Chart */}
                                <div className="stat-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <TrendingUp size={20} color="var(--color-secondary)" /> Efficiency Score
                                        </h3>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: efficiency > 80 ? '#10b981' : '#f59e0b' }}>
                                            {efficiency}%
                                        </span>
                                    </div>

                                    {/* Visual Bar */}
                                    <div style={{ height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden', display: 'flex' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${efficiency}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            style={{ background: 'linear-gradient(90deg, #10b981, #34d399)', height: '100%' }}
                                        />
                                        <div style={{ flex: 1, background: '#ef4444' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>
                                        <span>{totalConsumed} Eaten</span>
                                        <span>{totalWasted} Wasted</span>
                                    </div>
                                </div>

                                {/* Top Fruits */}
                                {topFruits.length > 0 && (
                                    <div className="stat-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <PieChart size={20} color="#3b82f6" /> Top Favorites
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {topFruits.map(([name, count], index) => (
                                                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden' }}>
                                                        <img src={getFruitImage(name)} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                            <span style={{ fontWeight: 500 }}>{name}</span>
                                                            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{count}</span>
                                                        </div>
                                                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(count / topFruits[0][1]) * 100}%` }}
                                                                style={{ height: '100%', borderRadius: '3px', background: 'var(--color-primary)' }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Bio-Impact Analysis */}
                                {sortedBioStats.length > 0 && (
                                    <div className="stat-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Activity size={20} color="#10b981" /> Bio-Impact Analysis
                                        </h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {sortedBioStats.map((stat, index) => (
                                                <div key={stat.key} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{
                                                        width: '32px', height: '32px', borderRadius: '8px',
                                                        background: `${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: stat.color
                                                    }}>
                                                        <stat.icon size={16} />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{stat.label}</span>
                                                            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{stat.count} points</span>
                                                        </div>
                                                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(stat.count / sortedBioStats[0].count) * 100}%` }}
                                                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                                                style={{ height: '100%', borderRadius: '3px', background: stat.color }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Badges */}
                                <div className="stat-card" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Award size={20} color="#f59e0b" /> Achievements
                                    </h3>
                                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                        {badges.map(badge => (
                                            <div key={badge.id} style={{
                                                minWidth: '100px',
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                background: badge.unlocked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                                                border: badge.unlocked ? `1px solid ${badge.color}` : '1px solid rgba(255,255,255,0.05)',
                                                textAlign: 'center',
                                                opacity: badge.unlocked ? 1 : 0.5,
                                                filter: badge.unlocked ? 'none' : 'grayscale(100%)'
                                            }}>
                                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{badge.icon}</div>
                                                <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.25rem' }}>{badge.name}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{badge.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Community Pulse */}
                                <div style={{
                                    marginTop: '2rem', padding: '1.5rem',
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                                    borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem'
                                }}>
                                    <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '50%', color: '#60A5FA' }}>
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', lineHeight: 1 }}>{globalCount.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Global Fruition Community</div>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default StatsModal;
