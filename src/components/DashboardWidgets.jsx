import React, { useMemo } from 'react';
import { AlertTriangle, Activity } from 'lucide-react';
import { FRUIT_INTELLIGENCE, COLOR_MAP, BENEFIT_MAP, COLOR_DEFINITIONS } from '../utils/fruitUtils';
import './DashboardWidgets.css';

import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { getRelativeTime } from '../utils/fruitUtils';

const DashboardWidgets = ({ fruits }) => {
    const [selectedColor, setSelectedColor] = React.useState(null);
    const [feedEvents, setFeedEvents] = React.useState([]);

    React.useEffect(() => {
        const q = query(
            collection(db, 'public_feed'),
            orderBy('timestamp', 'desc'),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const events = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Convert Firestore Timestamp to Date object if needed for relative time
                timestamp: doc.data().timestamp?.toDate() || new Date()
            }));
            setFeedEvents(events);
        }, (error) => {
            console.warn("Global feed sync error:", error);
        });

        return () => unsubscribe();
    }, []);

    // --- INTELLIGENCE PROCESSING ---

    // --- INTELLIGENCE PROCESSING ---
    const intelligence = useMemo(() => {
        const colorsPresent = new Set();
        const benefitCounts = {};
        const expiringItems = [];

        fruits.forEach(fruit => {
            if (!fruit || !fruit.name) return; // Safety check
            const lowerName = fruit.name.toLowerCase();
            // Simple fuzzy match for knowledge base
            const key = Object.keys(FRUIT_INTELLIGENCE).find(k => lowerName.includes(k));
            const info = FRUIT_INTELLIGENCE[key];

            if (info) {
                colorsPresent.add(info.color);
                info.benefits.forEach(b => {
                    benefitCounts[b] = (benefitCounts[b] || 0) + (fruit.quantity || 1);
                });
            }

            // Freshness Logic
            if (fruit.daysRemaining <= 3 && fruit.status !== 'Planned') {
                expiringItems.push(fruit);
            }
        });

        // Consolidate benefits (Top 3)
        const topBenefits = Object.entries(benefitCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([key, count]) => ({ ...BENEFIT_MAP[key], count }));

        return {
            colors: Array.from(colorsPresent),
            topBenefits,
            expiringItems: expiringItems.sort((a, b) => a.daysRemaining - b.daysRemaining) // Most urgent first
        };
    }, [fruits]);

    return (
        <div className="dashboard-widgets-grid">

            {/* Widget 1: The Rainbow Spectrum */}
            <div className="dash-widget rainbow-widget glass-panel">
                <div className="widget-header">
                    <h3>Rainbow Spectrum</h3>
                    <span className="widget-subtitle">Dietary Diversity</span>
                </div>
                <div className="spectrum-container">
                    {Object.entries(COLOR_MAP).map(([key, { hex }]) => {
                        const isActive = intelligence.colors.includes(key);
                        const isSelected = selectedColor === key;
                        return (
                            <div
                                key={key}
                                className="spectrum-node"
                                onClick={() => setSelectedColor(isSelected ? null : key)}
                                style={{
                                    opacity: isActive ? 1 : 0.4,
                                    cursor: 'pointer',
                                    transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <div
                                    className="color-dot"
                                    style={{
                                        backgroundColor: hex,
                                        boxShadow: isSelected || isActive ? `0 0 15px ${hex}` : 'none',
                                        border: isSelected ? '2px solid white' : 'none'
                                    }}
                                />
                                {isActive && <div className="spectrum-check">✓</div>}
                            </div>
                        );
                    })}
                </div>

                {selectedColor ? (
                    <div className="definition-card" style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '12px',
                        borderLeft: `4px solid ${COLOR_MAP[selectedColor].hex}`
                    }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: COLOR_MAP[selectedColor].hex, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                            {selectedColor} Definition
                        </h4>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.5', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                            "{COLOR_DEFINITIONS[selectedColor] || COLOR_DEFINITIONS.blue}"
                        </p>
                    </div>
                ) : (
                    <p className="widget-insight" style={{ marginTop: '1rem' }}>
                        {intelligence.colors.length >= 4
                            ? "Excellent diversity! You're eating the rainbow."
                            : "Tap a color to learn its biological impact."}
                    </p>
                )}
            </div>

            {/* Widget 2: Bio-Impact */}
            <div className="dash-widget bio-widget glass-panel">
                <div className="widget-header">
                    <h3>Bio-Impact</h3>
                    <span className="widget-subtitle">Active Benefits</span>
                </div>
                <div className="benefits-list">
                    {intelligence.topBenefits.length > 0 ? (
                        intelligence.topBenefits.map((benefit, i) => {
                            if (!benefit.label) return null; // Skip unknown
                            const Icon = benefit.icon;
                            return (
                                <div key={i} className="benefit-row">
                                    <div className="benefit-icon-box" style={{ background: `${benefit.color}20`, color: benefit.color }}>
                                        <Icon size={16} />
                                    </div>
                                    <span className="benefit-name">{benefit.label}</span>
                                    <div className="benefit-bar-container">
                                        <div
                                            className="benefit-bar"
                                            style={{
                                                width: `${Math.min(benefit.count * 10, 100)}%`, // Scale logic
                                                background: benefit.color
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="empty-state-text">Add fruit to see health impacts.</p>
                    )}
                </div>
            </div>

            {/* Widget 3: Freshness Forecast (Actionable) */}
            <div className={`dash-widget freshness-widget glass-panel ${intelligence.expiringItems.length > 0 ? 'urgent' : ''}`}>
                <div className="widget-header">
                    {/* Freshness Alerts */}
                    <h3>Freshness Forecast</h3>
                    <span className="widget-subtitle">Inventory Intel</span>
                </div>
                <div className="forecast-content">
                    {intelligence.expiringItems.length > 0 ? (
                        <div className="urgent-list">
                            {intelligence.expiringItems.slice(0, 2).map(fruit => (
                                <div key={fruit.id} className="urgent-item">
                                    <AlertTriangle size={16} color="#FF4D4D" />
                                    <div>
                                        <span className="urgent-name">{fruit.daysRemaining === 0 ? 'Expired' : `Eat ${fruit.name}`}</span>
                                        <span className="urgent-time">
                                            {fruit.daysRemaining === 0 ? 'Consumed?' : `${fruit.daysRemaining} day${fruit.daysRemaining === 1 ? '' : 's'} left`}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {intelligence.expiringItems.length > 2 && (
                                <div className="more-items">+{intelligence.expiringItems.length - 2} more expiring</div>
                            )}
                        </div>
                    ) : (
                        <div className="all-good-state">
                            <div className="check-ring">✓</div>
                            <p>Inventory is fresh.<br />No waste risk detected.</p>
                        </div>
                    )}
                </div>
            </div>



            {/* Widget 4: Live Global Pulse */}
            <div className="dash-widget pulse-widget glass-panel">
                <div className="widget-header">
                    <h3>Live Global Pulse</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="widget-subtitle">Community Activity</span>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'pulse 2s infinite' }}></div>
                    </div>
                </div>

                <div className="intelligence-display glass-panel" style={{ marginTop: '0', background: 'rgba(0,0,0,0.2)' }}>
                    <div className="pulse-ticker-container" style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                        <div className="pulse-ticker-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'scrollUp 10s linear infinite' }}>
                            {feedEvents.length > 0 ? (
                                feedEvents.map((event) => (
                                    <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                                            <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{event.userDisplayName || 'Anonymous'}</span>
                                            {event.location && <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>from {event.location}</span>}
                                        </div>
                                        <span>
                                            {event.type === 'consumed' ? 'ate' : 'wasted'} {event.amount > 1 ? `${event.amount}x` : 'a'} {event.fruitName}
                                        </span>
                                        <span>{event.icon}</span>
                                        <span style={{ opacity: 0.5, fontSize: '0.75rem', marginLeft: 'auto' }}>
                                            {getRelativeTime(event.timestamp)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '1rem' }}>Listening for potential fruit events...</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div >
    );
};

export default DashboardWidgets;
