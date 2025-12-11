
import React from 'react';
import { getMonthlyPersona } from '../utils/reportUtils';
import { getFruitImage, formatFruitName } from '../utils/fruitUtils';
import { Crown, Leaf, TrendingUp, Download } from 'lucide-react';

const MonthlyReportCard = ({ data, id }) => {
    // data = { month, year, displayName, consumedCount, wasteCount, items }
    const { displayName, consumedCount, wasteCount, items } = data;
    const total = consumedCount + wasteCount;
    const efficiency = total > 0 ? Math.round((consumedCount / total) * 100) : 100;
    const persona = getMonthlyPersona(data);

    // Top 3 Fruit
    const frequency = {};
    items.filter(i => i.type === 'consumed').forEach(i => {
        const name = i.fruitName || i.name;
        frequency[name] = (frequency[name] || 0) + (i.amount || 1);
    });
    const topFruits = Object.entries(frequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

    // Daily Timeline Logic
    const sortedItems = [...items].sort((a, b) => {
        const dateA = new Date(a.timestamp || a.consumedAt || a.wasteDate || a.date);
        const dateB = new Date(b.timestamp || b.consumedAt || b.wasteDate || b.date);
        return dateA - dateB;
    });

    return (
        <div
            id={id} // Needed for PDF generation
            style={{
                background: 'linear-gradient(135deg, #1e1e24 0%, #131314 100%)',
                borderRadius: '24px',
                padding: '2.5rem',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
                width: '100%',
                maxWidth: '700px', // Widened slightly for timeline
                margin: '0 auto',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Header / Brand */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 className="text-glow" style={{ fontSize: '2rem', margin: 0, fontWeight: 800 }}>{displayName}</h2>
                    <p style={{ color: 'var(--color-primary)', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={16} /> Fruit Intelligence Report
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1, color: efficiency > 80 ? '#4ADE80' : '#F87171' }}>{efficiency}%</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Efficiency Score</div>
                </div>
            </div>

            {/* Persona Stamp */}
            <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '20px',
                padding: '2rem',
                textAlign: 'center',
                marginBottom: '2.5rem',
                border: '1px solid rgba(255,255,255,0.05)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))' }} />
                <Crown size={40} color="#FDB813" style={{ marginBottom: '1rem', filter: 'drop-shadow(0 0 10px rgba(253, 184, 19, 0.5))' }} />
                <h3 style={{ fontSize: '1.8rem', margin: '0.5rem 0', fontWeight: 800 }}>{persona}</h3>
                <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)' }}>Based on your consumption patterns this month.</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ background: 'rgba(74, 222, 128, 0.05)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(74, 222, 128, 0.1)', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4ADE80', marginBottom: '0.5rem' }}>{consumedCount}</div>
                    <div style={{ fontSize: '0.9rem', color: '#86efac', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Consumed</div>
                </div>
                <div style={{ background: 'rgba(248, 113, 113, 0.05)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(248, 113, 113, 0.1)', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#F87171', marginBottom: '0.5rem' }}>{wasteCount}</div>
                    <div style={{ fontSize: '0.9rem', color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Wasted</div>
                </div>
            </div>

            {/* Top Fruits */}
            <div style={{ marginBottom: '3rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center' }}>Top Favorites</h4>
                <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
                    {topFruits.length > 0 ? topFruits.map(([name, count], idx) => (
                        <div key={name} style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '70px', height: '70px',
                                borderRadius: '20px',
                                background: 'rgba(255,255,255,0.05)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '0.8rem',
                                border: idx === 0 ? '2px solid var(--color-accent)' : '1px solid rgba(255,255,255,0.1)',
                                boxShadow: idx === 0 ? '0 0 20px rgba(251, 146, 60, 0.3)' : 'none'
                            }}>
                                <img src={getFruitImage(name)} alt={name} style={{ width: '45px' }} />
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{formatFruitName(name)}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{count}x</div>
                        </div>
                    )) : (
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No consumption data yet.</p>
                    )}
                </div>
            </div>

            {/* Daily Timeline */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Leaf size={16} /> Daily Activity Log
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                    {sortedItems.length > 0 ? sortedItems.map((item, idx) => {
                        const date = new Date(item.timestamp || item.consumedAt || item.wasteDate || item.date);
                        const isConsumed = item.type === 'consumed';

                        return (
                            <div key={idx} style={{
                                display: 'flex',
                                flexWrap: 'wrap', // Allow wrapping on small screens
                                alignItems: 'center',
                                gap: '0.8rem',
                                padding: '12px',
                                borderRadius: '12px',
                                background: isConsumed ? 'rgba(74, 222, 128, 0.03)' : 'rgba(248, 113, 113, 0.03)',
                                border: '1px solid rgba(255,255,255,0.03)'
                            }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', width: '40px', textAlign: 'right', fontWeight: 600 }}>
                                    {date.getDate()}/{date.getMonth() + 1}
                                </div>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.1)', padding: '4px' }}>
                                    <img src={getFruitImage(item.fruitName || item.name)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                                <div style={{ flex: '1 1 auto', minWidth: '100px' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{formatFruitName(item.fruitName || item.name)}</div>
                                </div>
                                <div style={{
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    color: isConsumed ? '#4ADE80' : '#F87171',
                                    background: isConsumed ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {isConsumed ? 'CONSUMED' : 'WASTED'} ({item.amount})
                                </div>
                            </div>
                        );
                    }) : (
                        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '1rem' }}>No activity logs found for this month.</div>
                    )}
                </div>
            </div>

            {/* Footer / Watermark */}
            <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Generated by <span style={{ fontWeight: 800, color: 'white' }}>FRUITION</span> AI
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{new Date().toLocaleDateString()}</span>
            </div>
        </div>
    );
};

export default MonthlyReportCard;
