import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFruit } from './FruitContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { fruits } = useFruit();
    const [permission, setPermission] = useState('default');
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Modal State
    const [expiredModalOpen, setExpiredModalOpen] = useState(false);

    // Default Preferences: Notify 2 days before
    const [preferences, setPreferences] = useState({
        notifyDaysBefore: [2], // Default
        notifyOnExpiry: true
    });

    // Load persisted data
    useEffect(() => {
        const saved = localStorage.getItem('fruition_notifications');
        const savedPrefs = localStorage.getItem('fruition_notification_prefs');

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setNotifications(parsed);
                setUnreadCount(parsed.filter(n => !n.read).length);
            } catch (e) {
                console.error("Failed to parse notifications", e);
            }
        }

        if (savedPrefs) {
            try {
                setPreferences(JSON.parse(savedPrefs));
            } catch (e) { }
        }

        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    // Save preferences
    useEffect(() => {
        localStorage.setItem('fruition_notification_prefs', JSON.stringify(preferences));
    }, [preferences]);

    // ... existing save effect ...
    useEffect(() => {
        localStorage.setItem('fruition_notifications', JSON.stringify(notifications));
        setUnreadCount(notifications.filter(n => !n.read).length);
    }, [notifications]);

    // ... existing requestPermission ...
    const requestPermission = async () => {
        if (!('Notification' in window)) {
            alert("This browser does not support desktop notifications");
            return;
        }
        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
    };

    const addNotification = (title, body, type = 'info', actionLink = null) => {
        const newNote = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title,
            body,
            type, // 'info', 'warning', 'success', 'danger'
            timestamp: new Date().toISOString(),
            read: false,
            actionLink
        };

        setNotifications(prev => [newNote, ...prev].slice(0, 50)); // Keep last 50

        // Trigger Browser Notification if permitted and visible
        if (permission === 'granted' && document.hidden) {
            new Notification(title, {
                body,
                icon: '/pwa-192x192.png',
                badge: '/pwa-192x192.png'
            });
        }
    };

    // ... existing markAsRead ...
    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    // -------------------------------------------------------------------------
    // INTELLIGENT CHECKER ENGINE
    // -------------------------------------------------------------------------
    useEffect(() => {
        if (!fruits || fruits.length === 0) return;

        const checkExpiry = () => {
            const now = new Date();
            const lastCheck = localStorage.getItem('last_expiry_check');

            // Debounce: Check only once per hour
            if (lastCheck && (now - new Date(lastCheck)) < 1000 * 60 * 60) {
                return;
            }

            let expiredCount = 0;

            fruits.forEach(fruit => {
                const uniqueKeyBase = `alert_${fruit.id}_${now.toDateString()}`;

                // 1. Check EXPIRED
                if (fruit.daysRemaining <= 0 && fruit.status !== 'Planned') {
                    if (preferences.notifyOnExpiry) {
                        const alertKey = `${uniqueKeyBase}_expired`;
                        if (!localStorage.getItem(alertKey)) {
                            expiredCount++; // Summarize later
                            localStorage.setItem(alertKey, 'true');
                        }
                    }
                }
                // 2. Check WARNING DAYS
                else if (fruit.daysRemaining > 0 && fruit.status !== 'Planned') {
                    if (preferences.notifyDaysBefore.includes(fruit.daysRemaining)) {
                        const alertKey = `${uniqueKeyBase}_warning_${fruit.daysRemaining}`;
                        if (!localStorage.getItem(alertKey)) {
                            addNotification(
                                "Eat Soon! ⏳",
                                `Your ${fruit.name} expires in ${fruit.daysRemaining} day${fruit.daysRemaining > 1 ? 's' : ''}.`,
                                'warning'
                            );
                            localStorage.setItem(alertKey, 'true');
                        }
                    }
                }
            });

            // Summary notification if multiple items
            if (expiredCount > 0) {
                addNotification(
                    "Pantry Alert 🚨",
                    `${expiredCount} items have expired. Check your inventory.`,
                    'danger',
                    'OPEN_EXPIRED_MODAL' // Action Link
                );
            }

            localStorage.setItem('last_expiry_check', now.toISOString());
        };

        const timer = setTimeout(checkExpiry, 5000);
        return () => clearTimeout(timer);

    }, [fruits, permission, preferences]);


    return (
        <NotificationContext.Provider value={{
            permission,
            requestPermission,
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            clearAll,
            addNotification, // Exposed for manual triggers (e.g. Welcome message)
            preferences,
            setPreferences,
            expiredModalOpen,
            setExpiredModalOpen
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotifications must be used within NotificationProvider");
    return context;
};
