import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Globe, Radio, Navigation } from 'lucide-react';

const AdminWorldMap = ({ isOpen, onClose, activeUserCount }) => {
    const [myLocation, setMyLocation] = useState(null);
    const [geoError, setGeoError] = useState(null);

    // 1. Get Real Location on Mount
    useEffect(() => {
        if (isOpen && 'geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setMyLocation({ lat: latitude, lng: longitude });
                    console.log("📍 GPS Locked:", latitude, longitude);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setGeoError("Location access denied. Showing roughly estimated position.");
                }
            );
        }
    }, [isOpen]);

    // 2. Projection Logic (Equirectangular)
    // Map Image is Equirectangular: Width = 360 units, Height = 180 units
    // X = (lon + 180) * (MapWidth / 360)
    // Y = ((-1 * lat) + 90) * (MapHeight / 180)
    const project = (lat, lng) => {
        const x = (lng + 180) * (100 / 360);
        const y = ((-1 * lat) + 90) * (100 / 180);
        return { x, y };
    };

    // 3. Generate Mock Users + Real User
    const userDots = React.useMemo(() => {
        // Base mock locations (Major hubs)
        const hubs = [
            { lat: 31.23, lng: 121.47, label: "Shanghai, CN" },
            { lat: 51.50, lng: -0.12, label: "London, UK" },
            { lat: 52.52, lng: 13.40, label: "Berlin, DE" },
            { lat: 35.67, lng: 139.65, label: "Tokyo, JP" },
            { lat: 40.71, lng: -74.00, label: "New York, USA" },
            { lat: -23.55, lng: -46.63, label: "Sao Paulo, BR" },
            { lat: -33.86, lng: 151.20, label: "Sydney, AU" }
        ];

        const dots = hubs.slice(0, Math.max(0, activeUserCount - 1)).map((hub, i) => {
            const { x, y } = project(hub.lat, hub.lng);
            return { id: `mock-${i}`, x, y, label: hub.label, isMe: false };
        });

        // Add "ME"
        if (myLocation) {
            const { x, y } = project(myLocation.lat, myLocation.lng);
            dots.unshift({ id: 'me', x, y, label: "You (Active)", isMe: true });
        } else {
            // Fallback if no GPS yet: Oklahoma
            const { x, y } = project(35.46, -97.51);
            dots.unshift({ id: 'me-fallback', x, y, label: "Tracking...", isMe: true });
        }

        return dots;
    }, [activeUserCount, myLocation]);

    if (!isOpen) return null;

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
                    width: '90%', maxWidth: '1100px', height: '85vh',
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
                                <Radio size={12} className="pulse-text" />
                                {myLocation ? " GPS Locked & Tracking" : " Triangulating Position..."}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Map Container */}
                <div style={{
                    flex: 1,
                    position: 'relative',
                    background: '#050505',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* The Map Image (Equirectangular Standard) */}
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '1000px',
                        aspectRatio: '2/1', // Standard 2:1 ratio for Equirectangular
                        margin: '0 auto'
                    }}>
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png"
                            alt="World Map"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                filter: 'invert(1) opacity(0.2)', // Make it dark and subtle
                                pointerEvents: 'none'
                            }}
                        />
                        {/* Overlay detailed border map if possible, or just use outlines. 
                            The above is a blank map. Let's try a better one with borders if the user insisted.
                            Re-swapping to a map WITH borders.
                        */}
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg"
                            alt="Borders Overlay"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                filter: 'invert(1) opacity(0.3) drop-shadow(0 0 2px rgba(16,185,129,0.5))',
                                pointerEvents: 'none'
                            }}
                        />

                        {/* Grid Lines */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                            backgroundSize: '10% 20%', // Lat/Long lines roughly
                            pointerEvents: 'none'
                        }} />


                        {/* User Dots */}
                        {userDots.map(dot => (
                            <div
                                key={dot.id}
                                style={{
                                    position: 'absolute',
                                    left: `${dot.x}%`,
                                    top: `${dot.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: 10
                                }}
                            >
                                <div className={`map-user-dot ${dot.isMe ? 'is-me' : ''}`}>
                                    <div className="dot-core" />
                                    <div className="dot-ring" />
                                    <div className="dot-radar" />
                                    <div className="dot-label">
                                        {dot.isMe && <Navigation size={10} style={{ marginRight: 4 }} />}
                                        {dot.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Coordinates Display */}
                    {myLocation && (
                        <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            right: '20px',
                            fontFamily: 'monospace',
                            color: '#10b981',
                            background: 'rgba(0,0,0,0.7)',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(16,185,129,0.3)',
                            fontSize: '0.8rem'
                        }}>
                            LAT: {myLocation.lat.toFixed(4)} | LNG: {myLocation.lng.toFixed(4)}
                        </div>
                    )}
                </div>

                {/* Footer Stats */}
                <div style={{ padding: '1.5rem', background: '#09090b', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '4rem' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Active Nodes</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{activeUserCount}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Network Status</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Online <span className="status-dot"></span>
                        </div>
                    </div>
                </div>
            </motion.div>
            <style jsx>{`
                .map-user-dot {
                    position: relative;
                    width: 0;
                    height: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .dot-core {
                    width: 6px;
                    height: 6px;
                    background: #10b981;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #10b981;
                    position: absolute;
                }
                .is-me .dot-core {
                    background: #3b82f6; 
                    box-shadow: 0 0 15px #3b82f6;
                    width: 8px; height: 8px;
                }
                .dot-ring {
                    position: absolute;
                    width: 20px; height: 20px;
                    border: 1px solid #10b981;
                    border-radius: 50%;
                    animation: ripple 2s infinite ease-out;
                    opacity: 0;
                }
                .is-me .dot-ring {
                    border-color: #3b82f6;
                }
                .dot-radar {
                    position: absolute;
                    width: 100px; height: 100px;
                    border-radius: 50%;
                    background: conic-gradient(from 0deg, transparent 0deg, rgba(16, 185, 129, 0.1) 60deg, transparent 60deg);
                    animation: radar-spin 4s linear infinite;
                    opacity: 0.1;
                    pointer-events: none;
                }
                .is-me .dot-radar {
                     background: conic-gradient(from 0deg, transparent 0deg, rgba(59, 130, 246, 0.15) 60deg, transparent 60deg);
                }
                
                .dot-label {
                    position: absolute;
                    top: -25px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0,0,0,0.8);
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    color: #fff;
                    white-space: nowrap;
                    border: 1px solid rgba(255,255,255,0.2);
                    display: flex; alignItems: center;
                }
                
                .status-dot {
                    width: 8px; height: 8px; background: #3b82f6; border-radius: 50%;
                    box-shadow: 0 0 10px #3b82f6;
                    animation: pulse 2s infinite;
                }

                @keyframes ripple {
                    0% { transform: scale(0.5); opacity: 0.8; }
                    100% { transform: scale(3); opacity: 0; }
                }
                @keyframes radar-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </motion.div>
    );
};

export default AdminWorldMap;
