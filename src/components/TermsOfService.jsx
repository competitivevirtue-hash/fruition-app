import React from 'react';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
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

            <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Terms of Service</h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '3rem' }}>Last Updated: December 11, 2025</p>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText className="text-primary" size={24} /> 1. Agreement to Terms
                </h2>
                <p>
                    By accessing or using Fruition, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
                </p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle size={24} color="#f59e0b" /> 2. Medical Disclaimer (Important)
                </h2>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#f59e0b' }}>Not Medical Advice</h3>
                    <p style={{ color: 'var(--color-text)' }}>
                        Fruition is designed for informational and educational purposes only. The app tracks fruit consumption and provides general nutritional data.
                        <strong>It is not a substitute for professional medical advice, diagnosis, or treatment.</strong>
                        Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                    </p>
                </div>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle size={24} color="#10b981" /> 3. User Accounts
                </h2>
                <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem', color: 'var(--color-text-muted)' }}>
                    <li>You are responsible for safeguarding the password that you use to access the service.</li>
                    <li>You agree not to disclose your password to any third party.</li>
                    <li>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>4. Termination</h2>
                <p>
                    We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
            </section>

            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>5. Changes</h2>
                <p>
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                </p>
            </section>

            <section style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Contact Us</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>
                    If you have any questions about these Terms, please contact us at: <br />
                    <a href="mailto:paytonpleasanti@gmail.com" style={{ color: 'var(--color-primary)' }}>paytonpleasanti@gmail.com</a>
                </p>
            </section>
        </div>
    );
};

export default TermsOfService;
