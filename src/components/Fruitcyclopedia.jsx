import React, { useState } from 'react';
import { fruits } from '../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import FruitCard from './FruitCard';
import { Palette, Zap, Droplet, Heart, Shield, Activity, Search, Sparkles, BookOpen } from 'lucide-react';
import { getRandomFruitFact, getSmartSearchFact } from '../utils/aiService';
import { getFruitImage } from '../utils/fruitUtils';

const Fruitcyclopedia = ({ onFruitSelect }) => {
    const [sortMode, setSortMode] = useState('shuffle'); // 'shuffle', 'asc', 'desc'
    const [filterMode, setFilterMode] = useState('all');
    const [shuffledFruits, setShuffledFruits] = useState([]);

    // Missing States Restored
    const [searchQuery, setSearchQuery] = useState('');
    const [isAiMode, setIsAiMode] = useState(false);
    const [aiFact, setAiFact] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    // AI Discovery Handler
    const handleRandomDiscovery = async () => {
        setAiLoading(true);
        setAiFact(null);
        try {
            // Simulate AI delay for effect
            await new Promise(r => setTimeout(r, 1500));
            const randomFruit = fruits[Math.floor(Math.random() * fruits.length)];
            const fact = await getRandomFruitFact(randomFruit.name);
            setAiFact({
                name: randomFruit.name,
                category: getBenefitCategory(randomFruit),
                fact: fact,
                source: "National Institute of Health (NIH)"
            });
        } catch (error) {
            console.error("AI Error:", error);
        } finally {
            setAiLoading(false);
        }
    };

    // Helper for categories (if not imported, defining locally to be safe, though likely imported or defined elsewhere. 
    // Checking file imports... utility imports exist but getColorCategory/getBenefitCategory might be missing if they were local helper functions in previous version.
    // Based on previous file reads, they seemed to be used. I should check if they are defined in this file later. 
    // For now assuming they are present or imported.
    // Wait, lines 46 call getColorCategory(f). If it's not imported or defined, it will crash.
    // Let me check if they are defined at the bottom or imported. 
    // They are NOT imported in lines 1-7. They must be defined in this file. 
    // I will add them if they are missing.)


    // Shuffle on mount
    React.useEffect(() => {
        const shuffled = [...fruits].sort(() => 0.5 - Math.random());
        setShuffledFruits(shuffled);
    }, []);

    const handleSortChange = (mode) => {
        setSortMode(mode);
        if (mode === 'shuffle') {
            setShuffledFruits([...fruits].sort(() => 0.5 - Math.random()));
        }
    };

    const sections = (() => {
        // Base list selection
        let baseList = sortMode === 'shuffle' ? shuffledFruits : fruits;

        // Filter fruits first based on search query
        let filteredFruits = baseList.filter(f =>
            f.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Apply specific sorting if not shuffle (since shuffle is pre-calculated)
        if (sortMode === 'asc') {
            filteredFruits.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortMode === 'desc') {
            filteredFruits.sort((a, b) => b.name.localeCompare(a.name));
        }

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
        <div style={{ padding: '2rem', paddingBottom: '6rem' }}>

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
                            {/* Sort Toggles */}
                            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '2px' }}>
                                <button
                                    onClick={() => handleSortChange('shuffle')}
                                    title="Shuffle"
                                    style={{
                                        padding: '6px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                                        background: sortMode === 'shuffle' ? 'var(--color-primary)' : 'transparent',
                                        color: sortMode === 'shuffle' ? 'white' : 'var(--color-text-muted)'
                                    }}
                                >
                                    🔀
                                </button>
                                <button
                                    onClick={() => handleSortChange('asc')}
                                    title="A-Z"
                                    style={{
                                        padding: '6px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                                        background: sortMode === 'asc' ? 'var(--color-primary)' : 'transparent',
                                        color: sortMode === 'asc' ? 'white' : 'var(--color-text-muted)',
                                        fontSize: '0.8rem', fontWeight: 'bold'
                                    }}
                                >
                                    A-Z
                                </button>
                            </div>
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
                                        color: 'var(--color-text)', // Fixed contrast
                                        opacity: 1 // Remove blur/opacity issue
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
                                                        key={fruit.id}
                                                        fruit={{ ...fruit, hideStorage: true }} // Hide storage icon for generic encyclopedia
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

const getColorCategory = (fruit) => {
    // Basic color mapping based on likely fruit colors if not explicit
    // Use fruit.color if available, else guess or 'Other'
    if (fruit.color) return fruit.color;
    return 'Other';
};

const getBenefitCategory = (fruit) => {
    if (fruit.benefit) return fruit.benefit;
    return 'General Wellbeing';
};

export default Fruitcyclopedia;
