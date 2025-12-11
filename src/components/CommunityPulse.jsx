import React, { useEffect, useState } from 'react';
import { Users, Activity, Globe } from 'lucide-react';
import { doc, onSnapshot, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

const CommunityPulse = () => {
    const [totalMembers, setTotalMembers] = useState(0);
    const [activeToday, setActiveToday] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Listen to global member count (Realtime)
        const unsubStats = onSnapshot(doc(db, 'system', 'stats'), (docSnap) => {
            if (docSnap.exists()) {
                setTotalMembers(docSnap.data().totalUsers || 0);
            }
        });

        // 2. Query users active in the last 24 hours (One-time fetch to save reads, or poll slowly)
        const fetchActiveUsers = async () => {
            try {
                const yesterday = new Date();
                yesterday.setHours(yesterday.getHours() - 24);

                const q = query(
                    collection(db, 'users'),
                    where('lastActive', '>', Timestamp.fromDate(yesterday))
                );

                // Note: This could be expensive if we have 1M users. 
                // For now (MVP), it's fine. In future, we'd use a Cloud Function counter.
                const snapshot = await getDocs(q);
                setActiveToday(snapshot.size);
            } catch (error) {
                console.warn("Could not fetch active users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveUsers();

        // Refresh active count every 5 minutes
        const interval = setInterval(fetchActiveUsers, 5 * 60 * 1000);

        return () => {
            unsubStats();
            clearInterval(interval);
        };
    }, []);

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            borderRadius: '24px',
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.05)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around', // Spread out items
            flexWrap: 'wrap',
            gap: '1rem'
        }}>
            {/* Total Members */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    padding: '12px',
                    borderRadius: '16px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6'
                }}>
                    <Globe size={24} />
                </div>
                <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Global Users</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>
                        {loading ? '...' : totalMembers.toLocaleString()}
                    </div>
                </div>
            </div>

            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }} className="hide-mobile"></div>

            {/* Active Today */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    padding: '12px',
                    borderRadius: '16px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    position: 'relative'
                }}>
                    {/* Pulse Dot */}
                    <span style={{
                        position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: '#10b981',
                        boxShadow: '0 0 0 rgba(16, 185, 129, 0.4)',
                        animation: 'pulse 2s infinite'
                    }}></span>
                    <Activity size={24} />
                </div>
                <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Active Today</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>
                        {loading ? '...' : activeToday.toLocaleString()}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
                @media (max-width: 600px) {
                    .hide-mobile { display: none; }
                }
            `}</style>
        </div>
    );
};

export default CommunityPulse;
