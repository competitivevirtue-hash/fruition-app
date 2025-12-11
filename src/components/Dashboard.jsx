import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from './Layout';
import FruitCard from './FruitCard';
import FruitcyclopediaModal from './FruitcyclopediaModal';
import CalendarView from './CalendarView';
import SettingsModal from './SettingsModal';
import AddFruitModal from './AddFruitModal';
import Fruitcyclopedia from './Fruitcyclopedia';
import ProfileModal from './ProfileModal';
import FruitBasket from './FruitBasket';
import { useFruit } from '../context/FruitContext.jsx';
import { Plus, Crown, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { translations } from '../utils/translations';
import DashboardWidgets from './DashboardWidgets';
import SearchBar from './SearchBar';
import SplashScreen from './SplashScreen';
import RecipeModal from './RecipeModal';
import StatsModal from './StatsModal';
import ReportsView from './ReportsView';
import HouseholdModal from './HouseholdModal';
import { generateSmartRecipe } from '../utils/aiService';
import { getRelativeTime } from '../utils/fruitUtils';
import '../App.css'; // Keep utilizing App common styles

// Renamed from App to Dashboard
const Dashboard = () => {
    const { fruits, addFruit, consumeFruit, removeFruit, user } = useFruit();
    const { userProfile } = useAuth();
    const [selectedFruit, setSelectedFruit] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAddFruitOpen, setIsAddFruitOpen] = useState(false);
    const [addFruitDate, setAddFruitDate] = useState(null);
    const [prefillFruitName, setPrefillFruitName] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [showSplash, setShowSplash] = useState(true);

    // Routing State
    const location = useLocation();

    // Handle Login Redirect from Landing Page
    useEffect(() => {
        if (location.state?.openLogin) {
            // Slight delay to allow splash to finish or just set it
            // Since splash is overlay, we can set it true immediately so it's there when splash fades
            setIsProfileOpen(true);

            // Clean up state so it doesn't reopen on refresh? 
            // React Router state persists on refresh usually, but fine for now.
            // Ideally we'd replace history, but let's keep it simple.
        }
    }, [location.state]);

    // AI Chef State
    const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
    const [recipeLoading, setRecipeLoading] = useState(false);
    const [generatedRecipe, setGeneratedRecipe] = useState(null);

    // Household State
    const [isHouseholdModalOpen, setIsHouseholdModalOpen] = useState(false);

    // Stats State
    const [isStatsOpen, setIsStatsOpen] = useState(false);

    const handleGenerateRecipe = async () => {
        setIsRecipeModalOpen(true);
        setRecipeLoading(true);
        setGeneratedRecipe(null);
        try {
            const recipe = await generateSmartRecipe(fruits);
            setGeneratedRecipe(recipe);
        } catch (error) {
            console.error("Chef error:", error);
        } finally {
            setRecipeLoading(false);
        }
    };

    const [currentView, setCurrentView] = useState('dashboard');

    // Theme & Language State (Can eventually lift this to context, but fine here for now)
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'auto');
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');

    // Apply Theme
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark-mode');
            root.classList.remove('light-mode');
        } else if (theme === 'light') {
            root.classList.add('light-mode');
            root.classList.remove('dark-mode');
        } else {
            // Auto
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                root.classList.add('dark-mode');
                root.classList.remove('light-mode');
            } else {
                root.classList.add('light-mode');
                root.classList.remove('dark-mode');
            }
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Persist Language
    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const t = (key) => translations[language]?.[key] || translations['en'][key];

    // Splash Screen
    if (showSplash) {
        return <SplashScreen onComplete={() => setShowSplash(false)} />;
    }

    const freshFruits = fruits.filter(f => f.freshness === 'Peak' || f.freshness === 'Good').length;
    const recentFruits = fruits.slice(0, 3);
    const expiringFruits = fruits.filter(f => f.daysRemaining <= 3 && f.status !== 'Planned');

    return (
        <Layout
            currentView={currentView}
            onNavigate={setCurrentView}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
        >
            {currentView === 'dashboard' && (
                <div className="dashboard-hero glass-panel">
                    <div className="hero-content">
                        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                            {(() => {
                                const hour = new Date().getHours();
                                let greetingKey = 'goodMorning';
                                if (hour >= 12 && hour < 18) greetingKey = 'goodAfternoon';
                                if (hour >= 18) greetingKey = 'goodEvening';
                                const greeting = t(greetingKey);
                                const isFounder = userProfile?.memberId === 1;
                                return (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {user ? `${greeting}, ${user.displayName?.split(' ')[0] || 'User'}!` : `${greeting}, Guest!`}
                                        {isFounder && <span title="Founder"><Crown size={28} color="#FFD700" fill="#FFD700" /></span>}
                                    </span>
                                );
                            })()}
                        </h1>

                        <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
                            {/* Old Reports Button Removed */}
                        </div>

                        <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                            <SearchBar onFruitSelect={setSelectedFruit} onSparkleClick={handleGenerateRecipe} />
                        </div>

                        <DashboardWidgets fruits={fruits} />

                        {/* Add Fruit Button (Prominent) */}
                        {user ? (
                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setAddFruitDate(null);
                                        setIsAddFruitOpen(true);
                                    }}
                                    style={{
                                        padding: '1rem 2rem',
                                        fontSize: '1.1rem',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Plus size={24} />
                                    {t('addFruit')}
                                </button>

                                <button
                                    className="btn"
                                    onClick={handleGenerateRecipe}
                                    style={{
                                        padding: '1rem 2rem',
                                        fontSize: '1.1rem',
                                        background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)',
                                        color: 'white',
                                        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        border: 'none',
                                        borderRadius: '0.75rem'
                                    }}
                                >
                                    <Sparkles size={24} />
                                    Smart Chef
                                </button>
                            </div>
                        ) : (
                            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', fontSize: '1.1rem' }}>
                                    Login to start tracking your fruit intake
                                </p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setIsProfileOpen(true)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    Login / Sign Up
                                </button>
                            </div>
                        )}

                        {expiringFruits.length > 0 && (
                            <div className="expiring-section" style={{ marginTop: '2rem' }}>
                                <h3 className="section-title" style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#FF4D4D', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    ⚠️ Expiring Soon
                                </h3>
                                <div className="fruit-grid">
                                    {expiringFruits.map(fruit => (
                                        <FruitCard
                                            key={fruit.id}
                                            fruit={fruit}
                                            onDetails={() => setSelectedFruit(fruit)}
                                            onConsume={(amount) => consumeFruit(fruit.id, amount)}
                                            onDelete={removeFruit}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="recent-fruits-section" style={{ marginTop: '2rem' }}>
                            <h3 className="section-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{t('recentAdditions')}</h3>
                            <div className="fruit-grid">
                                {recentFruits.map(fruit => (
                                    <FruitCard
                                        key={fruit.id}
                                        fruit={{
                                            ...fruit,
                                            subtitle: `Added ${getRelativeTime(fruit.purchaseDate || fruit.createdAt)}`
                                        }}
                                        onDetails={() => setSelectedFruit(fruit)}
                                        onConsume={(amount) => consumeFruit(fruit.id, amount)}
                                        onDelete={removeFruit}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    )
            }

                    {
                        currentView === 'my-fruits' && (
                            <section className="fruit-section">
                                <div className="section-header">
                                    <h2 className="section-title">{t('myFruitBasket')}</h2>
                                    {user && (
                                        <button className="btn btn-primary" onClick={() => {
                                            setAddFruitDate(null);
                                            setIsAddFruitOpen(true);
                                        }}>
                                            <Plus size={18} style={{ marginRight: '0.5rem' }} />
                                            {t('addFruit')}
                                        </button>
                                    )}
                                </div>
                                <div className="fruit-grid">
                                    {fruits.map(fruit => (
                                        <FruitCard
                                            key={fruit.id}
                                            fruit={fruit}
                                            onDetails={() => setSelectedFruit(fruit)}
                                            onConsume={(amount) => consumeFruit(fruit.id, amount)}
                                            onDelete={removeFruit}
                                        />
                                    ))}
                                </div>
                                <FruitBasket fruits={fruits} />
                            </section>
                        )
                    }

                    {
                        currentView === 'calendar' && (
                            <CalendarView onAddFruit={(date) => {
                                setAddFruitDate(date);
                                setIsAddFruitOpen(true);
                            }} />
                        )
                    }

                    {
                        currentView === 'fruitcyclopedia' && (
                            <Fruitcyclopedia onFruitSelect={setSelectedFruit} />
                        )
                    }

                    {
                        currentView === 'reports' && (
                            <ReportsView />
                        )
                    }

                    <FruitcyclopediaModal
                        fruit={selectedFruit}
                        onClose={() => setSelectedFruit(null)}
                        onAddToBasket={(name) => {
                            setPrefillFruitName(name);
                            setSelectedFruit(null);
                            setAddFruitDate(null);
                            setIsAddFruitOpen(true);
                        }}
                    />

                    <SettingsModal
                        isOpen={isSettingsOpen}
                        onClose={() => setIsSettingsOpen(false)}
                        currentTheme={theme}
                        onThemeChange={setTheme}
                        currentLanguage={language}
                        onLanguageChange={setLanguage}
                    />

                    <AddFruitModal
                        isOpen={isAddFruitOpen}
                        onClose={() => {
                            setIsAddFruitOpen(false);
                            setPrefillFruitName('');
                        }}
                        initialDate={addFruitDate}
                        initialFruitName={prefillFruitName}
                    />

                    <ProfileModal
                        isOpen={isProfileOpen}
                        onClose={() => setIsProfileOpen(false)}
                        onOpenHousehold={() => {
                            setIsProfileOpen(false);
                            setIsHouseholdModalOpen(true);
                        }}
                    />

                    <HouseholdModal
                        isOpen={isHouseholdModalOpen}
                        onClose={() => setIsHouseholdModalOpen(false)}
                    />

                    <RecipeModal
                        isOpen={isRecipeModalOpen}
                        onClose={() => setIsRecipeModalOpen(false)}
                        recipe={generatedRecipe}
                        loading={recipeLoading}
                    />

                    <StatsModal
                        isOpen={isStatsOpen}
                        onClose={() => setIsStatsOpen(false)}
                    />
                </Layout >
            );
}

            export default Dashboard;
