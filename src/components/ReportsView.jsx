import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Activity, PieChart, Shield, Zap, Brain, Heart, Award, FileText, Download } from 'lucide-react';
import { useFruit } from '../context/FruitContext.jsx';
import { getFruitImage, FRUIT_INTELLIGENCE, BENEFIT_MAP, normalizeFruitName } from '../utils/fruitUtils';
import { groupDataByMonth } from '../utils/reportUtils';
import MonthlyReportCard from './MonthlyReportCard';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../components/DashboardWidgets.css';

const ReportsView = () => {
    const { getStats } = useFruit();
    const [stats, setStats] = useState({ consumed: [], wasted: [] });
    const [globalCount, setGlobalCount] = useState(12405);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'monthly'
    const [monthlyData, setMonthlyData] = useState([]);
    const reportRef = useRef(null);

    useEffect(() => {
        setLoading(true);
        getStats().then(data => {
            setStats(data);
            const months = groupDataByMonth(data.consumed, data.wasted);
            setMonthlyData(months);
            setLoading(false);
        });

        const unsub = onSnapshot(doc(db, 'system', 'stats'), (doc) => {
            if (doc.exists()) setGlobalCount(doc.data().totalUsers || 12405);
        });
        return () => unsub();
    }, []);

    const handleDownloadPDF = async (monthData) => {
        const input = document.getElementById(`report-${monthData.month}-${monthData.year}`);
        if (!input) return;

        try {
            const canvas = await html2canvas(input, {
                scale: 2,
                backgroundColor: '#131314', // Ensure dark background is captured
                useCORS: true // For images
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Fruition_Report_${monthData.month}_${monthData.year}.pdf`);
        } catch (error) {
            console.error("Failed to generate report:", error);
            alert("Failed to generate report. Please try again.");
        }
    };

    const totalConsumed = stats.consumed.reduce((acc, curr) => acc + (curr.amount || 1), 0);
    const totalWasted = stats.wasted.reduce((acc, curr) => acc + (curr.amount || 1), 0);
    const totalProcessed = totalConsumed + totalWasted;
    const efficiency = totalProcessed > 0 ? Math.round((totalConsumed / totalProcessed) * 100) : 100;

    // Bio-Impact Logic (Same as before)
    const bioStats = {};
    stats.consumed.forEach(item => {
        const normalizedName = normalizeFruitName(item.fruitName);
        const lowerName = normalizedName.toLowerCase();
        const key = Object.keys(FRUIT_INTELLIGENCE).find(k => lowerName.includes(k));
        const info = FRUIT_INTELLIGENCE[key];
        if (info) info.benefits.forEach(b => bioStats[b] = (bioStats[b] || 0) + (item.amount || 1));
    });
    const sortedBioStats = Object.entries(bioStats)
        .sort(([, a], [, b]) => b - a)
        .map(([key, count]) => ({ ...BENEFIT_MAP[key], key, count }));

    // Top Fruits Logic (Same as before)
    const fruitCounts = {};
    stats.consumed.forEach(item => {
        fruitCounts[normalizeFruitName(item.fruitName)] = (fruitCounts[normalizeFruitName(item.fruitName)] || 0) + (item.amount || 1);
    });
    const topFruits = Object.entries(fruitCounts).sort(([, a], [, b]) => b - a).slice(0, 5);

    const badges = [
        { id: 'eco', name: 'Eco Warrior', desc: '> 90% efficiency', icon: '🌍', unlocked: totalProcessed > 10 && efficiency > 90, color: '#10b981' },
        { id: 'ninja', name: 'Fruit Ninja', desc: '50+ fruits eaten', icon: '🥷', unlocked: totalConsumed >= 50, color: '#f59e0b' },
        { id: 'starter', name: 'Fresh Start', desc: 'First fruit logged', icon: '🌱', unlocked: totalConsumed > 0, color: '#3b82f6' },
        { id: 'master', name: 'Zen Master', desc: 'Zero waste for 7 days', icon: '🧘', unlocked: false, color: '#8b5cf6' }
    ];

    if (loading) {
        return (
            <div style={{ padding: '2rem', color: 'var(--color-text-muted)', textAlign: 'center', height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity className="spin" size={32} />
            </div>
        );
    }

    return (
        <div className="reports-view" style={{ padding: '1.5rem 1rem', maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px' }}>

            {/* Header with Tabs */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                            Intelligence Report
                        </h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
                            Bio-analytics & Consumption History
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '16px' }}>
                        <button
                            onClick={() => setActiveTab('overview')}
                            style={{
                                background: activeTab === 'overview' ? 'var(--color-primary)' : 'transparent',
                                border: 'none', padding: '10px 24px', borderRadius: '12px',
                                color: activeTab === 'overview' ? 'white' : 'var(--color-text-muted)',
                                cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <TrendingUp size={16} /> Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('monthly')}
                            style={{
                                background: activeTab === 'monthly' ? 'var(--color-primary)' : 'transparent',
                                border: 'none', padding: '10px 24px', borderRadius: '12px',
                                color: activeTab === 'monthly' ? 'white' : 'var(--color-text-muted)',
                                cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <FileText size={16} /> Monthly Reviews
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'overview' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                    {/* Efficiency Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, marginBottom: '0.5rem' }}>
                                <TrendingUp size={18} color="var(--color-secondary)" /> Efficiency Score
                            </h3>
                            <span style={{ fontSize: '3.5rem', fontWeight: '800', color: efficiency > 80 ? '#10b981' : '#f59e0b', lineHeight: 1 }}>{efficiency}%</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>All Time Performance</span>
                        </div>
                        <div style={{ height: '32px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden', display: 'flex', marginBottom: '1.5rem' }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${efficiency}%` }} transition={{ duration: 1 }} style={{ background: 'linear-gradient(90deg, #10b981, #34d399)', height: '100%' }} />
                            <div style={{ flex: 1, background: '#ef4444' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> {totalConsumed} Consumed</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /> {totalWasted} Wasted</div>
                        </div>
                    </motion.div>

                    {/* Bio-Impact Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', gridRow: 'span 2' }}>
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Activity size={20} color="#10b981" /> Bio-Impact Analysis
                        </h3>
                        {sortedBioStats.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {sortedBioStats.map((stat, index) => (
                                    <div key={stat.key}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ padding: '8px', borderRadius: '8px', background: `${stat.color}20`, color: stat.color }}><stat.icon size={18} /></div>
                                                <span style={{ fontWeight: 500 }}>{stat.label}</span>
                                            </div>
                                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{stat.count} pts</span>
                                        </div>
                                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${(stat.count / sortedBioStats[0].count) * 100}%` }} transition={{ duration: 0.8, delay: index * 0.1 }} style={{ height: '100%', borderRadius: '4px', background: stat.color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                <p>Start consuming fruit to see your bio-impact!</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Top Favorites Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <PieChart size={20} color="#3b82f6" /> Consumption Leaders
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {topFruits.map(([name, count], index) => (
                                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', borderRadius: '12px', background: index === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-text-muted)', width: '20px' }}>{index + 1}</div>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden' }}><img src={getFruitImage(name)} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                                    <div style={{ flex: 1, fontWeight: 500 }}>{name}</div>
                                    <div style={{ fontWeight: 'bold' }}>{count}</div>
                                </div>
                            ))}
                            {topFruits.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No data yet.</p>}
                        </div>
                    </motion.div>

                    {/* Badge Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', gridColumn: '1 / -1' }}>
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Award size={20} color="#f59e0b" /> Achievements
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            {badges.map(badge => (
                                <div key={badge.id} style={{ padding: '1.5rem', borderRadius: '16px', background: badge.unlocked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)', border: badge.unlocked ? `1px solid ${badge.color}` : '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', opacity: badge.unlocked ? 1 : 0.4, filter: badge.unlocked ? 'none' : 'grayscale(100%)' }}>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{badge.icon}</div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.5rem' }}>{badge.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{badge.desc}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '3rem' }}>
                    {monthlyData.length > 0 ? monthlyData.map(month => (
                        <div key={month.displayName}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                                <button
                                    onClick={() => handleDownloadPDF(month)}
                                    className="btn btn-primary"
                                    style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem' }}
                                >
                                    <Download size={16} /> Download {month.displayName} Report (PDF)
                                </button>
                            </div>
                            <div style={{ overflowX: 'auto', paddingBottom: '20px' }}> {/* Horizontal Scroll safety for mobile */}
                                <MonthlyReportCard data={month} id={`report-${month.month}-${month.year}`} />
                            </div>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
                            <p>No historical data sufficient for a monthly report yet.</p>
                            <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>Reports are generated automatically as you log fruit.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReportsView;
