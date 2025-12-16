
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { db } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc, getCountFromServer, limit, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AdminWorldMap from '../components/AdminWorldMap';
import YearInFruit from '../components/YearInFruit';
import { Users, Search, Shield, AlertTriangle, Ban, CheckCircle, Activity, Lock, ChevronLeft, Bell, Globe, Zap } from 'lucide-react';

const AdminDashboard = () => {
    const { currentUser, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ totalUsers: 0, founders: 1, status: 'Operational' });
    const [selectedUser, setSelectedUser] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [showYearInFruit, setShowYearInFruit] = useState(false);

    const [showSafeMode, setShowSafeMode] = useState(true); // Prevents accidental self-bans
    const [logs, setLogs] = useState([]);
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'logs'

    // Security Check
    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    // Fetch Global Stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const usersColl = collection(db, 'users');
                const snapshot = await getCountFromServer(usersColl);

                // Also get banned count
                const bannedQ = query(usersColl, where('disabled', '==', true));
                const bannedSnap = await getCountFromServer(bannedQ);

                setStats(prev => ({
                    ...prev,
                    totalUsers: snapshot.data().count,
                    bannedUsers: bannedSnap.data().count
                }));

                // Fetch Active Today
                const yesterday = new Date();
                yesterday.setHours(yesterday.getHours() - 24);
                const activeQ = query(usersColl, where('lastActive', '>', yesterday)); // Firestore will auto-convert Date to Timestamp in queries usually, but explicit Timestamp is safer if imported
                const activeSnap = await getCountFromServer(activeQ);

                setStats(prev => ({
                    ...prev,
                    activeToday: activeSnap.data().count
                }));
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            }
        };
        if (isAdmin) fetchStats();
    }, [isAdmin]);

    // Fetch Logs
    useEffect(() => {
        if (!isAdmin || activeTab !== 'logs') return;

        const logsRef = collection(db, 'system_logs');
        const q = query(logsRef, orderBy('timestamp', 'desc'), limit(50));

        const fetchLogs = async () => {
            const snapshot = await getDocs(q);
            setLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        };

        fetchLogs();
        // Optional: could turn this into onSnapshot for real-time, but getDocs is safer for reads
    }, [isAdmin, activeTab]);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();

        setLoading(true);
        setSearchResults([]);

        try {
            let q;
            const usersRef = collection(db, 'users');

            if (searchTerm.trim()) {
                // Email Search
                q = query(usersRef, where('email', '>=', searchTerm), where('email', '<=', searchTerm + '\uf8ff'), limit(5));
            } else {
                // If empty search, verify if we want to show Banned users only
                // This is a "List Banned" feature
                q = query(usersRef, where('disabled', '==', true), limit(20));
            }

            const snaps = await getDocs(q);
            const results = [];
            snaps.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
            setSearchResults(results);

            if (!searchTerm.trim() && results.length === 0) {
                // Only show alert if we were explicitly looking for banned users and found none
                // alert("No banned users found."); 
            }

        } catch (error) {
            console.error("Search failed:", error);
            alert("Search failed. Check console.");
        }
        setLoading(false);
    };

    const toggleBan = async (user) => {
        // 1. Founder Immunity Check (Frontend)
        if (user.memberId === 1 || user.email === 'paytonpleasanti@gmail.com') {
            alert("⚠️ CORE SECURITY ALERT ⚠️\n\nYou cannot ban the Founder/Root Administrator.\nThis action has been blocked by protocol.");
            return;
        }

        if (user.id === currentUser.uid) {
            alert("⚠️ SECURITY WARNING ⚠️\n\nYou are attempting to ban yourself.\nThis action is prevented to avoid lockout.");
            return;
        }

        if (!window.confirm(`CONFIRMATION REQUIRED\n\nAre you sure you want to ${user.disabled ? 'UNBAN' : 'BAN'} ${user.email}?\n\nThis will ${user.disabled ? 'restore' : 'revoke'} their access immediately.`)) return;

        try {
            await updateDoc(doc(db, 'users', user.id), {
                disabled: !user.disabled
            });

            // Update local state
            setSearchResults(prev => prev.map(u =>
                u.id === user.id ? { ...u, disabled: !user.disabled } : u
            ));

            // Refresh stats to update banned count
            setStats(prev => ({
                ...prev,
                bannedUsers: user.disabled ? (prev.bannedUsers - 1) : (prev.bannedUsers + 1)
            }));

        } catch (error) {
            console.error("Ban action failed:", error);
            alert("Action failed: " + error.message);
        }
    };

    // DANGEROUS: Reset Member ID Counter
    const handleResetCounter = async () => {
        const confirmPhrase = "RESET ZERO";
        const input = prompt(`⚠️ EXTREME DANGER ⚠️\n\nThis will reset the Global Member ID Counter to 0.\nThe next person to sign up will become Member #1.\n\nType "${confirmPhrase}" to confirm:`);

        if (input !== confirmPhrase) {
            if (input !== null) alert("Confirmation failed.");
            return;
        }

        try {
            await updateDoc(doc(db, 'system', 'stats'), {
                totalUsers: 0
            });
            alert("✅ SUCCESS: Counter reset to 0.\n\nNext signup will be Member #1.");
            // Refresh stats
            setStats(prev => ({ ...prev, totalUsers: 0 }));
        } catch (error) {
            console.error("Reset failed:", error);
            // Try creating it if it doesn't exist
            try {
                // Try setDoc if update failed (need to import setDoc but avoiding huge imports, assume doc exists for now or error out)
                alert("Failed to update 'system/stats'. Ensure the document exists.");
            } catch (e) {
                alert("Critical failure: " + error.message);
            }
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="admin-dashboard" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: 'var(--color-text)', minHeight: '100vh' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button
                        onClick={() => navigate('/')}
                        className="btn"
                        style={{ padding: '8px', background: 'var(--glass-background)', borderRadius: '12px', color: 'var(--color-text)' }}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '10px', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', borderRadius: '12px', boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)' }}>
                            <Shield size={28} color="white" />
                        </div>
                        <div>
                            <h1 className="text-gradient" style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800 }}>Administrator Nexus</h1>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Lock size={12} /> Restricted Access • God Mode
                            </p>
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="btn" style={{ padding: '10px', background: 'var(--glass-background)', borderRadius: '50%' }}>
                        <Bell size={20} color="var(--color-text)" />
                    </button>
                    <div style={{ fontSize: '0.9rem', color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <div style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 10px #ef4444' }} /> LIVE SYSTEM
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '20px', background: 'var(--glass-background)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Users</span>
                        <Users size={20} color="#3b82f6" />
                    </div>
                    <div className="text-glow" style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-text)' }}>{stats.totalUsers.toLocaleString()}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '20px', background: 'var(--glass-background)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Banned entities</span>
                        <Ban size={20} color="#ef4444" />
                    </div>
                    <div className="text-glow" style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-text)', textShadow: '0 0 20px rgba(239,68,68,0.5)' }}>{stats?.bannedUsers || 0}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '20px', background: 'var(--glass-background)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>System Status</span>
                        <Activity size={20} color="#10b981" />
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={20} /> {stats.status}
                    </div>
                </div>
                <div
                    className="glass-panel"
                    onClick={() => setShowMap(true)}
                    style={{
                        padding: '1.5rem',
                        borderRadius: '20px',
                        background: 'var(--glass-background)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        ':hover': { transform: 'scale(1.02)' }
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Global Pulse</span>
                        <Activity size={20} color="#f59e0b" />
                    </div>
                    {/* Reuse stats active count if available, or fetch it? */}
                    {/* For now just static label or reuse admin stats if shared. dashboard doesn't have stats prop usually. */}
                    <div className="text-glow" style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-text)' }}>Active Network</div>
                    <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Globe size={12} /> View Map
                    </div>
                </div>

                {/* YEAR IN FRUIT TRIGGER */}
                <div
                    className="glass-panel"
                    onClick={() => setShowYearInFruit(true)}
                    style={{
                        padding: '1.5rem',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #FF6B6B 0%, #845EC2 100%)', // Distinct gradient
                        border: '1px solid rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        boxShadow: '0 4px 15px rgba(132, 94, 194, 0.4)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', position: 'relative', zIndex: 2 }}>
                        <span style={{ color: 'white', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>2025 WRAPPED</span>
                        <Zap size={20} color="white" fill="white" />
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '900', color: 'white', position: 'relative', zIndex: 2 }}>Year In Fruit</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.5rem', position: 'relative', zIndex: 2 }}>
                        Tap to reveal stats
                    </div>

                    {/* Decorative Sparkles */}
                    <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', bottom: -10, left: -10, width: 60, height: 60, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                </div>
            </div>

            <AdminWorldMap
                isOpen={showMap}
                onClose={() => setShowMap(false)}
                activeUserCount={10} // Placeholder, logic is updated inside map
            />

            <YearInFruit
                isOpen={showYearInFruit}
                onClose={() => setShowYearInFruit(false)}
            />


            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('users')}
                    style={{
                        padding: '12px 24px',
                        background: activeTab === 'users' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                        color: activeTab === 'users' ? 'white' : 'var(--color-text-muted)',
                        borderRadius: '12px',
                        border: 'none',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    User Management
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    style={{
                        padding: '12px 24px',
                        background: activeTab === 'logs' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                        color: activeTab === 'logs' ? 'white' : 'var(--color-text-muted)',
                        borderRadius: '12px',
                        border: 'none',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    System Logs
                </button>
                <div style={{ flex: 1 }}></div>
                <button
                    onClick={handleResetCounter}
                    style={{
                        padding: '12px 24px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444',
                        borderRadius: '12px',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <AlertTriangle size={18} /> RESET MEMBER IDs
                </button>
            </div>

            {/* Main Content Area */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', minHeight: '400px' }}>
                {activeTab === 'users' ? (
                    <>
                        <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text)' }}>
                            <Search size={24} /> User Management
                        </h2>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ position: 'relative', flex: '1 1 250px' }}>
                                <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '16px 16px 16px 48px',
                                        borderRadius: '16px',
                                        background: 'var(--glass-background)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'var(--color-text)',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ padding: '16px 2.5rem', borderRadius: '16px', fontWeight: 'bold', flex: '0 1 auto' }}
                            >
                                {loading ? 'Scanning...' : 'Search'}
                            </button>
                        </form>

                        {/* Users Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--color-text-muted)' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem', color: 'var(--color-text)' }}>User</th>
                                        <th style={{ padding: '1rem', color: 'var(--color-text)' }}>Member ID</th>
                                        <th style={{ padding: '1rem', color: 'var(--color-text)' }}>Status</th>
                                        <th style={{ padding: '1rem', color: 'var(--color-text)', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {searchResults.length > 0 ? (
                                        searchResults.map(user => (
                                            <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: 'bold', color: 'var(--color-text)' }}>{user.displayName || 'Unknown'}</div>
                                                    <div style={{ fontSize: '0.8rem' }}>{user.email}</div>
                                                    <div style={{ fontSize: '0.7rem', fontFamily: 'monospace', opacity: 0.5 }}>{user.id}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>#{user.memberId}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    {user.disabled ? (
                                                        <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>BANNED</span>
                                                    ) : (
                                                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>ACTIVE</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => toggleBan(user)}
                                                        disabled={user.memberId === 1 || user.email === 'paytonpleasanti@gmail.com'}
                                                        style={{
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            border: 'none',
                                                            background: (user.memberId === 1 || user.email === 'paytonpleasanti@gmail.com') ? 'rgba(255,255,255,0.1)' : (user.disabled ? '#10b981' : '#ef4444'),
                                                            color: (user.memberId === 1 || user.email === 'paytonpleasanti@gmail.com') ? 'rgba(255,255,255,0.3)' : 'white',
                                                            cursor: (user.memberId === 1 || user.email === 'paytonpleasanti@gmail.com') ? 'not-allowed' : 'pointer',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        {user.memberId === 1 ? 'IMMUNE' : (user.disabled ? 'UNBAN' : 'BAN')}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                                {searchTerm ? 'No users found.' : 'Search for an email or leave blank to see Banned list.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text)' }}>
                            <Activity size={24} /> System Logs (Recent 50)
                        </h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem', color: 'var(--color-text)' }}>Time</th>
                                        <th style={{ padding: '1rem', color: 'var(--color-text)' }}>Level</th>
                                        <th style={{ padding: '1rem', color: 'var(--color-text)' }}>Type</th>
                                        <th style={{ padding: '1rem', color: 'var(--color-text)' }}>Message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.length > 0 ? logs.map(log => (
                                        <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                                                {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'Just now'}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    color: log.level === 'ERROR' || log.level === 'CRITICAL' ? '#ef4444' : log.level === 'WARN' ? '#f59e0b' : '#3b82f6',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {log.level}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>{log.type}</td>
                                            <td style={{ padding: '1rem', fontFamily: 'monospace' }}>
                                                {log.message}
                                                {log.metadata && <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '4px' }}>{log.metadata}</div>}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>No logs found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
