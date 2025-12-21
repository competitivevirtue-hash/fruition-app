import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Star, Zap, Crown, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SubscriptionModal = ({ isOpen, onClose }) => {
    const { userProfile, upgradeSubscription, cancelSubscription } = useAuth();
    const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'
    const [loading, setLoading] = useState(false);

    const isPremium = userProfile?.subscription?.status === 'premium';
    const currentPlan = userProfile?.subscription?.plan;

    const handleSubscribe = async (plan) => {
        setLoading(true);
        try {
            // Simulator delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            await upgradeSubscription(plan);
            // Success animation or just close? Close for now, maybe confetti later
            onClose();
            alert("Welcome to Fruition Premium! 🌟");
        } catch (error) {
            alert("Subscription failed. Please try again.");
        }
        setLoading(false);
    };

    const handleCancel = async () => {
        if (window.confirm("Are you sure you want to stop auto-renewal?\n\nYou will keep your Premium benefits until the end of the current billing period.")) {
            setLoading(true);
            try {
                await cancelSubscription();
                alert("Auto-renewal cancelled. You still have access until the period ends.");
            } catch (error) {
                alert("Cancellation failed.");
            }
            setLoading(false);
        }
    };

    const handleResume = async () => {
        setLoading(true);
        try {
            await upgradeSubscription(currentPlan || 'monthly'); // Re-enable with same plan
            alert("Auto-renewal resumed! Your benefits will continue uninterrupted.");
        } catch (error) {
            alert("Failed to resume subscription.");
        }
        setLoading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="modal-overlay"
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, backdropFilter: 'blur(8px)'
                        }}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="glass-panel"
                        style={{
                            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto',
                            zIndex: 1101, padding: 0, border: '1px solid rgba(255,215,0,0.3)',
                            background: 'linear-gradient(145deg, rgba(20,20,30,0.95), rgba(10,10,20,0.98))',
                            boxShadow: '0 0 50px rgba(255, 215, 0, 0.1)'
                        }}
                    >
                        <button onClick={onClose} className="icon-btn" style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                            <X size={24} />
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', md: '1fr 1fr' }}>
                            {/* Left Side: Pitch */}
                            <div style={{ padding: '3rem 2rem', background: 'radial-gradient(circle at top left, rgba(255,215,0,0.05), transparent)' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(255,215,0,0.1)', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1.5rem', border: '1px solid rgba(255,215,0,0.2)' }}>
                                    <Crown size={14} /> FRUITION PREMIUM
                                </div>
                                <h2 className="text-gradient" style={{ fontSize: '2.5rem', lineHeight: 1.1, marginBottom: '1.5rem', background: 'linear-gradient(135deg, #fff, #fbbf24)' }}>
                                    Unlock your full<br />potential.
                                </h2>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                                    Take control of your nutrition and inventory with advanced tools designed for the power user.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {[
                                        'Unlimited Inventory Items',
                                        'Advanced Nutrient Analytics',
                                        'Priority Support',
                                        'Automated Shopping Lists',
                                        'Family/Household Sharing'
                                    ].map((feat, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text)' }}>
                                            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '4px', borderRadius: '50%', color: '#10b981' }}>
                                                <Check size={14} />
                                            </div>
                                            {feat}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Side: Pricing */}
                            <div style={{ padding: '3rem 2rem', borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>

                                {isPremium ? (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                        <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #fbbf24, #d97706)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(251, 191, 36, 0.3)' }}>
                                            <Crown size={40} color="white" />
                                        </div>
                                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>You are Premium!</h3>
                                        {userProfile?.subscription?.cancelAtPeriodEnd ? (
                                            <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                                <p style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '0.5rem' }}>Cancellation Scheduled</p>
                                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                                    Your benefits end on<br />
                                                    <span style={{ color: 'white', fontWeight: 'bold' }}>{new Date(userProfile?.subscription?.renewsAt).toLocaleDateString()}</span>
                                                </p>
                                            </div>
                                        ) : (
                                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                                                Your {currentPlan} plan is active.<br />
                                                Renews on {new Date(userProfile?.subscription?.renewsAt).toLocaleDateString()}
                                            </p>
                                        )}

                                        {userProfile?.subscription?.cancelAtPeriodEnd ? (
                                            <button
                                                onClick={handleResume}
                                                disabled={loading}
                                                className="btn"
                                                style={{
                                                    width: '100%', padding: '16px', borderRadius: '12px',
                                                    background: '#10b981', color: 'white',
                                                    fontWeight: 'bold', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                                                    cursor: loading ? 'not-allowed' : 'pointer', border: 'none'
                                                }}
                                            >
                                                {loading ? 'Processing...' : 'Resume Auto-Renewal'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleCancel}
                                                disabled={loading}
                                                className="btn"
                                                style={{
                                                    width: '100%', padding: '16px', borderRadius: '12px',
                                                    background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                                                    border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 'bold',
                                                    cursor: loading ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                {loading ? 'Processing...' : 'Cancel Subscription'}
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', marginBottom: '2rem' }}>
                                            <button
                                                onClick={() => setBillingCycle('monthly')}
                                                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: billingCycle === 'monthly' ? 'var(--color-surface)' : 'transparent', color: billingCycle === 'monthly' ? 'var(--color-text)' : 'var(--color-text-muted)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                Monthly
                                            </button>
                                            <button
                                                onClick={() => setBillingCycle('annual')}
                                                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: billingCycle === 'annual' ? 'var(--color-surface)' : 'transparent', color: billingCycle === 'annual' ? 'var(--color-text)' : 'var(--color-text-muted)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
                                            >
                                                Annual
                                                <span style={{ position: 'absolute', top: -8, right: -4, background: '#10b981', color: 'white', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '10px' }}>SAVE 20%</span>
                                            </button>
                                        </div>

                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {/* Plan Card */}
                                            <div
                                                style={{
                                                    padding: '1.5rem', borderRadius: '16px',
                                                    border: '2px solid rgba(255, 215, 0, 0.3)',
                                                    background: 'rgba(255, 215, 0, 0.05)',
                                                    position: 'relative',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)', background: '#fbbf24', color: 'black', fontSize: '0.7rem', fontWeight: 'bold', padding: '4px 12px', borderRadius: '12px' }}>
                                                    MOST POPULAR
                                                </div>
                                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fbbf24' }}>
                                                    {billingCycle === 'annual' ? 'Annual Plan' : 'Monthly Plan'}
                                                </h3>
                                                <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                                                    {billingCycle === 'annual' ? '$49.99' : '$4.99'}
                                                    <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: '400' }}>/{billingCycle === 'annual' ? 'yr' : 'mo'}</span>
                                                </div>
                                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                                    {billingCycle === 'annual' ? 'Billed annually ($4.16/mo)' : 'Cancel anytime'}
                                                </p>

                                                <button
                                                    onClick={() => handleSubscribe(billingCycle)}
                                                    disabled={loading}
                                                    className="btn"
                                                    style={{
                                                        width: '100%', padding: '16px', borderRadius: '12px',
                                                        background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                                                        color: 'white', fontWeight: '800', fontSize: '1.1rem',
                                                        border: 'none', boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4)',
                                                        cursor: loading ? 'not-allowed' : 'pointer'
                                                    }}
                                                >
                                                    {loading ? 'Processing...' : 'Start Premium'}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SubscriptionModal;
