import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Trophy, Lock, Star, ChevronLeft, Share2, Award, Zap, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BADGES = [
    { id: 'fresh_start', name: 'Fresh Start', description: 'Joined the Fruition family.', icon: <Star size={24} />, color: '#fbbf24' },
    { id: 'fruit_ninja', name: 'Fruit Ninja', description: 'Consumed 100 fruits.', icon: <Zap size={24} />, color: '#f87171' },
    { id: 'eco_warrior', name: 'Eco Warrior', description: 'Saved 10 fruits from going bad.', icon: <Heart size={24} />, color: '#34d399' },
    { id: 'zen_master', name: 'Zen Master', description: 'Logged in for 7 days in a row.', icon: <Award size={24} />, color: '#818cf8' },
    { id: 'variety_king', name: 'Variety King', description: 'Ate 5 different types of fruit in a week.', icon: <Trophy size={24} />, color: '#fbbf24' },
];

const AchievementsPage = () => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [unlockedBadges, setUnlockedBadges] = useState([]);

    useEffect(() => {
        if (userProfile?.achievements) {
            // Normalize achievement structure: could be array of IDs or object
            const achievements = userProfile.achievements;
            if (Array.isArray(achievements)) {
                setUnlockedBadges(achievements);
            } else if (typeof achievements === 'object') {
                setUnlockedBadges(Object.keys(achievements));
            }
        } else {
            // Fallback for demo/dev if no data structure exists yet
            // In real app, this would be empty
            // setUnlockedBadges(['fresh_start']); 
        }
    }, [userProfile]);

    const isUnlocked = (id) => unlockedBadges.includes(id);

    return (
        <div className="achievements-page" style={{
            minHeight: '100vh',
            background: 'var(--color-background)',
            padding: '20px',
            color: 'var(--color-text)',
            paddingBottom: '100px'
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn"
                    style={{ padding: '8px', background: 'var(--glass-background)', borderRadius: '12px', color: 'var(--color-text)' }}
                >
                    <ChevronLeft size={24} />
                </button>
                <div style={{ flex: 1 }}>
                    <h1 className="text-gradient" style={{ margin: 0, fontSize: '1.8rem' }}>Achievements</h1>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        {unlockedBadges.length} / {BADGES.length} Unlocked
                    </p>
                </div>
                <div style={{
                    padding: '8px 16px',
                    background: 'rgba(251, 191, 36, 0.1)',
                    color: '#fbbf24',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <Trophy size={16} /> Rank #{userProfile?.memberId || '-'}
                </div>
            </div>

            {/* Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '1.5rem'
            }}>
                {BADGES.map((badge, index) => {
                    const unlocked = isUnlocked(badge.id);
                    return (
                        <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            style={{
                                background: unlocked
                                    ? `linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`
                                    : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${unlocked ? badge.color : 'rgba(255,255,255,0.05)'}`,
                                borderRadius: '20px',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: unlocked ? `0 0 20px ${badge.color}20` : 'none',
                                opacity: unlocked ? 1 : 0.6,
                                filter: unlocked ? 'none' : 'grayscale(100%)'
                            }}
                        >
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: unlocked ? `${badge.color}20` : 'rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem',
                                color: unlocked ? badge.color : 'var(--color-text-muted)',
                                boxShadow: unlocked ? `0 0 15px ${badge.color}40` : 'none'
                            }}>
                                {unlocked ? badge.icon : <Lock size={24} />}
                            </div>

                            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', fontWeight: 700 }}>{badge.name}</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                                {badge.description}
                            </p>

                            {unlocked && (
                                <div style={{
                                    marginTop: '1rem',
                                    fontSize: '0.7rem',
                                    color: badge.color,
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    UNLOCKED
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Share Section */}
            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <button className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Share2 size={18} /> Share My Trophies
                </button>
            </div>
        </div>
    );
};

export default AchievementsPage;
