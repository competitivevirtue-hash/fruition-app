import React from 'react';
import { X, Calendar as CalendarIcon, AlertTriangle, ShoppingBag, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFruitImage, formatFruitName } from '../utils/fruitUtils';
import './BioModal.css'; // Reusing modal styles

const DayDetailModal = ({ date, events, onClose, onAddFruit }) => {
    if (!date) return null;

    const purchases = events.filter(e => e.type === 'purchase');
    const expirations = events.filter(e => e.type === 'expiration');

    const formatDate = (d) => {
        return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    return (
        <AnimatePresence>
            <div className="modal-overlay" onClick={onClose}>
                <motion.div
                    className="glass-panel"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    style={{
                        maxWidth: '400px',
                        width: '90%',
                        // Dynamic Height Magic:
                        // auto height to fit content, but capped at 80vh to prevent overflow on small screens
                        height: 'auto',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '0', // Reset padding
                        borderRadius: '24px',
                        background: 'rgba(20, 20, 23, 0.85)', // Darker glass for contrast
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                >
                    {/* Compact Header */}
                    <div style={{
                        padding: '1.25rem 1.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                background: 'rgba(33, 150, 243, 0.15)',
                                color: '#60A5FA',
                                padding: '8px',
                                borderRadius: '12px'
                            }}>
                                <CalendarIcon size={20} />
                            </div>
                            <h2 className="text-glow" style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, letterSpacing: '0.5px' }}>{formatDate(date)}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div style={{
                        padding: '1.5rem',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem'
                    }}>

                        {/* Summary Stats - Compact */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <span className="text-pop" style={{ display: 'block', fontSize: '1.5rem', fontWeight: '800' }}>{purchases.length}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Added</span>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <span className="text-pop" style={{ display: 'block', fontSize: '1.5rem', fontWeight: '800', color: expirations.length > 0 ? '#F87171' : 'inherit', textShadow: expirations.length > 0 ? '0 0 10px rgba(248, 113, 113, 0.4)' : 'none' }}>{expirations.length}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Expiring</span>
                            </div>
                        </div>

                        {/* Purchases Section */}
                        {purchases.length > 0 && (
                            <section>
                                <h3 style={{ fontSize: '0.8rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                    Purchased
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {purchases.map(({ fruit }, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex', alignItems: 'center', gap: '1rem',
                                            background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                                            padding: '0.75rem', borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.03)'
                                        }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(0,0,0,0.1)' }}>
                                                <img
                                                    src={getFruitImage(fruit.name)}
                                                    alt={fruit.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{formatFruitName(fruit.name)}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{fruit.quantity} items</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Expirations Section */}
                        {expirations.length > 0 && (
                            <section>
                                <h3 style={{ fontSize: '0.8rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                    Expiring
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {expirations.map(({ fruit }, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex', alignItems: 'center', gap: '1rem',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            padding: '0.75rem', borderRadius: '12px',
                                            border: '1px solid rgba(239, 68, 68, 0.2)'
                                        }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(0,0,0,0.1)' }}>
                                                <img
                                                    src={getFruitImage(fruit.name)}
                                                    alt={fruit.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{formatFruitName(fruit.name)}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#F87171' }}>Use Immediately</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Empty State */}
                        {purchases.length === 0 && expirations.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--color-text-muted)' }}>
                                <p style={{ fontSize: '0.9rem' }}>No activity for this day.</p>
                            </div>
                        )}

                        {/* Quick Add */}
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '10px' }}
                            onClick={() => onAddFruit(date)}
                        >
                            <Plus size={18} /> Add Fruit
                        </button>

                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DayDetailModal;
