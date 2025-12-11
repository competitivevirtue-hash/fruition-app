import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext.jsx';
import { getFruitImage, formatUserDate } from '../utils/fruitUtils';
import { Trash2, CheckCircle, Calendar, Filter } from 'lucide-react';

const HistoryView = () => {
    const { currentUser, userProfile } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'consumed', 'wasted'

    useEffect(() => {
        const fetchHistory = async () => {
            if (!currentUser) return;
            setLoading(true);

            try {
                // Fetch Consumed
                const consumedRef = collection(db, `users/${currentUser.uid}/consumed`);
                const consumedQ = query(consumedRef, orderBy('consumedAt', 'desc'), limit(50));
                const consumedSnap = await getDocs(consumedQ);
                const consumedData = consumedSnap.docs.map(doc => ({
                    id: doc.id,
                    type: 'consumed',
                    date: new Date(doc.data().consumedAt),
                    ...doc.data()
                }));

                // Fetch Waste
                const wasteRef = collection(db, `users/${currentUser.uid}/waste`);
                const wasteQ = query(wasteRef, orderBy('wasteDate', 'desc'), limit(50));
                const wasteSnap = await getDocs(wasteQ);
                const wasteData = wasteSnap.docs.map(doc => ({
                    id: doc.id,
                    type: 'wasted',
                    date: new Date(doc.data().wasteDate),
                    ...doc.data()
                }));

                // Merge and Sort
                const merged = [...consumedData, ...wasteData].sort((a, b) => b.date - a.date);
                setHistory(merged);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [currentUser]);

    const filteredHistory = filter === 'all'
        ? history
        : history.filter(item => item.type === filter);

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading history...</div>;
    }

    return (
        <div style={{ padding: '1rem' }}>
            {/* Header / Filter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="text-gradient">Activity Log</h2>
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px' }}>
                    {['all', 'consumed', 'wasted'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                background: filter === f ? 'rgba(255,255,255,0.1)' : 'transparent',
                                color: filter === f ? 'white' : 'var(--color-text-muted)',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                textTransform: 'capitalize'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                        <Calendar size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>No activity recorded yet.</p>
                    </div>
                ) : (
                    filteredHistory.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                gap: '1rem'
                            }}
                        >
                            {/* Icon */}
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: item.type === 'consumed' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                                color: item.type === 'consumed' ? '#4CAF50' : '#F44336',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {item.type === 'consumed' ? <CheckCircle size={20} /> : <Trash2 size={20} />}
                            </div>

                            {/* Details */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                                        {item.type === 'consumed' ? 'Ate' : 'Wasted'} {item.amount} {item.fruitName || 'Fruit'}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                        {formatUserDate(item.date, userProfile?.settings)}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                    {item.type === 'wasted' && item.reason ? `Reason: ${item.reason}` : (item.type === 'consumed' ? 'Delicious!' : '')}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HistoryView;
