import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useFruit } from '../context/FruitContext.jsx';
import { getFruitImage } from '../utils/fruitUtils';
import DayDetailModal from './DayDetailModal';
import './CalendarView.css';

const CalendarView = ({ onAddFruit }) => {
    const { fruits } = useFruit();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [detailDate, setDetailDate] = useState(null);
    const [detailEvents, setDetailEvents] = useState([]);

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    const getEventsForDay = (day) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const events = [];

        fruits.forEach(fruit => {
            const purchaseDate = new Date(fruit.purchaseDate);
            const expirationDate = new Date(purchaseDate);
            expirationDate.setDate(purchaseDate.getDate() + fruit.daysRemaining);

            // Normalize time
            purchaseDate.setHours(0, 0, 0, 0);
            expirationDate.setHours(0, 0, 0, 0);
            date.setHours(0, 0, 0, 0);

            if (purchaseDate.getTime() === date.getTime()) {
                events.push({ type: 'purchase', fruit });
            }
            if (expirationDate.getTime() === date.getTime()) {
                events.push({ type: 'expiration', fruit });
            }
        });
        return events;
    };

    const handleDayClick = (day) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const events = getEventsForDay(day);
        setDetailDate(date);
        setDetailEvents(events);
    };

    return (
        <div className="calendar-container glass-panel">
            <div className="calendar-header">
                <button className="icon-btn" onClick={prevMonth}>
                    <ChevronLeft size={24} />
                </button>
                <h2 className="calendar-title text-gradient">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <button className="icon-btn" onClick={nextMonth}>
                    <ChevronRight size={24} />
                </button>
            </div>

            <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="weekday">{day}</div>
                ))}

                {blanks.map((_, index) => (
                    <div key={`blank-${index}`} className="calendar-day empty"></div>
                ))}

                {days.map(day => {
                    const events = getEventsForDay(day);
                    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                    // Stacking Logic
                    const maxIcons = 3;
                    const visibleEvents = events.slice(0, maxIcons);
                    const hiddenCount = events.length - maxIcons;

                    return (
                        <div key={day} className={`calendar-day ${isToday ? 'today' : ''}`} onClick={() => handleDayClick(day)}>
                            <span className="day-number">{day}</span>
                            <div className="day-visuals">
                                {visibleEvents.map((event, idx) => (
                                    <div key={idx} className={`fruit-icon-stack ${event.type}`}>
                                        <img
                                            src={getFruitImage(event.fruit.name)}
                                            alt={event.fruit.name}
                                            title={`${event.type === 'purchase' ? 'Purchased' : 'Expires'}: ${event.fruit.name}`}
                                            style={{
                                                width: '18px',
                                                height: '18px',
                                                objectFit: 'contain',
                                                filter: event.type === 'expiration' ? 'grayscale(100%) opacity(0.7)' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
                                            }}
                                        />
                                        {event.type === 'expiration' && <div className="expiration-dot" />}
                                    </div>
                                ))}
                                {hiddenCount > 0 && (
                                    <div className="more-badge">+{hiddenCount}</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <DayDetailModal
                date={detailDate}
                events={detailEvents}
                onClose={() => setDetailDate(null)}
                onAddFruit={(date) => {
                    setDetailDate(null); // Close detail modal
                    onAddFruit(date); // Open global add modal with date
                }}
            />
        </div>
    );
};

export default CalendarView;
