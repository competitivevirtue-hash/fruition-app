import React, { createContext, useState, useEffect, useContext } from 'react';

const StreakContext = createContext();

export const useStreak = () => useContext(StreakContext);

export const StreakProvider = ({ children }) => {
    const [streak, setStreak] = useState(0);
    const [lastLoginDate, setLastLoginDate] = useState(null);
    const [showAnimation, setShowAnimation] = useState(false);

    useEffect(() => {
        // Load from local storage on mount
        const storedStreak = parseInt(localStorage.getItem('fruit_streak') || '0');
        const storedDate = localStorage.getItem('fruit_last_login');

        setStreak(storedStreak);
        setLastLoginDate(storedDate);

        checkStreak(storedStreak, storedDate);
    }, []);

    const checkStreak = (currentStreak, lastDateStr) => {
        const today = new Date().toDateString();

        if (lastDateStr === today) {
            // Already logged in today, do nothing
            return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        let newStreak = currentStreak;

        if (lastDateStr === yesterdayStr) {
            // Consecutive day! Increment
            newStreak += 1;
            setShowAnimation(true); // Trigger "Fire" animation
            setTimeout(() => setShowAnimation(false), 3000);
        } else if (lastDateStr && lastDateStr !== today) {
            // Missed a day (or more), reset :(
            // Unless it's the very first time (lastDateStr is null)
            newStreak = 1;
            // Optional: "Streak Broken" notification here
        } else if (!lastDateStr) {
            // First ever login
            newStreak = 1;
            setShowAnimation(true);
            setTimeout(() => setShowAnimation(false), 3000);
        }

        // Save new state
        setStreak(newStreak);
        setLastLoginDate(today);
        localStorage.setItem('fruit_streak', newStreak.toString());
        localStorage.setItem('fruit_last_login', today);
    };

    return (
        <StreakContext.Provider value={{ streak, showAnimation }}>
            {children}
        </StreakContext.Provider>
    );
};
