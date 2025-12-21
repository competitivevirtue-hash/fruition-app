import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Utensils, AlertTriangle } from 'lucide-react';
import { useFruit } from '../context/FruitContext';

const ExpiredItemsModal = ({ isOpen, onClose }) => {
    const { fruits, wasteFruit, consumeFruit } = useFruit();

    // Filter for Expired Items (daysRemaining <= 0)
    // We strictly check <= 0 as defined in the plan logic
    const expiredItems = fruits.filter(f => f.daysRemaining <= 0 && f.status !== 'Planned');

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="modal-overlay"
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            backdropFilter: 'blur(5px)',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem'
                        }}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="glass-panel"
                        style={{
                            width: '100%',
                            maxWidth: '500px',
                            maxHeight: '80vh',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'fixed',
                            zIndex: 1001,
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)', // Centering override
                            margin: 0 // Remove default margins
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid var(--glass-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(239, 68, 68, 0.1)' // Red tint header
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    padding: '8px',
                                    borderRadius: '50%',
                                    color: '#ef4444'
                                }}>
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text)' }}>Expired Items</h2>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Action required for your inventory</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="icon-btn">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                            {expiredItems.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-muted)' }}>
                                    <div style={{
                                        fontSize: '3rem',
                                        marginBottom: '1rem',
                                        opacity: 0.5
                                    }}>🎉</div>
                                    <h3>All Clear!</h3>
                                    <p>You have no expired items in your inventory.</p>
                                    <button
                                        onClick={onClose}
                                        className="btn-primary"
                                        style={{ marginTop: '1.5rem' }}
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {expiredItems.map(item => (
                                        <div
                                            key={item.id}
                                            style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid var(--glass-border)',
                                                borderRadius: '12px',
                                                padding: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '1rem'
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <span style={{ fontSize: '1.5rem' }}>{item.emoji || '🍎'}</span>
                                                    <strong style={{ fontSize: '1.1rem', color: 'var(--color-text)' }}>{item.name}</strong>
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <AlertTriangle size={14} />
                                                    Expired {Math.abs(item.daysRemaining)} days ago
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                                    Quantity: {item.quantity} {item.unit}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <button
                                                    onClick={() => consumeFruit(item.id, item.quantity)}
                                                    style={{
                                                        background: 'rgba(16, 185, 129, 0.15)',
                                                        color: '#10b981',
                                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                                        padding: '8px 12px',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 500,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={e => e.target.style.background = 'rgba(16, 185, 129, 0.25)'}
                                                    onMouseLeave={e => e.target.style.background = 'rgba(16, 185, 129, 0.15)'}
                                                    title="I ate it (remove from expired)"
                                                >
                                                    <Utensils size={16} /> Ate It
                                                </button>

                                                <button
                                                    onClick={() => wasteFruit(item.id, item.quantity)}
                                                    style={{
                                                        background: 'rgba(239, 68, 68, 0.15)',
                                                        color: '#ef4444',
                                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                                        padding: '8px 12px',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 500,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={e => e.target.style.background = 'rgba(239, 68, 68, 0.25)'}
                                                    onMouseLeave={e => e.target.style.background = 'rgba(239, 68, 68, 0.15)'}
                                                    title="Throw in trash"
                                                >
                                                    <Trash2 size={16} /> Trash
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ExpiredItemsModal;
