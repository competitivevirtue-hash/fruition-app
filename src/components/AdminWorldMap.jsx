import React from 'react';
import { motion } from 'framer-motion';
import { X, Globe, Radio } from 'lucide-react';

// Simplified World Map SVG Path (Mercator)
const WORLD_MAP_PATH = "M156.4,264.4l-6.3,9.4l0,3.1l6.3,0L156.4,264.4z M153.2,255l3.1,3.1l6.3,0l3.1-6.3l-3.1-6.3L153.2,255z M194.1,239.3l9.4-3.1 l3.1-6.3l-3.1-6.3l-12.6,3.1l-6.3,6.3L194.1,239.3z M219.2,233l6.3-3.1l3.1-9.4l-6.3-3.1l-9.4,3.1L219.2,233z M228.7,195.3l3.1-3.1 l0-6.3l-6.3-3.1l-6.3,6.3l3.1,6.3L228.7,195.3z M253.8,189l3.1-3.1l-3.1-6.3l-9.4,3.1l-3.1,6.3L253.8,189z M450,225l-6.3,0l-6.3-6.3 l3.1-15.7l12.6,6.3l3.1,9.4L450,225z M478.3,160.7l-9.4,0l-6.3,9.4l0,6.3l9.4,6.3l6.3-3.1l3.1-9.4L478.3,160.7z M563.1,267.5 l-9.4,3.1l-3.1,9.4l6.3,3.1l9.4-6.3l0-6.3L563.1,267.5z M660.5,236.1l-3.1,6.3l3.1,6.3l9.4-3.1l3.1-6.3l-6.3-3.1L660.5,236.1z M666.8,189l-9.4,3.1l-3.1,9.4l6.3,3.1l9.4-6.3l0-6.3L666.8,189z M795.6,267.5l-6.3,9.4l0,6.3l9.4,3.1l6.3-9.4l-3.1-6.3 L795.6,267.5z M852.1,189l-6.3,3.1l-0,9.4l6.3,3.1l9.4-6.3l3.1-9.4L852.1,189z M877.3,123l-9.4-3.1l-3.1,6.3l3.1,6.3l12.6-3.1 l0-3.1L877.3,123z M257,364.9l-6.3-3.1l-9.4,3.1l-3.1,9.4l6.3,3.1l9.4-6.3L257,364.9z M323,399.4l-3.1,6.3l3.1,6.3l12.6-3.1 l3.1-6.3l-9.4-3.1L323,399.4z M351.2,430.8l-0,6.3l6.3,3.1l6.3-3.1l3.1-9.4l-6.3-3.1L351.2,430.8z M414.1,449.7l-9.4,0l-6.3,9.4 l0,6.3l9.4,3.1l6.3-9.4L414.1,449.7z M489.5,430.8l-6.3,3.1l-3.1,9.4l3.1,9.4l9.4,3.1l3.1-6.3L489.5,430.8z M610.2,499.9l-6.3,3.1 l-3.1,9.4l6.3,9.4l9.4-3.1l3.1-12.6L610.2,499.9z M739,430.8l-9.4,3.1l-3.1,9.4l6.3,3.1l9.4-6.3l0-6.3L739,430.8z";

const AdminWorldMap = ({ isOpen, onClose, activeUserCount }) => {
    if (!isOpen) return null;

    // Generate random user locations based on count
    // This mocks the "Live Data" since we don't have real geo-coordinates
    const userDots = React.useMemo(() => {
        return Array.from({ length: Math.max(activeUserCount, 1) }).map((_, i) => ({
            id: i,
            x: Math.random() * 80 + 10, // 10% to 90% width
            y: Math.random() * 60 + 20, // 20% to 80% height (roughly habitable zones)
            delay: Math.random() * 2,
        }));
    }, [activeUserCount]);

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
        >
            <motion.div
                className="modal-content"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '90%', maxWidth: '1000px', height: '80vh',
                    background: '#09090b', borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    boxShadow: '0 0 50px rgba(16, 185, 129, 0.1)'
                }}
            >
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                            <Globe size={24} color="#10b981" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'white' }}>Global Activity Map</h2>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Radio size={12} className="pulse-text" /> Live Signal Tracking
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Map Container */}
                <div style={{ flex: 1, position: 'relative', background: 'radial-gradient(circle at center, #18181b 0%, #000000 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

                    {/* Grid Overlay */}
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

                    {/* World Map SVG (Simplified Dotted Representation for aesthetic) */}
                    <div style={{ position: 'relative', width: '100%', height: '100%', maxWidth: '800px', maxHeight: '500px' }}>
                        {/* We use a background image or a constructed SVG. Since we don't have an asset, let's build a "Cyber Grid" map */}
                        <svg viewBox="0 0 1000 500" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.2))' }}>
                            {/* Abstract Continents (Cyber Style) */}
                            <path
                                d="M150,150 Q200,100 250,150 T350,150 T450,150"
                                stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none"
                            />
                            {/* Since I don't have a perfect world map path on hand, I will simulate it with a sophisticated grid of "Nodes" 
                                 that light up. This fits the "Admin Nexus" theme better than a poorly drawn map.
                             */}
                            <defs>
                                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.1)" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />

                            {/* "Continents" defined by denser clusters of dots opacity - simulated via a mask or just placing the user dots */}
                        </svg>

                        {/* User Dots */}
                        {userDots.map(dot => (
                            <div
                                key={dot.id}
                                style={{
                                    position: 'absolute',
                                    left: `${dot.x}%`,
                                    top: `${dot.y}%`,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                <div className="map-user-dot">
                                    <div className="dot-core" />
                                    <div className="dot-ring" />
                                    <div className="dot-label">User Active</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Stats */}
                <div style={{ padding: '1.5rem', background: '#09090b', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '2rem' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Active Nodes</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{activeUserCount}</div>
                    </div>
                </div>
            </motion.div>
            <style jsx>{`
                .map-user-dot {
                    position: relative;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .dot-core {
                    width: 8px;
                    height: 8px;
                    background: #10b981;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #10b981, 0 0 20px #10b981;
                    z-index: 2;
                }
                .dot-ring {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border: 1px solid #10b981;
                    border-radius: 50%;
                    animation: ripple 2s infinite ease-out;
                    opacity: 0;
                }
                .dot-label {
                    position: absolute;
                    top: -20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(16, 185, 129, 0.2);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.6rem;
                    color: #10b981;
                    white-space: nowrap;
                    opacity: 0;
                    transition: opacity 0.3s;
                    border: 1px solid rgba(16, 185, 129, 0.4);
                }
                .map-user-dot:hover .dot-label {
                    opacity: 1;
                }
                @keyframes ripple {
                    0% { transform: scale(0.5); opacity: 0.8; }
                    100% { transform: scale(3); opacity: 0; }
                }
            `}</style>
        </motion.div>
    );
};

export default AdminWorldMap;
