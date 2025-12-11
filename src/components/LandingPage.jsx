import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, Zap, Shield, CheckCircle } from 'lucide-react';
import Logo from './Logo';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="nav-logo">
                    <Logo size={32} />
                    <span className="brand-name">Fruition</span>
                </div>
                <div className="nav-links">
                    <button className="nav-btn" onClick={() => navigate('/dashboard', { state: { openLogin: true } })}>Login</button>
                    <button className="nav-btn primary" onClick={() => navigate('/dashboard', { state: { openLogin: true } })}>Get Started</button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="landing-hero">
                <div className="hero-text">
                    <h1 className="hero-title">
                        The World's First <br />
                        <span className="highlight-text">Intelligent</span> Fruit Tracker
                    </h1>
                    <p className="hero-subtitle">
                        Don't just count calories. Connect with your food.
                        Track freshness, bio-impact, and color diversity in one beautiful space.
                    </p>
                    <button className="cta-btn" onClick={() => navigate('/dashboard', { state: { openLogin: true } })}>
                        Start Your Journey <ArrowRight size={20} />
                    </button>
                </div>

                {/* Abstract Visuals */}
                <div className="hero-visuals">
                    <div className="glass-orb orb-1"></div>
                    <div className="glass-orb orb-2"></div>
                    <div className="floating-card card-1">
                        <Activity size={24} color="#FF4D4D" />
                        <span>Heart Health</span>
                    </div>
                    <div className="floating-card card-2">
                        <Zap size={24} color="#FDB813" />
                        <span>Energy Boost</span>
                    </div>
                    <div className="floating-card card-3">
                        <Shield size={24} color="#4CAF50" />
                        <span>Immunity</span>
                    </div>
                </div>
            </header>

            {/* Features Grid */}
            <section className="features-section">
                <div className="section-header">
                    <h2>Why Fruition?</h2>
                    <p>Science meets design in your pocket.</p>
                </div>

                <div className="feature-grid">
                    <div className="feature-card glass-panel">
                        <div className="feature-icon rainbow-bg">🌈</div>
                        <h3>Rainbow Spectrum</h3>
                        <p>Track dietary diversity by color. Eat the rainbow to unlock full nutritional potential.</p>
                    </div>
                    <div className="feature-card glass-panel">
                        <div className="feature-icon time-bg">⏳</div>
                        <h3>Freshness Forecast</h3>
                        <p>Never waste fruit again. Get intelligent alerts when your items need to be eaten.</p>
                    </div>
                    <div className="feature-card glass-panel">
                        <div className="feature-icon bio-bg">🧬</div>
                        <h3>Bio-Impact</h3>
                        <p>Understand what your fruit does for you. From immunity to recovery, know your benefits.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-logo">
                        <Logo size={24} />
                        <span>Fruition</span>
                    </div>
                    <p className="copyright">© 2025 Fruition. All rights reserved. Designed for Health & Happiness.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
