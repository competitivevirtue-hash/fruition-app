
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * THE PRIVACY GATEKEEPER
 * Strictly constructs public event payloads to ensure NO PII leaks.
 */

// Allowed avatars to keep things fun but private (could expand this later)
const REACTIONS = ["🍎", "🍌", "🍇", "🍊", "🥝", "🍉", "🍓", "🍒", "🍑", "🍍"];

/**
 * Broadcasts a "Consumption" event to the public feed.
 * @param {Object} user - The sensitive user object (we strip this).
 * @param {String} fruitName - The action target.
 * @param {Number} amount - Quantity.
 */
export const broadcastConsumption = async (user, fruitName, amount = 1) => {
    if (!user) return;

    // PRIVACY UPDATE: Use Member ID instead of Name
    const safeIdentity = user.memberId ? `Member #${user.memberId}` : 'Anonymous Member';

    // Construct the Safe Payload directly.
    const payload = {
        type: 'consumed',
        fruitName: fruitName,
        amount: amount,
        userDisplayName: safeIdentity, // Stored as "Member #123"
        location: user.location?.label || null,
        // Random reaction for flavor, purely cosmetic
        icon: REACTIONS[Math.floor(Math.random() * REACTIONS.length)],
        timestamp: serverTimestamp()
    };

    try {
        await addDoc(collection(db, 'public_feed'), payload);
    } catch (error) {
        console.error("Failed to broadcast to global feed (minor):", error);
        // We do not block the UI flow if this fails. Ssh.
    }
};

/**
 * Broadcasts a "Waste" event via the same secure channel.
 */
export const broadcastWaste = async (user, fruitName, amount = 1) => {
    if (!user) return;

    const safeIdentity = user.memberId ? `Member #${user.memberId}` : 'Anonymous Member';

    const payload = {
        type: 'waste',
        fruitName: fruitName,
        amount: amount,
        userDisplayName: safeIdentity,
        location: user.location?.label || null,
        icon: '🗑️',
        timestamp: serverTimestamp()
    };

    try {
        await addDoc(collection(db, 'public_feed'), payload);
    } catch (error) {
        console.error("Failed to broadcast waste (minor):", error);
    }
};
