import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trash2, Plus, ShoppingBag } from 'lucide-react';
import { useFruit } from '../context/FruitContext';

const BulkAddModal = ({ isOpen, onClose, initialItems = [] }) => {
    const { addFruit } = useFruit();
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setItems(initialItems.map((item, idx) => ({ ...item, id: idx })));
        }
    }, [isOpen, initialItems]);

    const handleUpdate = (id, field, value) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleRemove = (id) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const handleAddRow = () => {
        setItems(prev => [...prev, { id: Date.now(), name: '', quantity: 1, unit: 'Pieces' }]);
    };

    const handleConfirm = async () => {
        // Add all valid items
        const validItems = items.filter(i => i.name.trim() !== '');

        // We'll just loop sequentially for now. 
        // In a real app with batch support, we'd use a batch write.
        for (const item of validItems) {
            // Construct a basic fruit object defaults
            // We could call USDA API here for each, but that might differ metadata.
            // For "Smart Add", we stick to basics and let user edit later if needed,
            // OR we rely on standard fallback placeholders.
            const newFruit = {
                name: item.name,
                image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=500',
                calories: 95,
                fruitcyclopedia: { vitaminC: 'Unknown', fiber: 'Unknown', antioxidants: 'Unknown' },
                scientificFact: 'Smart added item.',
                makeItPlain: 'Quickly added via smart entry.',
                freshness: 'Peak',
                daysRemaining: 7,
                purchaseDate: new Date().toISOString(),
                quantity: parseInt(item.quantity) || 1,
                unit: item.unit,
                status: 'Active'
            };

            await addFruit(newFruit);
        }

        onClose();
    };

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
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{ maxWidth: '600px', width: '90%' }}
                >
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '8px', borderRadius: '50%', color: '#10b981' }}>
                                <ShoppingBag size={20} />
                            </div>
                            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Smart Entry Review</h2>
                        </div>
                        <button className="close-btn" onClick={onClose} style={{ position: 'static' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            We found the following items. Please verify before adding.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {items.map((item) => (
                                <div key={item.id} style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'minmax(120px, 2fr) 80px 100px 40px',
                                    gap: '10px',
                                    alignItems: 'center',
                                    padding: '10px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '12px'
                                }}>
                                    {/* Name */}
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => handleUpdate(item.id, 'name', e.target.value)}
                                        placeholder="Item Name"
                                        style={{
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '6px',
                                            color: 'white',
                                            padding: '8px',
                                            width: '100%'
                                        }}
                                    />

                                    {/* Quantity */}
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleUpdate(item.id, 'quantity', e.target.value)}
                                        style={{
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '6px',
                                            color: 'white',
                                            padding: '8px',
                                            width: '100%'
                                        }}
                                    />

                                    {/* Unit */}
                                    <select
                                        value={item.unit}
                                        onChange={(e) => handleUpdate(item.id, 'unit', e.target.value)}
                                        style={{
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '6px',
                                            color: '#eee',
                                            cursor: 'pointer',
                                            padding: '8px'
                                        }}
                                    >
                                        {['Pieces', 'Bags', 'Boxes', 'lbs', 'kg', 'Bunches'].map(u => <option key={u} value={u} style={{ color: 'black' }}>{u}</option>)}
                                    </select>

                                    {/* Delete */}
                                    <button onClick={() => handleRemove(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleAddRow}
                            style={{
                                marginTop: '1rem',
                                background: 'none',
                                border: '1px dashed rgba(255,255,255,0.2)',
                                color: 'var(--color-text-muted)',
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <Plus size={16} /> Add Another Item
                        </button>
                    </div>

                    <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button className="btn" onClick={onClose} style={{ background: 'transparent' }}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleConfirm} disabled={items.length === 0}>
                            <Check size={18} style={{ marginRight: '8px' }} />
                            Confirm & Add All
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BulkAddModal;
