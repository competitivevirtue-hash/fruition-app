import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '2rem 1rem',
            color: 'var(--color-text)',
            fontFamily: 'Inter, system-ui, sans-serif',
            lineHeight: '1.6'
        }}>
            <button
                onClick={() => navigate('/')}
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'none', border: 'none', color: 'var(--color-primary)',
                    cursor: 'pointer', marginBottom: '2rem', fontSize: '1rem', fontWeight: 600
                }}
            >
                <ArrowLeft size={20} /> Back to Fruition
            </button>

            <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Privacy Policy</h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '3rem' }}>Last Updated: December 11, 2025</p>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield className="text-primary" size={24} /> 1. Introduction
                </h2>
                <p>
                    Fruition ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by Fruition.
                    This Privacy Policy applies to our website, and its associated subdomains (collectively, our "Service") alongside our application, Fruition.
                </p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <DatabaseIcon size={24} color="var(--color-secondary)" /> 2. Information We Collect
                </h2>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-text)' }}>2.1 Personal Data</h3>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--color-text-muted)' }}>
                        <li><strong>Identity Data:</strong> Name, Email address (for account management).</li>
                        <li><strong>Health Data:</strong> Fruit consumption logs, dietary preferences, and self-reported wellness goals.</li>
                    </ul>
                </div>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Server size={24} color="#10b981" /> 3. How We Use Your Data
                </h2>
                <p>We use the data we collect in various ways, including to:</p>
                <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', color: 'var(--color-text-muted)' }}>
                    <li>Provide, operate, and maintain our application.</li>
                    <li>Improve, personalize, and expand our application.</li>
                    <li>Understand and analyze how you use our application.</li>
                    <li>Develop new products, services, features, and functionality.</li>
                    <li>Communicate with you solely regarding account updates or security alerts.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Lock size={24} color="#f59e0b" /> 4. Data Storage & Security
                </h2>
                <p>
                    All user data is securely stored using <strong>Google Firebase</strong>, a world-class backend-as-a-service provider.
                    We implement industry-standard security measures including:
                </p>
                <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', color: 'var(--color-text-muted)' }}>
                    <li>Encryption of data in transit (HTTPS/SSL).</li>
                    <li>Strict access controls to database infrastructure.</li>
                    <li>Regular security audits.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Eye size={24} color="#ef4444" /> 5. Your Rights
                </h2>
                <p>You have the right to:</p>
                <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', color: 'var(--color-text-muted)' }}>
                    <li><strong>Access:</strong> Request copies of your personal data.</li>
                    <li><strong>Deletion:</strong> Request that we delete your personal data (available directly in App Settings > Security > Delete Account).</li>
                    <li><strong>Correction:</strong> Request that we correct any information you believe is inaccurate.</li>
                </ul>
            </section>

            <section style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Contact Us</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>
                    If you have any questions about this Privacy Policy, please contact us at: <br />
                    <a href="mailto:paytonpleasanti@gmail.com" style={{ color: 'var(--color-primary)' }}>paytonpleasanti@gmail.com</a>
                </p>
            </section>
        </div>
    );
};

// Helper Icon
const DatabaseIcon = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
        <path d="M3 5v14c0 1.66 4 3 9 3s 9-1.34 9-3V5"></path>
    </svg>
);

export default PrivacyPolicy;
