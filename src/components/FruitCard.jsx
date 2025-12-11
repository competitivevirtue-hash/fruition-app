import React, { useState } from 'react';
import { getFruitImage, normalizeFruitName } from '../utils/fruitUtils';
import { MoreVertical, Trash2, Info } from 'lucide-react';

const FruitCard = ({ fruit, onDetails, onConsume, onDelete }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    // Ensure display name is Title Case
    const displayName = normalizeFruitName(fruit.name);

    return (
        <div
            className="fruit-card-safe"
            onClick={onDetails}
            style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                textAlign: 'center',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.2)',
                position: 'relative'
            }}
            onMouseLeave={() => setMenuOpen(false)} // Auto-close on leave for smoother UX
        >
            {onDelete && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(!menuOpen);
                        }}
                        style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <MoreVertical size={16} />
                    </button>

                    {menuOpen && (
                        <div
                            className="glass-panel"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '4px',
                                minWidth: '120px',
                                background: 'rgba(30, 35, 50, 0.95)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                overflow: 'hidden',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                            }}
                        >
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    onDetails();
                                }}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    textAlign: 'left',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                                <Info size={14} />
                                Details
                            </button>
                            <button
                                onClick={() => {
                                    setMenuOpen(false);
                                    if (window.confirm(`Remove ${displayName}?`)) {
                                        onDelete(fruit.id);
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ff4d4d',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    textAlign: 'left',
                                    borderTop: '1px solid rgba(255,255,255,0.05)'
                                }}
                                onMouseEnter={(e) => e.target.style.background = 'rgba(255,77,77,0.1)'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                                <Trash2 size={14} />
                                Remove
                            </button>
                        </div>
                    )}
                </div>
            )}
            <img
                src={getFruitImage(fruit.name)}
                alt={displayName}
                style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    backgroundColor: 'transparent'
                }}
            />
            <h3 style={{ fontSize: '1rem', margin: 0, color: 'var(--color-text)' }}>{displayName}</h3>
            {fruit.quantity && (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>
                    {fruit.quantity} {fruit.unit || 'Pieces'}
                </p>
            )}
            {/* Optional Subtitle for context like 'Added 2 days ago' */}
            {fruit.subtitle && (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-primary)', margin: '0.25rem 0 0', fontWeight: 500 }}>
                    {fruit.subtitle}
                </p>
            )}
            {onConsume && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onConsume(1);
                    }}
                    style={{
                        marginTop: '0.5rem',
                        padding: '0.25rem 0.75rem',
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        width: '100%'
                    }}
                >
                    Eat 1
                </button>
            )}
        </div>
    );
};

export default FruitCard;
