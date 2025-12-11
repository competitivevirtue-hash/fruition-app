import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ChefHat, Clock, ShoppingBag } from 'lucide-react';
import './BioModal.css'; // Reusing base modal styles

const RecipeModal = ({ isOpen, onClose, recipe, loading }) => {
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
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        maxWidth: '500px',
                        height: 'auto',
                        maxHeight: '80vh',
                        background: 'linear-gradient(135deg, var(--color-surface) 0%, rgba(20,20,25,0.95) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>

                    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflowY: 'auto' }}>

                        <div style={{
                            background: 'linear-gradient(135deg, #FF4D4D 0%, #F59E0B 100%)',
                            padding: '1rem',
                            borderRadius: '50%',
                            marginBottom: '1.5rem',
                            boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)'
                        }}>
                            {loading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                    <Sparkles size={32} color="white" />
                                </motion.div>
                            ) : (
                                <ChefHat size={32} color="white" />
                            )}
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center' }}>
                                <h2 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                                    Crunching the numbers...
                                </h2>
                                <p style={{ color: 'var(--color-text-muted)' }}>
                                    Analyzing your inventory for flavor pairings...
                                </p>
                            </div>
                        ) : (
                            recipe && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ width: '100%' }}
                                >
                                    <h2 style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '0.5rem', color: 'var(--color-text)' }}>
                                        {recipe.title}
                                    </h2>
                                    <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                                        {recipe.description}
                                    </p>

                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
                                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                                            <ShoppingBag size={18} /> Ingredients
                                        </h3>
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                            {recipe.ingredients.map((ing, i) => (
                                                <li key={i} style={{
                                                    marginBottom: '0.5rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    color: 'var(--color-text)'
                                                }}>
                                                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-secondary)' }}></span>
                                                    {ing}
                                                </li>
                                            ))}
                                            {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                                                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>You might need:</div>
                                                    {recipe.missingIngredients.map((ing, i) => (
                                                        <span key={i} style={{
                                                            display: 'inline-block',
                                                            fontSize: '0.75rem',
                                                            padding: '2px 8px',
                                                            background: 'rgba(255,255,255,0.05)',
                                                            borderRadius: '4px',
                                                            marginRight: '0.5rem',
                                                            color: 'var(--color-text-muted)'
                                                        }}>{ing}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </ul>
                                    </div>

                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '16px' }}>
                                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-secondary)' }}>
                                            <ChefHat size={18} /> Instructions
                                        </h3>
                                        <ol style={{ paddingLeft: '1.25rem', color: 'var(--color-text)', lineHeight: '1.6' }}>
                                            {recipe.steps.map((step, i) => (
                                                <li key={i} style={{ marginBottom: '0.5rem' }}>{step}</li>
                                            ))}
                                        </ol>
                                    </div>
                                </motion.div>
                            )
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default RecipeModal;
