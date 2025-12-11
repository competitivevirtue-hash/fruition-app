import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Settings, LogOut, ChevronLeft, AlertTriangle, Mail, Shield, Lock, Clock, Globe } from 'lucide-react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { BADGES } from '../utils/fruitUtils';
import { useAuth } from '../context/AuthContext';
import { useFruit } from '../context/FruitContext.jsx';
import HistoryView from './HistoryView';
import './BioModal.css';
const ProfileModal = ({ isOpen, onClose }) => {
    const { currentUser, userProfile, logout, login, signup, deleteAccount, loginWithApple, claimFounderStatus, updateUserSettings, isAdmin, resetPassword } = useAuth();
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [view, setView] = useState('main'); // 'main' or 'settings'

    // Form State (Restoring missing state that caused crash)
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Badges Logic
    const { getStats } = useFruit();
    const [stats, setStats] = useState({ consumed: [], wasted: [] });

    useEffect(() => {
        if (isOpen) {
            getStats()
                .then(setStats)
                .catch(error => console.warn("Failed to load stats for profile:", error));
        }
    }, [isOpen, getStats]);

    // Calculate metrics for badges
    const totalConsumed = stats.consumed.reduce((acc, curr) => acc + (curr.amount || 1), 0);
    const totalWasted = stats.wasted.reduce((acc, curr) => acc + (curr.amount || 1), 0);
    const totalProcessed = totalConsumed + totalWasted;
    const efficiency = totalProcessed > 0 ? Math.round((totalConsumed / totalProcessed) * 100) : 100;

    // Check badges
    const userBadges = (BADGES || []).map(b => {
        try {
            return {
                ...b,
                unlocked: b.condition ? b.condition({ totalConsumed, totalWasted, totalProcessed, efficiency }) : false
            };
        } catch (error) {
            console.warn("Badge condition failed:", error);
            return { ...b, unlocked: false };
        }
    });

    // ... existing state

    // ... inside render ...
    <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
        {/* ... existing user card content ... */}
    </div>

    {/* Badges Section */ }
    <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--color-text)' }}>Earned Badges</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {userBadges.map(badge => (
                <div key={badge.id}
                    title={badge.unlocked ? badge.name : 'Locked'}
                    style={{
                        aspectRatio: '1',
                        background: badge.unlocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem',
                        border: badge.unlocked ? `1px solid ${badge.color}` : '1px solid transparent',
                        filter: badge.unlocked ? 'none' : 'grayscale(100%) opacity(0.5)',
                        cursor: 'help'
                    }}
                >
                    {badge.icon}
                </div>
            ))}
        </div>
    </div>

    const handleGoogleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            onClose();
        } catch (error) {
            console.error("Error signing in with Google:", error);
            setError("Failed to sign in. Please try again.");
        }
    };

    const handleAppleSignIn = async () => {
        try {
            await loginWithApple();
            onClose();
        } catch (error) {
            console.error("Error signing in with Apple:", error);
            setError("Failed to sign in with Apple. Please try again.");
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegistering) {
                await signup(email, password, name);
            } else {
                await login(email, password);
            }
            onClose();
        } catch (error) {
            setError(error.message);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        try {
            await logout();
            onClose();
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="modal-content"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '450px' }}
                    >
                        <button className="close-btn" onClick={onClose}>
                            <X size={24} />
                        </button>

                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                color: 'white',
                                overflow: 'hidden'
                            }}>
                                {currentUser?.photoURL ? (
                                    <img src={currentUser.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={40} />
                                )}
                            </div>

                            {currentUser ? (
                                <>
                                    {view === 'main' ? (
                                        <>
                                            <h2 className="text-gradient" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                                                Welcome back, {currentUser.displayName?.split(' ')[0] || 'User'}!
                                            </h2>
                                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                                                {currentUser.email}
                                            </p>

                                            <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                                {/* Secret Founder Claim Trigger (Double Click Member ID area?) - For now just a small button for the user to click once */}
                                                {userProfile?.memberId !== 1 && (
                                                    <button
                                                        onClick={claimFounderStatus}
                                                        style={{ position: 'absolute', top: 5, right: 5, opacity: 0.1, cursor: 'default' }}
                                                        title="Claim Founder Status"
                                                    >
                                                        👑
                                                    </button>
                                                )}
                                                <p style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                                                    "Seeing your health come to fruition."
                                                </p>
                                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', fontWeight: '600', marginBottom: '0.25rem' }}>
                                                    Member #{userProfile?.memberId ? userProfile.memberId.toLocaleString() : 'PENDING'}
                                                </p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                    Joined {currentUser.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '2025'}
                                                </p>
                                            </div>

                                            {/* Badges Display */}
                                            <div style={{ marginBottom: '2rem' }}>
                                                <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Achievements</h3>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                                    {userBadges.map(badge => (
                                                        <div key={badge.id} style={{ textAlign: 'center' }}>
                                                            <div
                                                                title={badge.description}
                                                                style={{
                                                                    aspectRatio: '1',
                                                                    background: badge.unlocked ? `linear-gradient(135deg, ${badge.color}20, transparent)` : 'rgba(255,255,255,0.02)',
                                                                    borderRadius: '16px',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    fontSize: '1.8rem',
                                                                    border: badge.unlocked ? `1px solid ${badge.color}` : '1px solid rgba(255,255,255,0.05)',
                                                                    filter: badge.unlocked ? 'drop-shadow(0 0 10px rgba(0,0,0,0.2))' : 'grayscale(100%) opacity(0.3)',
                                                                    position: 'relative',
                                                                    overflow: 'hidden',
                                                                    cursor: 'help',
                                                                    marginBottom: '6px'
                                                                }}
                                                            >
                                                                {badge.icon}
                                                                {badge.unlocked && <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at center, ${badge.color}40 0%, transparent 70%)` }} />}
                                                            </div>
                                                            <span style={{ fontSize: '0.65rem', color: badge.unlocked ? 'var(--color-text)' : 'var(--color-text-muted)', fontWeight: badge.unlocked ? 600 : 400 }}>
                                                                {badge.name}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <button
                                                    className="btn"
                                                    onClick={() => setView('settings')}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        color: 'var(--color-text)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.75rem',
                                                        fontSize: '1rem',
                                                        fontWeight: 500,
                                                        border: '1px solid rgba(255,255,255,0.1)'
                                                    }}
                                                >
                                                    <Settings size={18} />
                                                    Account Settings
                                                </button>

                                                <button
                                                    className="btn"
                                                    onClick={handleLogout}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        color: '#ef4444',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.75rem',
                                                        fontSize: '1rem',
                                                        fontWeight: 600,
                                                        border: '1px solid rgba(239, 68, 68, 0.2)'
                                                    }}
                                                >
                                                    <LogOut size={18} />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </>
                                    ) : view === 'settings' ? (
                                        <div className="settings-view">
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', cursor: 'pointer' }} onClick={() => setView('main')}>
                                                <ChevronLeft size={20} />
                                                <span style={{ marginLeft: '0.5rem', fontWeight: 600 }}>Back to Profile</span>
                                            </div>

                                            <h3 style={{ marginBottom: '1rem', color: 'var(--color-text)', fontSize: '1.2rem' }}>Settings</h3>

                                            {/* Admin Nexus Link */}
                                            {isAdmin && (
                                                <button
                                                    onClick={() => {
                                                        onClose();
                                                        window.location.hash = '/admin';
                                                    }}
                                                    className="btn"
                                                    style={{
                                                        width: '100%',
                                                        padding: '16px',
                                                        background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                                                        color: 'white',
                                                        display: 'flex', alignItems: 'center', gap: '1rem',
                                                        fontSize: '1rem', fontWeight: 700,
                                                        border: 'none',
                                                        marginBottom: '1.5rem',
                                                        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
                                                    }}
                                                >
                                                    <Shield size={20} />
                                                    Administrator Nexus
                                                </button>
                                            )}

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {/* Time & Region */}
                                                <button
                                                    onClick={() => setView('localization')}
                                                    style={{
                                                        padding: '16px',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        borderRadius: '12px',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        color: 'var(--color-text)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        cursor: 'pointer',
                                                        fontSize: '1rem'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <Clock size={18} color="var(--color-primary)" />
                                                        <span>Time & Region</span>
                                                    </div>
                                                    <ChevronLeft size={16} style={{ transform: 'rotate(180deg)', opacity: 0.5 }} />
                                                </button>

                                                {/* Security & Data */}
                                                <button
                                                    onClick={() => setView('security')}
                                                    style={{
                                                        padding: '16px',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        borderRadius: '12px',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        color: 'var(--color-text)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        cursor: 'pointer',
                                                        fontSize: '1rem'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <Lock size={18} color="var(--color-primary)" />
                                                        <span>Security & Data</span>
                                                    </div>
                                                    <ChevronLeft size={16} style={{ transform: 'rotate(180deg)', opacity: 0.5 }} />
                                                </button>
                                            </div>
                                        </div>

                                    ) : view === 'localization' ? (
                                        <div className="sub-settings-view">
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', cursor: 'pointer' }} onClick={() => setView('settings')}>
                                                <ChevronLeft size={20} />
                                                <span style={{ marginLeft: '0.5rem', fontWeight: 600 }}>Back to Settings</span>
                                            </div>

                                            <h3 style={{ marginBottom: '1.5rem' }}>Time & Region</h3>

                                            <div className="form-group" style={{ marginBottom: '2rem', textAlign: 'left' }}>
                                                <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Time Format</label>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                    {['h12', 'h23'].map(format => {
                                                        const isActive = (userProfile?.settings?.hourCycle || 'h12') === format;
                                                        return (
                                                            <button
                                                                key={format}
                                                                onClick={() => updateUserSettings({ hourCycle: format })}
                                                                style={{
                                                                    padding: '12px',
                                                                    borderRadius: '10px',
                                                                    background: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                                                                    color: isActive ? 'white' : 'var(--color-text-muted)',
                                                                    border: isActive ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s',
                                                                    fontWeight: isActive ? 600 : 400
                                                                }}
                                                            >
                                                                {format === 'h12' ? '12-Hour (AM/PM)' : '24-Hour (13:00)'}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                            <div className="form-group" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                                                <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Time Zone</label>
                                                <div style={{ position: 'relative' }}>
                                                    <Globe size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                                    <select
                                                        value={userProfile?.settings?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                                                        onChange={(e) => updateUserSettings({ timeZone: e.target.value })}
                                                        style={{
                                                            width: '100%',
                                                            padding: '12px 12px 12px 40px',
                                                            borderRadius: '10px',
                                                            background: 'rgba(255,255,255,0.05)',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            color: 'var(--color-text)',
                                                            appearance: 'none'
                                                        }}
                                                    >
                                                        {[
                                                            Intl.DateTimeFormat().resolvedOptions().timeZone,
                                                            'UTC',
                                                            'America/New_York',
                                                            'America/Los_Angeles',
                                                            'Europe/London',
                                                            'Asia/Tokyo'
                                                        ].filter((v, i, a) => a.indexOf(v) === i).map(tz => (
                                                            <option key={tz} value={tz}>{tz}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                                    Detected: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                                                </p>
                                            </div>
                                        </div>

                                    ) : view === 'security' ? (
                                        <div className="sub-settings-view">
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', cursor: 'pointer' }} onClick={() => setView('settings')}>
                                                <ChevronLeft size={20} />
                                                <span style={{ marginLeft: '0.5rem', fontWeight: 600 }}>Security & Data</span>
                                            </div>

                                            <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                                <h3 style={{ fontSize: '1rem', color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <AlertTriangle size={18} /> Danger Zone
                                                </h3>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                                    Permanently delete your account and all associated data. This action is irreversible and will wipe your stats, inventory, and badges immediately.
                                                </p>
                                                <button
                                                    className="btn"
                                                    onClick={async () => {
                                                        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                                                            try {
                                                                await deleteAccount();
                                                                onClose();
                                                            } catch (error) {
                                                                console.error("Error deleting account:", error);
                                                                if (error.code === 'auth/requires-recent-login') {
                                                                    alert("For security, please sign out and sign in again before deleting your account.");
                                                                } else {
                                                                    alert("Failed to delete account. " + error.message);
                                                                }
                                                            }
                                                        }
                                                    }}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '0.75rem',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 600,
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                                                    }}
                                                >
                                                    Delete Account
                                                </button>
                                            </div>
                                        </div>
                                    ) : view === 'history' ? (
                                        <div className="history-view">
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', cursor: 'pointer' }} onClick={() => setView('main')}>
                                                <ChevronLeft size={20} />
                                                <span style={{ marginLeft: '0.5rem', fontWeight: 600 }}>Back to Profile</span>
                                            </div>
                                            <HistoryView />
                                        </div>
                                    ) : null}
                                </>
                            ) : (
                                <>
                                    <h2 className="text-gradient" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                                        {showEmailForm ? (isRegistering ? 'Create Account' : 'Welcome Back') : 'Welcome to Fruition'}
                                    </h2>
                                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                                        {showEmailForm ? 'Enter your details below' : 'Sign in to sync your data across devices'}
                                    </p>

                                    {error && (
                                        <p style={{ color: '#ff4d4d', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                            {error}
                                        </p>
                                    )}

                                    {/* Combined Login Flow */}
                                    <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {isRegistering && (
                                            <input
                                                type="text"
                                                placeholder="Name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="input-field"
                                                required
                                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)' }}
                                            />
                                        )}
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="input-field"
                                            required
                                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)' }}
                                        />
                                        <input
                                            type="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="input-field"
                                            required
                                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)' }}
                                        />

                                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '12px', marginTop: '0.5rem' }}>
                                            {loading ? 'Loading...' : (isRegistering ? 'Create Account' : 'Sign In')}
                                        </button>

                                        {!isRegistering && (
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (!email) {
                                                        setError("Please enter your email address first.");
                                                        return;
                                                    }
                                                    try {
                                                        await resetPassword(email);
                                                        alert(`Password reset email sent to ${email}`);
                                                        setError('');
                                                    } catch (error) {
                                                        console.error(error);
                                                        setError("Failed to send reset email. " + error.message);
                                                    }
                                                }}
                                                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'right', marginTop: '-0.5rem' }}
                                            >
                                                Forgot Password?
                                            </button>
                                        )}
                                    </form>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
                                        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>OR</span>
                                        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <button
                                            className="btn"
                                            onClick={handleGoogleSignIn}
                                            style={{ width: '100%', padding: '12px', background: 'white', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1rem', fontWeight: 500, border: 'none' }}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" /><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" /><path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z" /><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" /></svg>
                                            Sign in with Google
                                        </button>

                                        <button
                                            className="btn"
                                            onClick={handleAppleSignIn}
                                            style={{ width: '100%', padding: '12px', background: 'white', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1rem', fontWeight: 500, border: 'none' }}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 384 512" style={{ marginTop: '-2px' }}><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" /></svg>
                                            Sign in with Apple
                                        </button>

                                        <button
                                            className="btn"
                                            onClick={onClose}
                                            style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1rem', fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)' }}
                                        >
                                            <LogOut size={18} />
                                            Continue as Guest
                                        </button>
                                    </div>

                                    <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                                        {isRegistering ? 'Already have an account? ' : 'Need an account? '}
                                        <button type="button" onClick={() => setIsRegistering(!isRegistering)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}>
                                            {isRegistering ? 'Log In' : 'Sign Up'}
                                        </button>
                                    </div>

                                    <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                                        By signing in, you agree to our Terms of Service and Privacy Policy
                                    </p>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProfileModal;

