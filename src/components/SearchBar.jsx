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

    const [showSmartAction, setShowSmartAction] = useState(false);

    const handleSearch = async (val) => {
        setQuery(val);

        // Smart Detection: If length > 15 and contains "bought" or numbers, suggest Smart Add
        const isSentence = val.length > 10 && (/\d/.test(val) || val.includes(' '));
        setShowSmartAction(isSentence);

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
            setShowSmartAction(false);
        }
    };

    // ... existing return ...

    return (
        <div className="search-bar-container" ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            {/* Input Wrapper */}
            <div className="search-input-wrapper glass-panel" style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                borderRadius: '50px',
                border: showSmartAction ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                background: 'var(--color-surface)', // Ensure opaque/defined background
                transition: 'all 0.3s ease',
                boxShadow: showSmartAction ? '0 0 15px rgba(16, 185, 129, 0.2)' : '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <Search size={20} style={{ color: 'var(--color-primary)', marginRight: '12px' }} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={showSmartAction ? "Press Enter to Smart Add..." : "Ask Fruition or type 'I bought...'"}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && showSmartAction && onSparkleClick) {
                            // repurposing onSparkleClick or adding new prop? 
                            // Let's assume onSmartAdd is passed or we pass specialized object to onFruitSelect
                            if (onFruitSelect) onFruitSelect({ type: 'smart_entry', text: query });
                        }
                    }}
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
                {/* Smart Action Hint */}
                {showSmartAction && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            if (onFruitSelect) onFruitSelect({ type: 'smart_entry', text: query });
                            setQuery('');
                            setShowResults(false);
                        }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 10px)',
                            left: 0, right: 0,
                            background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                            padding: '12px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            zIndex: 101,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                            color: 'white',
                            fontWeight: 600
                        }}
                    >
                        <Sparkles size={18} />
                        Smart Add: "{query.length > 30 ? query.substring(0, 30) + '...' : query}"
                    </motion.div>
                )}

                {showResults && results.length > 0 && !showSmartAction && (
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
                input::placeholder {
                    color: var(--color-text);
                    opacity: 0.7; /* Increase visibility */
                }
            `}</style>
        </div >
    );
};

export default SearchBar;
