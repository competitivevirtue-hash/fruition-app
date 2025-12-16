import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const LOG_LEVELS = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    CRITICAL: 'CRITICAL'
};

const EVENT_TYPES = {
    AUTH: 'AUTH',
    SECURITY: 'SECURITY',
    SYSTEM: 'SYSTEM',
    USER_ACTION: 'USER_ACTION',
    ADMIN: 'ADMIN'
};

/**
 * secureLog - Internal logger that writes to Firestore 'system_logs'
 * @param {string} message - Human readable message
 * @param {object} metadata - Extra details (userId, email, error object)
 * @param {string} level - Severity (INFO, WARN, ERROR)
 * @param {string} type - Category (AUTH, SECURITY, etc)
 */
export const secureLog = async (message, metadata = {}, level = LOG_LEVELS.INFO, type = EVENT_TYPES.SYSTEM) => {
    try {
        // Console fallback for local dev
        const logContent = {
            message,
            ...metadata,
            timestamp: new Date().toISOString()
        };

        if (level === LOG_LEVELS.ERROR || level === LOG_LEVELS.CRITICAL) {
            console.error(`[${type}] ${message}`, metadata);
        } else {
            console.log(`[${type}] ${message}`, metadata);
        }

        // Write to Firestore
        await addDoc(collection(db, 'system_logs'), {
            message,
            metadata: JSON.stringify(metadata), // Flatten complex objects
            level,
            type,
            timestamp: serverTimestamp(),
            userAgent: navigator.userAgent,
            url: window.location.href
        });

    } catch (err) {
        // Failsafe: Don't crash app if logger fails
        console.error("CRITICAL: Logger failed to write to Firestore", err);
    }
};

export { LOG_LEVELS, EVENT_TYPES };
