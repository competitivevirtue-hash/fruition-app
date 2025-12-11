```javascript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Globe, Radio, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';

const AdminWorldMap = ({ isOpen, onClose }) => {
    const { updateLastActive } = useAuth();
    const [myLocation, setMyLocation] = useState(null);
    const [activeUsers, setActiveUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Get Real Geometry & Report to DB
    useEffect(() => {
        if (isOpen && 'geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const loc = { lat: latitude, lng: longitude };
                    setMyLocation(loc);
                    // Push live location to Firestore
                    updateLastActive(loc); 
                },
                (error) => console.error("GPS Error:", error)
            );
        }
    }, [isOpen, updateLastActive]);

    // 2. Fetch ALL Active Users from DB
    useEffect(() => {
        if (!isOpen) return;
        
        const fetchUsers = async () => {
            try {
                // Determine "Active" as last 24 hours for now (to ensure we see dots)
                // In production, might want 'last 1 hour'
                const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
                const q = query(
                    collection(db, 'users'),
                    where('lastActive', '>', yesterday),
                    limit(50)
                );
                
                const snapshot = await getDocs(q);
                const users = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(u => u.location); // Only users with location data
                
                setActiveUsers(users);
            } catch (err) {
                console.error("Error fetching map data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
        // Poll every 30s
        const interval = setInterval(fetchUsers, 30000);
        return () => clearInterval(interval);
    }, [isOpen]);

    // 3. PURE Equirectangular Projection
    // x = (lng + 180) * (W / 360)
    // y = (90 - lat) * (H / 180)
    // No manual offsets. Reliant on using a CORRECT 2:1 Aspect Ratio Map Image.
    const project = (lat, lng) => {
        // Ensure lat/lng are numbers
        const l = parseFloat(lat);
        const ln = parseFloat(lng);
        
        return {
            x: (ln + 180) * (100 / 360),
            y: (90 - l) * (100 / 180)
        };
    };

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
                            <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'white' }}>Live Network Activity</h2>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Radio size={12} className="pulse-text" /> 
                                {loading ? "Scanning Network..." : `Tracking ${ activeUsers.length } Active Nodes`}
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
                    {/* The Map Image - MUST be Standard 2:1 Equirectangular */}
                    <div style={{ 
                        position: 'relative', 
                        width: '100%', 
                        maxWidth: '1000px', 
                        aspectRatio: '2/1', 
                        margin: '0 auto',
                        backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/e/ea/Equirectangular-projection.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}>
                        {/* Dark Overlay to make it look "Cyber" */}
                        <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: 0.8 }} />
                        
                        {/* Border Overlay (Optional, if matching projection) */}
                        {/* Keeping it simple: Background Image + Dots. The Wikimedia image is standard Equirectangular. */}

                        {/* Grid Lines */}
                        <div style={{ 
                            position: 'absolute', 
                            inset: 0, 
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', 
                            backgroundSize: '16.66% 33.33%', // 60x60 degree blocks roughly
                            pointerEvents: 'none',
                            opacity: 0.3
                        }} />

                        {/* Real User Dots */}
                        {activeUsers.map(user => {
                            const { x, y } = project(user.location.lat, user.location.lng);
                            const isMe = myLocation && Math.abs(user.location.lat - myLocation.lat) < 0.01 && Math.abs(user.location.lng - myLocation.lng) < 0.01;
                            
                            return (
                                <div
                                    key={user.id}
                                    style={{
                                        position: 'absolute',
                                        left: `${ x }% `,
                                        top: `${ y }% `,
                                        transform: 'translate(-50%, -50%)',
                                        zIndex: isMe ? 20 : 10
                                    }}
                                >
                                    <div className={`map - user - dot ${ isMe ? 'is-me' : '' } `}>
                                        <div className="dot-core" />
                                        <div className="dot-ring" />
                                        {isMe && <div className="dot-radar" />}
                                        <div className="dot-label">
                                            {isMe && <Navigation size={10} style={{ marginRight: 4 }} />}
                                            {isMe ? "YOU" : "User"}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
                             GPS: {myLocation.lat.toFixed(4)}, {myLocation.lng.toFixed(4)}
                        </div>
                    )}
                </div>

                {/* Footer Stats */}
                <div style={{ padding: '1.5rem', background: '#09090b', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '4rem' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Active in last 24h</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{activeUsers.length}</div>
                    </div>
                     <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Global Status</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>Connected</div>
                    </div>
                </div>
            </motion.div>
            <style jsx>{`
    .map - user - dot {
    position: relative;
    width: 0;
    height: 0;
    display: flex;
    align - items: center;
    justify - content: center;
}
                .dot - core {
    width: 6px;
    height: 6px;
    background: #10b981;
    border - radius: 50 %;
    box - shadow: 0 0 10px #10b981;
    position: absolute;
}
                .is - me.dot - core {
    background: #3b82f6;
    box - shadow: 0 0 15px #3b82f6;
    width: 8px; height: 8px;
}
                .dot - ring {
    position: absolute;
    width: 20px; height: 20px;
    border: 1px solid #10b981;
    border - radius: 50 %;
    animation: ripple 2s infinite ease - out;
    opacity: 0;
}
                .is - me.dot - ring {
    border - color: #3b82f6;
}
                .dot - radar {
    position: absolute;
    width: 100px; height: 100px;
    border - radius: 50 %;
    background: conic - gradient(from 0deg, transparent 0deg, rgba(59, 130, 246, 0.15) 60deg, transparent 60deg);
    animation: radar - spin 4s linear infinite;
    opacity: 0.1;
    pointer - events: none;
}
                
                .dot - label {
    position: absolute;
    top: -25px;
    left: 50 %;
    transform: translateX(-50 %);
    background: rgba(0, 0, 0, 0.8);
    padding: 4px 8px;
    border - radius: 4px;
    font - size: 0.7rem;
    color: #fff;
    white - space: nowrap;
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex; alignItems: center;
}

@keyframes ripple {
    0 % { transform: scale(0.5); opacity: 0.8; }
    100 % { transform: scale(3); opacity: 0; }
}
@keyframes radar - spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
}
`}</style>
        </motion.div>
    );
};

export default AdminWorldMap;
```
