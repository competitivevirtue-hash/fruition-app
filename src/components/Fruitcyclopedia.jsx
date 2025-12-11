import React, { useState } from 'react';
import { fruits } from '../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import FruitCard from './FruitCard';
import { Palette, Zap, Droplet, Heart, Shield, Activity, Search, Sparkles, BookOpen } from 'lucide-react';
import { getRandomFruitFact, getSmartSearchFact } from '../utils/aiService';
import { getFruitImage } from '../utils/fruitUtils';

const Fruitcyclopedia = ({ onFruitSelect }) => {
    const [filterMode, setFilterMode] = useState('all'); // 'all', 'color', 'benefit'
    const [searchQuery, setSearchQuery] = useState('');
    const [isAiMode, setIsAiMode] = useState(false);
    const [aiFact, setAiFact] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    // Helper to get color category
    const getColorCategory = (fruit) => {
        // Mock logic - in real app would use db tags
        const name = fruit.name.toLowerCase();
        if (['apple', 'cherry', 'strawberry', 'raspberry', 'pomegranate'].some(n => name.includes(n))) return 'Red';
        if (['banana', 'lemon', 'pineapple', 'mango'].some(n => name.includes(n))) return 'Yellow';
        if (['orange', 'peach', 'papaya', 'apricot', 'cantaloupe'].some(n => name.includes(n))) return 'Orange';
        if (['lime', 'kiwi', 'pear', 'grape', 'avocado'].some(n => name.includes(n))) return 'Green';
        if (['blueberry', 'plum', 'grape', 'eggplant'].some(n => name.includes(n))) return 'Blue/Purple';
        return 'Other';
    };

    // Helper to get benefit category (Mock)
    const getBenefitCategory = (fruit) => {
        const id = fruit.id % 4;
        if (id === 0) return 'Energy Boosters';
        if (id === 1) return 'Immunity Defenders';
        if (id === 2) return 'Heart Health';
        return 'Digestion & Gut';
    };

    const handleRandomDiscovery = async () => {
        setAiLoading(true);
        setAiFact(null);
        try {
            const fact = await getRandomFruitFact();
            setAiFact(fact);
        } catch (error) {
            console.error("AI Error", error);
        } finally {
            setAiLoading(false);
        }
    };

    const sections = (() => {
        // Filter fruits first based on search query
        const filteredFruits = fruits.filter(f =>
            f.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filterMode === 'color') {
            const groups = {};
            filteredFruits.forEach(f => {
                const cat = getColorCategory(f);
                if (!groups[cat]) groups[cat] = [];
                groups[cat].push(f);
            });
            return Object.entries(groups).map(([title, items]) => ({ title, items, icon: Palette }));
        }
        if (filterMode === 'benefit') {
            const groups = {};
            filteredFruits.forEach(f => {
                const cat = getBenefitCategory(f);
                if (!groups[cat]) groups[cat] = [];
                groups[cat].push(f);
            });
            return Object.entries(groups).map(([title, items]) => {
                let icon = Activity;
                if (title.includes('Energy')) icon = Zap;
                if (title.includes('Immunity')) icon = Shield;
                if (title.includes('Heart')) icon = Heart;
                if (title.includes('Digestion')) icon = Droplet;
                return { title, items, icon };
            });
        }
        return [{ title: 'All Fruits', items: filteredFruits, icon: null }];
    })();

    return (
        <div style={{ padding: '2rem', paddingTop: '6rem', paddingBottom: '6rem' }}>

            {/* Header & Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', margin: 0 }}>Fruitcyclopedia</h1>

                <div className="glass-panel" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', borderRadius: '12px', alignItems: 'center' }}>
                    <button
                        onClick={() => setIsAiMode(!isAiMode)}
                        style={{
                            padding: '0.5rem 1rem',
                            border: 'none',
                            background: isAiMode ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' : 'rgba(255,255,255,0.05)',
                            color: isAiMode ? 'white' : 'var(--color-text-muted)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s',
                            boxShadow: isAiMode ? '0 4px 12px rgba(168, 85, 247, 0.4)' : 'none'
                        }}
                    >
                        <Sparkles size={16} />
                        {isAiMode ? 'AI Mode Active' : 'Enable AI'}
                    </button>
                    {!isAiMode && (
                        <>
                            <div style={{ width: '1px', height: '20px', background: 'var(--color-border)', margin: '0 4px' }} />
                            <button
                                onClick={() => setFilterMode('all')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    border: 'none',
                                    background: filterMode === 'all' ? 'var(--color-primary)' : 'transparent',
                                    color: filterMode === 'all' ? 'white' : 'var(--color-text-muted)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                All
                            </button>
                            {/* Color/Benefit Buttons omitted for brevity when AI is off, or kept. Keeping for standard nav. */}
                        </>
                    )}
                </div>
            </div>

            <AnimatePresence mode='wait'>
                {isAiMode ? (
                    <motion.div
                        key="ai-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', marginTop: '2rem' }}
                    >
                        {/* AI Discovery Card */}
                        <div className="glass-panel" style={{
                            width: '100%', maxWidth: '600px', padding: '2rem',
                            textAlign: 'center', borderRadius: '24px',
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                                <Sparkles className="text-gradient" /> Fruit Intelligence
                            </h2>

                            {!aiFact && !aiLoading && (
                                <div style={{ padding: '2rem 0' }}>
                                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                        Tap into our trusted database of scientific and nutritional facts.
                                        Discover a random fruit and learn something new from government and academic sources.
                                    </p>
                                    <button
                                        onClick={handleRandomDiscovery}
                                        className="btn-primary"
                                        style={{
                                            padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '50px',
                                            background: 'linear-gradient(90deg, #EC4899 0%, #8B5CF6 100%)',
                                            boxShadow: '0 8px 16px rgba(236, 72, 153, 0.3)',
                                            border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '10px', margin: '0 auto'
                                        }}
                                    >
                                        <Sparkles size={20} /> Discover Random Fruit
                                    </button>
                                </div>
                            )}

                            {aiLoading && (
                                <div style={{ padding: '3rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Sparkles size={40} className="text-gradient" />
                                    </motion.div>
                                    <p style={{ color: 'var(--color-text-muted)' }}>Consulting trusted sources...</p>
                                </div>
                            )}

                            {aiFact && !aiLoading && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{ textAlign: 'left', marginTop: '1rem' }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                                        <div style={{ width: '120px', height: '120px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: '10px', marginBottom: '1rem' }}>
                                            <img
                                                src={getFruitImage(aiFact.name)}
                                                alt={aiFact.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                            />
                                        </div>
                                        <h3 style={{ fontSize: '2rem', margin: 0 }}>{aiFact.name}</h3>
                                        <span style={{
                                            background: 'rgba(99, 102, 241, 0.2)', color: '#818CF8',
                                            padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', marginTop: '0.5rem'
                                        }}>
                                            {aiFact.category}
                                        </span>
                                    </div>

                                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid #8B5CF6' }}>
                                        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1rem', fontStyle: 'italic' }}>
                                            "{aiFact.fact}"
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                            <BookOpen size={14} />
                                            <span>Source: <strong>{aiFact.source}</strong></span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleRandomDiscovery}
                                        style={{
                                            marginTop: '2rem', width: '100%', padding: '1rem',
                                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'var(--color-text)', borderRadius: '12px', cursor: 'pointer',
                                            fontWeight: 600
                                        }}
                                    >
                                        Discover Another
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="standard-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Search Input Area */}
                        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                            <div style={{
                                position: 'relative',
                                width: '100%',
                                maxWidth: '600px',
                                zIndex: 10
                            }}>
                                <Search
                                    size={20}
                                    style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--color-text-muted)'
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Search for any fruit..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1rem 1rem 3rem',
                                        fontSize: '1.1rem',
                                        background: 'var(--glass-background)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '16px',
                                        color: 'var(--color-text)',
                                        outline: 'none',
                                        backdropFilter: 'blur(10px)',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            {sections.map(({ title, items, icon: Icon }) => (
                                <section key={title}>
                                    {filterMode !== 'all' && (
                                        <h2 style={{
                                            fontSize: '1.5rem',
                                            marginBottom: '1.5rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            color: 'var(--color-text)'
                                        }}>
                                            {Icon && <div style={{
                                                padding: '8px',
                                                background: 'rgba(255,255,255,0.05)',
                                                borderRadius: '8px',
                                                color: 'var(--color-primary)'
                                            }}><Icon size={24} /></div>}
                                            {title}
                                            <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 'normal', marginLeft: 'auto' }}>
                                                {items.length} items
                                            </span>
                                        </h2>
                                    )}
                                    <motion.div
                                        layout
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                            gap: '1.5rem'
                                        }}
                                    >
                                        <AnimatePresence>
                                            {items.map(fruit => (
                                                <motion.div
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{ duration: 0.2 }}
                                                    key={fruit.id}
                                                >
                                                    <FruitCard
                                                        fruit={fruit}
                                                        onDetails={() => onFruitSelect(fruit)}
                                                        // Hide action buttons in cyclopedia mode
                                                        onConsume={null}
                                                        onDelete={null}
                                                    />
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </motion.div>
                                </section>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Fruitcyclopedia;
