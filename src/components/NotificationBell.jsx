import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationBell = () => {
    const {
        unreadCount,
        notifications,
        markAllAsRead,
        markAsRead,
        clearAll,
        requestPermission,
        permission
    } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (permission === 'default') {
            requestPermission();
        }
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={handleToggle}
                className="btn-icon"
                style={{
                    position: 'relative',
                    background: 'var(--glass-background)',
                    border: '1px solid var(--glass-border)',
                    padding: '10px',
                    borderRadius: '50%',
                    color: 'var(--color-text)',
                    cursor: 'pointer'
                }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: '120%',
                            width: '320px',
                            maxHeight: '400px',
                            background: 'var(--color-surface)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                            zIndex: 1000,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1rem',
                            borderBottom: '1px solid var(--glass-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(0,0,0,0.2)'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-text)' }}>Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--color-primary)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <Check size={14} /> Mark read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    <Bell size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}>No new alerts</p>
                                </div>
                            ) : (
                                notifications.map(note => (
                                    <div
                                        key={note.id}
                                        onClick={() => markAsRead(note.id)}
                                        style={{
                                            padding: '1rem',
                                            marginBottom: '0.5rem',
                                            borderRadius: '12px',
                                            background: note.read ? 'transparent' : 'rgba(var(--color-primary-rgb), 0.05)',
                                            borderLeft: note.read ? '3px solid transparent' : `3px solid ${getTypeColor(note.type)}`,
                                            cursor: 'pointer',
                                            transition: 'background 0.2s'
                                        }}
                                        className="notification-item"
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <strong style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>{note.title}</strong>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                                {getTimeAgo(note.timestamp)}
                                            </span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{note.body}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div style={{ padding: '0.5rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
                                <button
                                    onClick={clearAll}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--color-text-muted)',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        margin: '0 auto'
                                    }}
                                >
                                    <Trash2 size={14} /> Clear History
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
            <style sx>{`
                .notification-item:hover {
                    background: rgba(255,255,255,0.05) !important;
                }
            `}</style>
        </div>
    );
};

const getTypeColor = (type) => {
    switch (type) {
        case 'warning': return '#f59e0b';
        case 'danger': return '#ef4444';
        case 'success': return '#10b981';
        default: return '#3b82f6';
    }
};

const getTimeAgo = (dateString) => {
    const minutes = Math.floor((new Date() - new Date(dateString)) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return '1d+';
};

export default NotificationBell;
