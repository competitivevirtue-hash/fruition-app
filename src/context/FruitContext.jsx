import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext.jsx';

import { getShelfLife } from '../utils/fruitUtils';
import { broadcastConsumption, broadcastWaste } from '../utils/feedUtils';

const FruitContext = createContext();

const initialState = {
    fruits: [],
    loading: false,
    error: null,
    history: []
};

const fruitReducer = (state, action) => {
    switch (action.type) {
        case 'SET_FRUITS':
            return {
                ...state,
                fruits: action.payload
            };
        default:
            return state;
    }
};

export const FruitProvider = ({ children }) => {
    const [state, dispatch] = useReducer(fruitReducer, initialState);
    const { currentUser, userProfile } = useAuth();
    const [loading, setLoading] = useState(true);

    // -------------------------------------------------------------------------
    // NUCLEAR REWRITE: Strict Real-Time Sync Logic (Household Aware)
    // -------------------------------------------------------------------------
    useEffect(() => {
        let unsubscribe = () => { };

        if (currentUser) {
            setLoading(true);

            // Determine Collection Path: Household vs Personal
            const householdId = userProfile?.householdId;
            const collectionPath = householdId
                ? `households/${householdId}/inventory`
                : `users/${currentUser.uid}/inventory`;

            try {
                // 3. Logic Requirements: Create a query
                // Restoring orderBy('createdAt', 'desc') now that DB is active.
                // Note: If you see a "requires an index" link in console, click it!
                const q = query(collection(db, collectionPath), orderBy('createdAt', 'desc'));

                console.log(`🔌 Connecting listener to: ${collectionPath}`);

                // 4. The Listener: onSnapshot
                unsubscribe = onSnapshot(q, (snapshot) => {
                    // 5. The Diagnostic Logs (Crucial) - Reverted to requested format
                    console.log("🔥 FIRESTORE UPDATE RECEIVED:", snapshot.docs.length, "items");

                    const now = new Date(); // Current time for calc

                    const fruitsData = snapshot.docs.map(doc => {
                        const data = doc.data();

                        // --- INTELLIGENCE LOGIC ---
                        // 1. Determine Start Date (Purchase Date preferred, fallback to CreatedAt)
                        const startDate = new Date(data.purchaseDate || data.createdAt);

                        // 2. Calculate Days Passed
                        const diffTime = Math.abs(now - startDate);
                        const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                        // 3. Get Shelf Life from Knowledge Base
                        const shelfLife = getShelfLife(data.name);

                        // 4. Calculate Remaining Life
                        // If status is 'Planned', it doesn't expire yet.
                        let daysRemaining = data.status === 'Planned' ? 7 : Math.max(0, shelfLife - daysPassed);

                        // 5. Determine Freshness Status
                        let freshness = 'Peak';
                        if (daysRemaining <= 1) freshness = 'Expired'; // or Risk
                        else if (daysRemaining <= 3) freshness = 'Risk';
                        else if (daysRemaining <= 5) freshness = 'Good';

                        return {
                            id: doc.id,
                            ...data,
                            daysRemaining, // Overwrite static value with calculated value
                            freshness      // Overwrite static value
                        };
                    });

                    dispatch({ type: 'SET_FRUITS', payload: fruitsData });
                    setLoading(false);
                }, (error) => {
                    console.error("❌ Firestore Listener Error:", error);
                    setLoading(false);
                });

            } catch (error) {
                console.error("❌ Error creating query:", error);
                setLoading(false);
            }
        } else {
            dispatch({ type: 'SET_FRUITS', payload: [] });
            setLoading(false);
        }

        return () => {
            console.log("🔌 Disconnecting Firestore Listener");
            unsubscribe();
        };
    }, [currentUser, userProfile?.householdId]); // Re-run when householdId changes

    // -------------------------------------------------------------------------
    // Consumed History Listener (Daily Reset)
    // -------------------------------------------------------------------------
    const [consumedToday, setConsumedToday] = useState(0);

    useEffect(() => {
        let unsubscribe = () => { };
        if (currentUser) {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const collectionPath = `users/${currentUser.uid}/consumed`;
            // Simple client-side filtering for V1 to ensure robustness without complex indexes yet
            // In V2, we would use: where('consumedAt', '>=', startOfDay.toISOString())

            const q = query(collection(db, collectionPath), orderBy('consumedAt', 'desc'));

            unsubscribe = onSnapshot(q, (snapshot) => {
                const todayItems = snapshot.docs.filter(doc => {
                    const data = doc.data();
                    return new Date(data.consumedAt) >= startOfDay;
                });

                // Sum up the amount consumed (assuming each doc is an event)
                const total = todayItems.reduce((acc, doc) => acc + (doc.data().amount || 1), 0);
                setConsumedToday(total);
            });
        }
        return () => unsubscribe();
    }, [currentUser]);

    // -------------------------------------------------------------------------
    // Write Operations (Must match Read Path exactly)
    // -------------------------------------------------------------------------

    // Helper to get correct inventory path
    const getInventoryPath = () => {
        if (!currentUser) return null;
        const householdId = userProfile?.householdId;
        return householdId ? `households/${householdId}/inventory` : `users/${currentUser.uid}/inventory`;
    };

    const addFruit = async (fruit) => {
        if (!currentUser) throw new Error("User not authenticated");
        const collectionPath = getInventoryPath();
        await addDoc(collection(db, collectionPath), {
            ...fruit,
            createdAt: new Date().toISOString(),
            createdBy: currentUser.uid // Track who added it
        });
    };

    const removeFruit = async (id) => {
        if (!currentUser) return;
        const collectionPath = getInventoryPath();
        const docPath = `${collectionPath}/${id}`;
        await deleteDoc(doc(db, docPath));
    };

    const consumeFruit = async (id, amount = 1) => {
        if (!currentUser) return;

        const fruit = state.fruits.find(f => f.id === id);
        if (!fruit) return;

        // 1. Update Inventory
        const newQuantity = (fruit.quantity || 1) - amount;
        const collectionPath = getInventoryPath();
        const inventoryPath = `${collectionPath}/${id}`;

        if (newQuantity <= 0) {
            await deleteDoc(doc(db, inventoryPath));
        } else {
            await updateDoc(doc(db, inventoryPath), {
                quantity: newQuantity
            });
        }

        // 2. Log Consumption (Shared or Personal?)
        // Decision: Log to personal history for "My contributions" AND Household history?
        // For MVP: Log to User's CONSUMED collection so "Reports" still work for the user.
        // We can ALSO log to household if we want shared stats later.
        const consumedPath = `users/${currentUser.uid}/consumed`;
        await addDoc(collection(db, consumedPath), {
            fruitName: fruit.name,
            amount: amount,
            consumedAt: new Date().toISOString(),
            householdId: userProfile?.householdId || null
        });

        // 3. Broadcast to Global Feed (Privacy-First)
        await broadcastConsumption(userProfile, fruit.name, amount);
    };

    const wasteFruit = async (id, amount = 1) => {
        if (!currentUser) return;

        const fruit = state.fruits.find(f => f.id === id);
        if (!fruit) return;

        const newQuantity = (fruit.quantity || 1) - amount;
        const collectionPath = getInventoryPath();
        const inventoryPath = `${collectionPath}/${id}`;

        if (newQuantity <= 0) {
            await deleteDoc(doc(db, inventoryPath));
        } else {
            await updateDoc(doc(db, inventoryPath), {
                quantity: newQuantity
            });
        }

        // 2. Log Waste
        const wastePath = `users/${currentUser.uid}/waste`;
        await addDoc(collection(db, wastePath), {
            fruitName: fruit.name,
            amount: amount,
            wasteDate: new Date().toISOString(),
            reason: 'Expired',
            householdId: userProfile?.householdId || null
        });

        // 3. Broadcast to Global Feed
        await broadcastWaste(userProfile, fruit.name, amount);
    };

    const getStats = async () => {
        if (!currentUser) return { consumed: [], wasted: [] };

        const consumedPath = `users/${currentUser.uid}/consumed`;
        const wastePath = `users/${currentUser.uid}/waste`;

        // Fetch all (in real app, limit to last 30 days or year)
        const [consumedSnap, wasteSnap] = await Promise.all([
            getDocs(collection(db, consumedPath)),
            getDocs(collection(db, wastePath))
        ]);

        return {
            consumed: consumedSnap.docs.map(d => d.data()),
            wasted: wasteSnap.docs.map(d => d.data())
        };
    };

    return (
        <FruitContext.Provider value={{
            fruits: state.fruits,
            addFruit,
            removeFruit,
            consumeFruit,
            wasteFruit,
            getStats,
            loading,
            error: state.error,
            user: currentUser,
            consumedToday // Export this
        }}>
            {children}
        </FruitContext.Provider>
    );
};

export const useFruit = () => {
    const context = useContext(FruitContext);
    if (!context) {
        throw new Error('useFruit must be used within a FruitProvider');
    }
    return context;
};
