import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import InfoModal from './InfoModal';
import Sidebar from './Sidebar';
import Logo from './Logo';
import NotificationBell from './NotificationBell';
import './Layout.css';

const Layout = ({ children, currentView, onNavigate, onOpenSettings, onOpenProfile }) => {
    const [infoModal, setInfoModal] = useState({ isOpen: false, title: '', message: '' });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="app-layout">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                currentView={currentView}
                onNavigate={onNavigate}
                onOpenSettings={onOpenSettings}
                onOpenProfile={onOpenProfile}
            />

            <div className="main-content-wrapper">
                {/* Mobile Header */}
                <header className="mobile-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button className="icon-btn" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Logo size={28} />
                            <span className="text-gradient" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Fruition</span>
                        </div>
                    </div>
                    <NotificationBell />
                </header>

                <main className="app-content container">
                    {children}
                </main>
            </div>

            <InfoModal
                isOpen={infoModal.isOpen}
                onClose={() => setInfoModal({ ...infoModal, isOpen: false })}
                title={infoModal.title}
                message={infoModal.message}
            />
        </div>
    );
};

export default Layout;
