import React, { useState } from 'react';
import { X, Home, ArrowRight, Share2, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './HouseholdModal.css';

const HouseholdModal = ({ isOpen, onClose }) => {
    const { userProfile, createHousehold, joinHousehold, leaveHousehold } = useAuth();
    const [mode, setMode] = useState('menu'); // menu, create, join
    const [inputName, setInputName] = useState('');
    const [inputCode, setInputCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isMember = !!userProfile?.householdId;

    if (!isOpen) return null;

    const handleCreate = async () => {
        setLoading(true);
        setError(null);
        try {
            await createHousehold(inputName);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        setLoading(true);
        setError(null);
        try {
            await joinHousehold(inputCode);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLeave = async () => {
        if (window.confirm("Are you sure? You will lose access to the family fridge.")) {
            await leaveHousehold();
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <button className="modal-close" onClick={onClose}><X size={24} /></button>

                <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Home className="text-primary" /> Family Mode
                </h2>

                {error && <div className="error-banner">{error}</div>}

                {/* VIEW: LOGGED IN MEMBER */}
                {isMember ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '16px',
                            padding: '2rem',
                            marginBottom: '2rem'
                        }}>
                            <h3 style={{ color: '#3b82f6', marginBottom: '0.5rem' }}>You are Home 🏠</h3>
                            <p style={{ color: 'var(--color-text-muted)' }}>Sharing fridge inventory with family.</p>
                        </div>

                        <button
                            className="btn btn-secondary"
                            onClick={handleLeave}
                            style={{ width: '100%', color: '#ef4444' }}
                        >
                            Leave Household
                        </button>
                    </div>
                ) : (
                    <>
                        {/* VIEW: MAIN MENU */}
                        {mode === 'menu' && (
                            <div className="household-options">
                                <button className="option-card" onClick={() => setMode('create')}>
                                    <div className="icon-box add">Start New Household</div>
                                    <p>Create a shared space for your family.</p>
                                </button>
                                <button className="option-card" onClick={() => setMode('join')}>
                                    <div className="icon-box join">Join Existing</div>
                                    <p>Enter a code to join your family.</p>
                                </button>
                            </div>
                        )}

                        {/* VIEW: CREATE */}
                        {mode === 'create' && (
                            <div>
                                <h3 style={{ marginBottom: '1rem' }}>Name your household</h3>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. The Pleasant Family"
                                    value={inputName}
                                    onChange={e => setInputName(e.target.value)}
                                    autoFocus
                                />
                                <div className="actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                    <button className="btn btn-secondary" onClick={() => setMode('menu')}>Back</button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleCreate}
                                        disabled={!inputName || loading}
                                        style={{ flex: 1 }}
                                    >
                                        {loading ? 'Creating...' : 'Create Household'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* VIEW: JOIN */}
                        {mode === 'join' && (
                            <div>
                                <h3 style={{ marginBottom: '1rem' }}>Enter Invite Code</h3>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. ABC123"
                                    value={inputCode}
                                    onChange={e => setInputCode(e.target.value.toUpperCase())}
                                    maxLength={6}
                                    style={{ letterSpacing: '2px', textAlign: 'center', fontSize: '1.2rem', textTransform: 'uppercase' }}
                                    autoFocus
                                />
                                <div className="actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                    <button className="btn btn-secondary" onClick={() => setMode('menu')}>Back</button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleJoin}
                                        disabled={inputCode.length < 6 || loading}
                                        style={{ flex: 1 }}
                                    >
                                        {loading ? 'Joining...' : 'Join Family'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            <style>{`
                .household-options { display: flex; flex-direction: column; gap: 1rem; }
                .option-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    padding: 1.5rem;
                    border-radius: 16px;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: var(--color-text);
                }
                .option-card:hover {
                    background: rgba(255,255,255,0.07);
                    transform: translateX(5px);
                }
                .icon-box {
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    font-size: 1.1rem;
                }
                .icon-box.add { color: #10b981; }
                .icon-box.join { color: #f59e0b; }
            `}</style>
        </div>
    );
};

export default HouseholdModal;
