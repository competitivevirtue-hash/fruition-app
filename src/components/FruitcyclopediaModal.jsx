import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Microscope, Lightbulb, Activity, Tag, CheckCircle, Utensils } from 'lucide-react';
import { getFruitImage } from '../utils/fruitUtils';
import { fetchFruitNutrition } from '../utils/usdaApi';

import { getVarieties } from '../utils/varietiesUtils';
import { fruits as mockFruits } from '../data/mockData';
import { Plus } from 'lucide-react';
import './BioModal.css';

const FruitcyclopediaModal = ({ fruit, onClose, onAddToBasket }) => {
    const [nutrition, setNutrition] = useState(null);
    const [loading, setLoading] = useState(false);

    const varieties = React.useMemo(() => getVarieties(fruit?.name), [fruit]);

    // Merge passed fruit with mock data for rich info (Selection, Facts, etc.)
    const richFruitData = React.useMemo(() => {
        if (!fruit) return null;
        // Try strict match first, then partial
        const match = mockFruits.find(f => f.name.toLowerCase() === fruit.name.toLowerCase()) ||
            mockFruits.find(f => fruit.name.toLowerCase().includes(f.name.toLowerCase()) || f.name.toLowerCase().includes(fruit.name.toLowerCase()));

        return match ? { ...match, ...fruit } : fruit;
    }, [fruit]);

    useEffect(() => {
        if (fruit) {
            setLoading(true);
            setNutrition(null);
            fetchFruitNutrition(fruit.name).then(data => {
                setNutrition(data);
                setLoading(false);
            });
        }
    }, [fruit]);

    const displayFruit = richFruitData || fruit;

    if (!fruit) return null;

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
                    className="modal-content"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>

                    <div className="modal-header">
                        <img src={getFruitImage(displayFruit.name)} alt={displayFruit.name} className="modal-image" />
                        <div className="modal-title-container">
                            <h2 className="modal-title text-gradient">{displayFruit.name}</h2>
                            {displayFruit.scientificName && <span className="scientific-name">{displayFruit.scientificName}</span>}
                            <div className="modal-badges">
                                {nutrition?.calories ? (
                                    <span className="badge">{nutrition.calories}/100g</span>
                                ) : (
                                    displayFruit.calories && <span className="badge">{displayFruit.calories} kcal/100g</span>
                                )}
                                {displayFruit.sugarContent && <span className="badge" data-type={displayFruit.sugarContent.toLowerCase()}>{displayFruit.sugarContent} Sugar</span>}
                            </div>
                        </div>
                    </div>

                    <div className="modal-body">
                        <div className="info-grid">
                            {displayFruit.selectionTips && (
                                <div className="info-section selection-guide">
                                    <div className="section-icon"><CheckCircle size={20} /></div>
                                    <div className="section-content">
                                        <h3>Selection Guide</h3>
                                        <p>{displayFruit.selectionTips}</p>
                                    </div>
                                </div>
                            )}

                            {displayFruit.bestFor && (
                                <div className="info-section use-cases">
                                    <div className="section-icon"><Utensils size={20} /></div>
                                    <div className="section-content">
                                        <h3>Best For</h3>
                                        <div className="use-case-tags">
                                            {displayFruit.bestFor.map((use, index) => (
                                                <span key={index} className="use-case-tag">{use}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="info-section scientific">
                                <div className="section-icon"><Microscope size={20} /></div>
                                <div className="section-content">
                                    <h3>Scientific Fact</h3>
                                    <p>{displayFruit.scientificFact || "Nature's candy!"}</p>
                                </div>
                            </div>

                            <div className="info-section analogy">
                                <div className="section-icon"><Lightbulb size={20} /></div>
                                <div className="section-content">
                                    <h3>Make it Plain</h3>
                                    <p>{displayFruit.makeItPlain || "Delicious and nutritious."}</p>
                                </div>
                            </div>

                            <div className="info-section stats full-width">
                                <div className="section-icon"><Activity size={20} /></div>
                                <div className="section-content">
                                    <h3>Nutritional Highlights</h3>
                                    {loading ? (
                                        <p className="loading-text">Loading verified data...</p>
                                    ) : (
                                        <div className="stats-grid">
                                            {nutrition ? (
                                                <>
                                                    <div className="stat-pill">
                                                        <span className="stat-key">Cals</span>
                                                        <span className="stat-value">{nutrition.calories}</span>
                                                    </div>
                                                    <div className="stat-pill">
                                                        <span className="stat-key">Vit C</span>
                                                        <span className="stat-value">{nutrition.vitaminC}</span>
                                                    </div>
                                                    <div className="stat-pill">
                                                        <span className="stat-key">Fiber</span>
                                                        <span className="stat-value">{nutrition.fiber}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <p className="text-muted">No details.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div> {/* End Grid */}

                        {varieties.length > 0 && (
                            <div className="info-section varieties full-width">
                                <div className="section-content" style={{ width: '100%' }}>
                                    <h3>Known Varieties</h3>
                                    <div className="varieties-scroll" style={{
                                        display: 'flex', gap: '0.75rem', overflowX: 'auto', padding: '0.25rem 0 0.5rem 0'
                                    }}>
                                        {varieties.map((v, i) => (
                                            <div key={i} style={{
                                                minWidth: '100px', textAlign: 'center', background: 'rgba(255,255,255,0.05)',
                                                padding: '8px', borderRadius: '10px', cursor: 'pointer'
                                            }}>
                                                <img src={v.image} alt={v.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', marginBottom: '0.25rem' }} />
                                                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-text)' }}>{v.name}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{v.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', fontSize: '1rem', padding: '0.75rem' }}
                            onClick={() => onAddToBasket(displayFruit.name)}
                        >
                            <Plus size={18} style={{ marginRight: '0.5rem' }} />
                            Add to Basket
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FruitcyclopediaModal;
