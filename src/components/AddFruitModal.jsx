import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFruit } from '../context/FruitContext.jsx';
import { getFruitImage, normalizeFruitName } from '../utils/fruitUtils';
import { fetchFruitNutrition, searchFruits } from '../utils/usdaApi';
import { translations } from '../utils/translations';
import './BioModal.css'; // Reuse styles

const AddFruitModal = ({ isOpen, onClose, initialDate, initialFruitName }) => {
    const { addFruit } = useFruit();

    // If initialDate is provided and is in the past/future (not today), boughtToday should default to false
    const isToday = !initialDate || new Date(initialDate).toDateString() === new Date().toDateString();

    const [formData, setFormData] = useState({
        name: initialFruitName || '',
        quantity: 1,
        unit: 'Pieces',
        purchaseDate: initialDate ? new Date(initialDate) : new Date()
    });
    const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(initialDate ? new Date(initialDate) : new Date());

    const [boughtToday, setBoughtToday] = useState(isToday);
    const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);


    // Reset form when modal opens
    React.useEffect(() => {
        if (isOpen) {
            const dateToUse = initialDate ? new Date(initialDate) : new Date();
            const isDateToday = dateToUse.toDateString() === new Date().toDateString();

            setFormData(prev => ({
                ...prev,
                name: initialFruitName || '',
                quantity: 1,
                unit: 'Pieces',
                purchaseDate: dateToUse
            }));
            setCurrentMonth(dateToUse);
            setBoughtToday(isDateToday);
            setShowCalendar(false);
            setUnitDropdownOpen(false);
            setSuggestions([]);
        }
    }, [isOpen, initialDate, initialFruitName]);

    // Get language from localStorage (simple approach for now, ideally via Context)
    const language = localStorage.getItem('language') || 'en';
    const t = (key) => translations[language]?.[key] || translations['en'][key];

    const handleSubmit = async (e) => {
        e.preventDefault();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let purchaseDate = new Date(formData.purchaseDate);
        if (boughtToday) {
            purchaseDate = new Date();
        }
        purchaseDate.setHours(0, 0, 0, 0);

        const isFuture = purchaseDate > today;
        const status = isFuture ? 'Planned' : 'Active';

        const newFruit = {
            name: normalizeFruitName(formData.name),
            image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=500', // Placeholder
            calories: 95, // Placeholder
            fruitcyclopedia: {
                vitaminC: 'Unknown',
                fiber: 'Unknown',
                antioxidants: 'Unknown'
            },
            scientificFact: 'Information coming soon.',
            makeItPlain: 'We are still learning about this fruit.',
            freshness: 'Peak',
            daysRemaining: 7, // Default
            purchaseDate: purchaseDate.toISOString(),
            quantity: parseInt(formData.quantity),
            unit: formData.unit,
            status: status
        };

        try {
            await addFruit(newFruit);
            onClose();
            setFormData({ name: '', quantity: 1, unit: 'Pieces', purchaseDate: new Date() });
            setBoughtToday(true);
            setShowCalendar(false);
        } catch (error) {
            console.error("Error adding fruit:", error);
            // Optionally set an error state here to show to user
        }
    };

    const handleDateClick = (day) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        setFormData({ ...formData, purchaseDate: newDate });
        setShowCalendar(false);
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

    const renderCalendar = () => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mini-calendar glass-panel"
            style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                width: '100%',
                padding: '1rem',
                zIndex: 10,
                marginTop: '0.5rem',
                background: 'var(--color-surface)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <button type="button" onClick={prevMonth} style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer' }}><ChevronLeft size={20} /></button>
                <span style={{ fontWeight: 600 }}>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <button type="button" onClick={nextMonth} style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer' }}><ChevronRight size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.5rem' }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{d}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                {Array(firstDayOfMonth).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
                {Array(daysInMonth).fill(null).map((_, i) => {
                    const day = i + 1;
                    const isSelected = formData.purchaseDate.getDate() === day &&
                        formData.purchaseDate.getMonth() === currentMonth.getMonth() &&
                        formData.purchaseDate.getFullYear() === currentMonth.getFullYear();
                    return (
                        <button
                            key={day}
                            type="button"
                            onClick={() => handleDateClick(day)}
                            style={{
                                padding: '0.5rem',
                                background: isSelected ? 'var(--color-primary)' : 'transparent',
                                color: isSelected ? '#fff' : 'var(--color-text)',
                                border: 'none',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
            <button
                type="button"
                onClick={() => {
                    const today = new Date();
                    setFormData({ ...formData, purchaseDate: today });
                    setCurrentMonth(today);
                    setShowCalendar(false);
                }}
                style={{
                    width: '100%',
                    marginTop: '1rem',
                    padding: '0.5rem',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                    fontWeight: 600
                }}
            >
                Today
            </button>
        </motion.div>
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="modal-content glass-panel"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        maxWidth: '450px',
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.05)'
                    }}
                >
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>

                    <div style={{ padding: '2rem' }}>
                        <h2 className="text-gradient" style={{ marginBottom: '1.5rem' }}>{t('addToBasket')}</h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '100px' }}>
                            <div className="form-group" style={{ position: 'relative' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{t('fruitName')}</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData({ ...formData, name: val });

                                        // Debounce search
                                        if (typingTimeout) clearTimeout(typingTimeout);

                                        if (val.length >= 2) {
                                            setIsLoading(true);
                                            setShowSuggestions(true); // Show immediately for loading state

                                            const timeout = setTimeout(async () => {
                                                const results = await searchFruits(val);
                                                setSuggestions(results);
                                                setIsLoading(false);
                                            }, 300); // Faster bounce for snappier feel
                                            setTypingTimeout(timeout);
                                        } else {
                                            setShowSuggestions(false);
                                            setIsLoading(false);
                                        }
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                        setTimeout(() => setShowSuggestions(false), 200);
                                    }}
                                    placeholder={t('fruitNamePlaceholder')}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                                    }}
                                />
                                {showSuggestions && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 'calc(100% + 4px)',
                                        left: 0,
                                        width: '100%',
                                        background: 'rgba(25, 30, 45, 0.98)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        zIndex: 1000,
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                        backdropFilter: 'blur(10px)'
                                    }}>
                                        {isLoading ? (
                                            <div style={{ padding: '12px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', fontStyle: 'italic' }}>
                                                Searching...
                                            </div>
                                        ) : suggestions.length > 0 ? (
                                            suggestions.map((s, i) => (
                                                <div
                                                    key={s.id || i}
                                                    style={{
                                                        padding: '10px 12px',
                                                        borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                                        cursor: 'pointer',
                                                        color: 'var(--color-text)',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, name: s.name }));
                                                        setShowSuggestions(false);
                                                    }}
                                                >
                                                    {s.name}
                                                </div>
                                            ))) : (
                                            <div style={{ padding: '12px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', fontSize: '0.9rem' }}>
                                                No USDA match found.<br />
                                                <span style={{ fontSize: '0.8em', opacity: 0.7 }}>You can still add this item!</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{t('quantity')}</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            style={{
                                                width: '60%',
                                                padding: '12px',
                                                background: 'rgba(255, 255, 255, 0.08)',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: '8px',
                                                color: '#fff',
                                                fontSize: '1rem',
                                                outline: 'none',
                                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                                            }}
                                        />
                                        <div style={{ position: 'relative', width: '40%' }}>
                                            <button
                                                type="button"
                                                onClick={() => setUnitDropdownOpen(!unitDropdownOpen)}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    background: 'rgba(255, 255, 255, 0.08)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '8px',
                                                    color: '#fff',
                                                    fontSize: '1rem',
                                                    outline: 'none',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                                                }}
                                            >
                                                {formData.unit}
                                                <ChevronRight size={16} style={{ transform: unitDropdownOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                            </button>

                                            {unitDropdownOpen && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 'calc(100% + 4px)',
                                                    right: 0,
                                                    minWidth: '150px',
                                                    background: 'rgba(20, 25, 40, 0.95)',
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '12px',
                                                    zIndex: 9999,
                                                    maxHeight: '200px',
                                                    overflowY: 'auto',
                                                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                                    backdropFilter: 'blur(20px)',
                                                    padding: '6px'
                                                }}>
                                                    {['Pieces', 'Bags', 'Cartons', 'lbs', 'kg'].map(option => (
                                                        <div
                                                            key={option}
                                                            onClick={() => {
                                                                setFormData({ ...formData, unit: option });
                                                                setUnitDropdownOpen(false);
                                                            }}
                                                            style={{
                                                                padding: '10px 12px',
                                                                cursor: 'pointer',
                                                                color: 'var(--color-text)',
                                                                background: formData.unit === option ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                                borderRadius: '4px',
                                                                transition: 'background 0.2s',
                                                                fontSize: '0.95rem'
                                                            }}
                                                            onMouseEnter={(e) => { if (formData.unit !== option) e.target.style.background = 'rgba(255,255,255,0.05)' }}
                                                            onMouseLeave={(e) => { if (formData.unit !== option) e.target.style.background = 'transparent' }}
                                                        >
                                                            {option}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group" style={{ position: 'relative' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{t('purchaseDate')}</label>

                                    <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="checkbox"
                                            id="boughtToday"
                                            checked={boughtToday}
                                            onChange={(e) => {
                                                setBoughtToday(e.target.checked);
                                                if (e.target.checked) {
                                                    setFormData({ ...formData, purchaseDate: new Date() });
                                                    setShowCalendar(false);
                                                }
                                            }}
                                            style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px' }}
                                        />
                                        <label htmlFor="boughtToday" style={{ color: '#ffffff', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}>Bought Today</label>
                                    </div>

                                    {!boughtToday && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setShowCalendar(!showCalendar)}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    background: 'rgba(255, 255, 255, 0.08)',
                                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '8px',
                                                    color: '#fff',
                                                    fontSize: '1rem',
                                                    outline: 'none',
                                                    textAlign: 'left',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    cursor: 'pointer',
                                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                                                }}
                                            >
                                                {formData.purchaseDate.toLocaleDateString()}
                                                <CalendarIcon size={18} style={{ opacity: 0.7 }} />
                                            </button>
                                            {showCalendar && renderCalendar()}
                                        </>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ marginTop: '1rem', padding: '12px', fontSize: '1rem' }}
                            >
                                <Plus size={20} style={{ marginRight: '0.5rem' }} />
                                {t('addItem')}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AddFruitModal;
