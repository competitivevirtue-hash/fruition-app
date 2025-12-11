import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { searchFruits } from '../utils/usdaApi';
import { getFruitImage } from '../utils/fruitUtils';
import { motion, AnimatePresence } from 'framer-motion';

const SearchBar = ({ onFruitSelect, onSparkleClick }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (val) => {
        setQuery(val);
        if (val.length > 0) {
            setIsLoading(true);
            setShowResults(true);
            try {
                // Using updated searchFruits utility with local guide
                const searchResults = await searchFruits(val);
                setResults(searchResults);
            } catch (error) {
                console.error("Search error:", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        } else {
            setResults([]);
            setShowResults(false);
        }
    };

    return (
        <div className="search-bar-container" ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <div className="search-input-wrapper glass-panel" style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                borderRadius: '50px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                transition: 'all 0.3s ease'
            }}>
                <Search size={20} style={{ color: 'var(--color-primary)', marginRight: '12px' }} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Ask Fruition..."
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text)',
                        fontSize: '1.1rem',
                        width: '100%',
                        outline: 'none'
                    }}
                    onFocus={() => {
                        if (query.length > 1) setShowResults(true);
                    }}
                />
                {isLoading ? (
                    <div className="loading-spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                ) : (
                    <div
                        onClick={onSparkleClick}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Open Smart Chef"
                    >
                        <Sparkles size={20} style={{ color: '#FDB813', opacity: 0.8 }} />
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showResults && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '10px',
                            background: 'rgba(20, 25, 40, 0.95)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            zIndex: 100,
                            overflow: 'hidden',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)', // Darker shadow for separation
                            color: '#fff' // Ensure text is white on the dark dropdown
                        }}
                    >
                        {results.map((fruit, index) => (
                            <div
                                key={index}
                                onClick={() => {
                                    // Construct a mock fruit object compatible with details modal
                                    onFruitSelect({
                                        ...fruit,
                                        // Default properties for explore view if missing from search result
                                        calories: fruit.calories || 'Unknown',
                                        freshness: 'Unknown',
                                        status: 'Explore'
                                    });
                                    setQuery('');
                                    setShowResults(false);
                                }}
                                style={{
                                    padding: '12px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    borderBottom: index < results.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >

                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    marginRight: '12px',
                                    borderRadius: '6px',
                                    overflow: 'hidden',
                                    background: 'rgba(255,255,255,0.1)'
                                }}>
                                    <img
                                        src={getFruitImage(fruit.name)}
                                        alt={fruit.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                                <div>
                                    <div style={{ color: '#fff', fontWeight: 500 }}>{fruit.name}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>View details</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div >
    );
};

export default SearchBar;
