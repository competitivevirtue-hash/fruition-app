import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, Monitor, Globe, Download, FileText, ChevronRight } from 'lucide-react';
import { translations } from '../utils/translations';
import './BioModal.css';

const SettingsModal = ({ isOpen, onClose, currentTheme, onThemeChange, currentLanguage, onLanguageChange }) => {
    if (!isOpen) return null;

    const t = (key) => translations[currentLanguage]?.[key] || translations['en'][key];

    const Section = ({ title, children }) => (
        <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-text-muted)',
                marginBottom: '1rem',
                fontWeight: 600
            }}>
                {title}
            </h3>
            {children}
        </div>
    );

    const MenuLink = ({ icon: Icon, label, onClick, badge }) => (
        <button
            onClick={onClick}
            style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                marginBottom: '10px',
                borderRadius: '16px',
                color: 'var(--color-text)',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '1rem',
                fontWeight: 500,
                transition: 'transform 0.2s',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} style={{ color: 'var(--color-primary)' }} />
                <span>{label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {badge && (
                    <span style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        borderRadius: '12px',
                        fontWeight: 600
                    }}>
                        {badge}
                    </span>
                )}
                <ChevronRight size={16} style={{ opacity: 0.5 }} />
            </div>
        </button>
    );

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    zIndex: 1000 // Ensure it's on top
                }}
            >
                <motion.div
                    className="modal-content glass-panel"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        maxWidth: '450px',
                        width: '90%',
                        position: 'relative',
                        borderRadius: '24px',
                        margin: 'auto', // Centering
                        background: 'var(--glass-background)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text)',
                        maxHeight: '85vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden' // contain scroll
                    }}
                >
                    <div style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)' }}>
                        <h2 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 800 }}>More</h2>
                        <button className="close-btn" onClick={onClose} style={{ position: 'static', background: 'var(--color-surface)', color: 'var(--color-text)' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>

                        <Section title="Get Fruition">
                            <MenuLink
                                icon={Download}
                                label="App Store"
                                badge="Coming Soon"
                                onClick={() => { }}
                            />
                            <MenuLink
                                icon={Download}
                                label="Google Play"
                                badge="Coming Soon"
                                onClick={() => { }}
                            />
                        </Section>

                        <Section title="Settings">
                            <div className="setting-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>Appearance</label>
                                <div className="theme-toggle" style={{ display: 'flex', background: 'var(--glass-background)', padding: '4px', borderRadius: '12px' }}>
                                    {['light', 'dark', 'auto'].map((themeMode) => (
                                        <button
                                            key={themeMode}
                                            onClick={() => onThemeChange(themeMode)}
                                            style={{
                                                flex: 1,
                                                padding: '8px',
                                                border: 'none',
                                                background: currentTheme === themeMode ? 'var(--color-surface)' : 'transparent',
                                                color: currentTheme === themeMode ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontWeight: 500,
                                                fontSize: '0.85rem',
                                                boxShadow: currentTheme === themeMode ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {themeMode === 'light' && <Sun size={14} />}
                                            {themeMode === 'dark' && <Moon size={14} />}
                                            {themeMode === 'auto' && <Monitor size={14} />}
                                            <span style={{ textTransform: 'capitalize' }}>{themeMode}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="setting-group">
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>Language</label>
                                <div style={{ position: 'relative' }}>
                                    <Globe size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                                    <select
                                        value={currentLanguage}
                                        onChange={(e) => onLanguageChange(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 12px 12px 40px',
                                            background: 'var(--glass-background)',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '12px',
                                            color: 'var(--color-text)',
                                            fontSize: '0.9rem',
                                            appearance: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="en">English</option>
                                        <option value="es">Español</option>
                                        <option value="fr">Français</option>
                                        <option value="zh">中文</option>
                                    </select>
                                </div>
                            </div>
                        </Section>

                        <Section title="Legal">
                            <MenuLink icon={FileText} label="Privacy Policy" onClick={() => { }} />
                            <MenuLink icon={FileText} label="Terms of Service" onClick={() => { }} />
                            <MenuLink icon={FileText} label="Open Source Licenses" onClick={() => { }} />
                        </Section>

                        <div style={{
                            textAlign: 'center',
                            padding: '2rem 0',
                            marginTop: 'auto',
                            color: 'var(--color-text-muted)'
                        }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--color-text)' }}>Fruition</h4>
                            <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Version 1.0.0 (Beta)</p>
                            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.5 }}>© 2025 Fruition Apps. All rights reserved.</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SettingsModal;
