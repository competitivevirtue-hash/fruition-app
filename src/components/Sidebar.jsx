import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, Apple, Calendar, BookOpen, User, LogOut, MoreHorizontal, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import Logo from './Logo';
import NotificationBell from './NotificationBell';
import './Layout.css';

const Sidebar = ({ isOpen, onClose, currentView, onNavigate, onOpenSettings, onOpenProfile }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('sidebarCollapsed') === 'true';
    });

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', newState);
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'my-fruits', label: 'My Fruits', icon: Apple },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
        { id: 'reports', label: 'Reports', icon: TrendingUp },
        { id: 'fruitcyclopedia', label: 'Fruitcyclopedia', icon: BookOpen },
    ];

    const SidebarContent = () => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: isCollapsed ? '1.5rem 0.75rem' : '2rem', paddingTop: isMobile ? 'max(2rem, env(safe-area-inset-top))' : '2rem', transition: 'padding 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: isCollapsed ? 'center' : 'space-between', alignItems: 'center', marginBottom: '3rem', minHeight: '40px' }}>
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                    onClick={() => { onNavigate('dashboard'); if (isMobile) onClose(); }}
                >
                    <Logo size={isCollapsed ? 36 : 32} />
                    {!isCollapsed && <span className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Fruition</span>}
                </div>
                {isMobile && (
                    <button onClick={onClose} className="icon-btn" style={{ padding: '8px' }}>
                        <X size={24} />
                    </button>
                )}
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => { onNavigate(item.id); if (isMobile) onClose(); }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                                gap: '1rem',
                                padding: isCollapsed ? '12px' : '12px 16px',
                                background: isActive ? 'linear-gradient(90deg, rgba(235, 87, 87, 0.15), transparent)' : 'transparent',
                                borderLeft: isActive && !isCollapsed ? '3px solid var(--color-primary)' : '3px solid transparent', // Left border only when expanded
                                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                border: isActive ? undefined : 'none',
                                borderBottom: 'none', borderTop: 'none', borderRight: 'none',
                                borderRadius: isCollapsed ? '12px' : '0 8px 8px 0', // Rounded when collapsed
                                fontSize: '1.05rem',
                                fontWeight: isActive ? 600 : 500,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) e.target.style.color = 'var(--color-text)';
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) e.target.style.color = 'var(--color-text-muted)';
                            }}
                            title={isCollapsed ? item.label : ''}
                        >
                            <Icon size={22} />
                            {!isCollapsed && <span>{item.label}</span>}
                            {isCollapsed && isActive && (
                                <div style={{
                                    position: 'absolute', right: -4, top: '50%', transform: 'translateY(-50%)',
                                    width: '4px', height: '20px', background: 'var(--color-primary)', borderRadius: '2px'
                                }} />
                            )}
                        </button>
                    );
                })}
            </nav>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                    onClick={() => { window.location.href = '/'; if (isMobile) onClose(); }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        gap: '1rem',
                        padding: isCollapsed ? '12px' : '12px 16px',
                        background: 'transparent',
                        color: 'var(--color-text)',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1.05rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    title={isCollapsed ? "Home" : ""}
                >
                    <LayoutDashboard size={20} />
                    {!isCollapsed && "Home"}
                </button>
                <button
                    onClick={() => { onOpenSettings(); if (isMobile) onClose(); }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        gap: '1rem',
                        padding: isCollapsed ? '12px' : '12px 16px',
                        background: 'transparent',
                        color: 'var(--color-text)',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1.05rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    title={isCollapsed ? "More" : ""}
                >
                    <MoreHorizontal size={20} />
                    {!isCollapsed && "More"}
                </button>
                <button
                    className="sidebar-bell-btn"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        padding: isCollapsed ? '12px' : '12px 16px',
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        width: '100%'
                    }}
                >
                    <NotificationBell />
                    {!isCollapsed && <span style={{ marginLeft: '1rem', fontWeight: 500, color: 'var(--color-text)' }}>Alerts</span>}
                </button>

                <button
                    onClick={() => { onOpenProfile(); if (isMobile) onClose(); }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        gap: '1rem',
                        padding: isCollapsed ? '12px' : '12px 16px',
                        background: 'transparent',
                        color: 'var(--color-text)',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1.05rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    title={isCollapsed ? "Profile" : ""}
                >
                    <User size={20} />
                    {!isCollapsed && "Profile"}
                </button>

                {!isMobile && (
                    <button
                        onClick={toggleCollapse}
                        style={{
                            marginTop: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '10px',
                            background: 'rgba(255,255,255,0.05)',
                            color: 'var(--color-text-muted)',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            alignSelf: isCollapsed ? 'center' : 'flex-end',
                            width: isCollapsed ? 'auto' : '100%'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    >
                        {isCollapsed ? <ChevronRight size={18} /> : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ChevronLeft size={18} />
                                <span style={{ fontSize: '0.9rem' }}>Collapse</span>
                            </div>
                        )}
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar (Static) */}
            {!isMobile && (
                <div className="app-sidebar glass-panel" style={{
                    borderRadius: 0,
                    borderLeft: 'none',
                    borderTop: 'none',
                    borderBottom: 'none',
                    height: '100vh',
                    position: 'sticky',
                    top: 0,
                    width: isCollapsed ? '80px' : '280px', // Dynamic width
                    transition: 'width 0.3s ease'
                }}>
                    <SidebarContent />
                </div>
            )}

            {/* Mobile Sidebar (Overlay) */}
            <AnimatePresence>
                {isMobile && isOpen && (
                    <>
                        <motion.div
                            className="sidebar-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            style={{
                                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999, backdropFilter: 'blur(4px)'
                            }}
                        />
                        <motion.div
                            className="sidebar glass-panel"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{
                                position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', zIndex: 1000,
                                background: 'var(--color-surface)', // Dynamic surface color (Light/Dark aware)
                                borderRadius: 0
                            }}
                        >
                            <SidebarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
