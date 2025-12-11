import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFruit } from './FruitContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { fruits } = useFruit();
    const [permission, setPermission] = useState('default');
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Load persisted notifications on mount
    useEffect(() => {
        const saved = localStorage.getItem('fruition_notifications');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setNotifications(parsed);
                setUnreadCount(parsed.filter(n => !n.read).length);
            } catch (e) {
                console.error("Failed to parse notifications", e);
            }
        }

        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    // Save to local storage whenever notifications change
    useEffect(() => {
        localStorage.setItem('fruition_notifications', JSON.stringify(notifications));
        setUnreadCount(notifications.filter(n => !n.read).length);
    }, [notifications]);

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
                icon: '/pwa-192x192.png', // Assuming we have this, or fallback
                badge: '/pwa-192x192.png'
            });
        }
    };

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

        // Run check every time 'fruits' data updates significantly, 
        // OR we could run it on an interval. 
        // Since 'fruits' updates from Firestore, let's trigger on change but debounce frequency.

        const checkExpiry = () => {
            const now = new Date();
            const lastCheck = localStorage.getItem('last_expiry_check');

            // Limit checks to once per hour to avoid spamming on every minor DB update
            if (lastCheck && (now - new Date(lastCheck)) < 1000 * 60 * 60) {
                return;
            }

            let riskCount = 0;
            let expiredCount = 0;

            fruits.forEach(fruit => {
                // Unique key for today's alert regarding this specific fruit
                const alertKey = `alert_${fruit.id}_${new Date().toDateString()}`;
                const alreadyAlerted = localStorage.getItem(alertKey);

                if (alreadyAlerted) return;

                if (fruit.daysRemaining <= 0 && fruit.status !== 'Planned') {
                    expiredCount++;
                    // Only alert if we haven't today
                    // addNotification("Expired Item", `${fruit.name} has expired. Please log waste.`, 'danger');
                    localStorage.setItem(alertKey, 'true');
                } else if (fruit.daysRemaining <= 2 && fruit.daysRemaining > 0 && fruit.status !== 'Planned') {
                    riskCount++;
                    addNotification(
                        "Eat Soon! ⏳",
                        `Your ${fruit.name} expires in ${fruit.daysRemaining} days.`,
                        'warning'
                    );
                    localStorage.setItem(alertKey, 'true');
                }
            });

            // Summary notification if multiple items
            if (expiredCount > 0) {
                addNotification("Pantry Alert 🚨", `${expiredCount} items have expired. Check your inventory.`, 'danger');
            }

            localStorage.setItem('last_expiry_check', now.toISOString());
        };

        // Initial Timeout to let app load, then check
        const timer = setTimeout(checkExpiry, 5000);
        return () => clearTimeout(timer);

    }, [fruits, permission]);


    return (
        <NotificationContext.Provider value={{
            permission,
            requestPermission,
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            clearAll,
            addNotification // Exposed for manual triggers (e.g. Welcome message)
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
