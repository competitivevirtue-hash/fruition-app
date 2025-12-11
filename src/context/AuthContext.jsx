import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    deleteUser,
    OAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

import LoadingSplash from '../components/LoadingSplash';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Safety Timeout: Force entry if Firebase hangs (e.g. offline/network issues)
    useEffect(() => {
        const safetyTimer = setTimeout(() => {
            if (loading) {
                console.warn("Auth check timed out. Forcing entry.");
                setLoading(false);
            }
        }, 5000); // 5 seconds max wait

        return () => clearTimeout(safetyTimer);
    }, [loading]);

    async function ensureUserDocument(user) {
        if (!user) return null;

        const userRef = doc(db, 'users', user.uid);
        const statsRef = doc(db, 'system', 'stats');

        try {
            // Check if user doc exists first to avoid unnecessary transactions
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data();

                // Backfill location if missing
                if (!data.location) {
                    try {
                        const res = await fetch('https://ipapi.co/json/');
                        const locData = await res.json();
                        if (locData && !locData.error) {
                            const locationStr = `${locData.city}, ${locData.region_code || locData.country_name}`;
                            const locationObj = {
                                city: locData.city,
                                region: locData.region,
                                country: locData.country_name,
                                label: locationStr
                            };
                            await updateDoc(userRef, { location: locationObj });
                            data.location = locationObj;
                        }
                    } catch (error) { console.warn("Location fetch failed", error); }
                }

                setUserProfile(data);
                return data;
            }

            // User doesn't exist in DB, run transaction to assign Member ID
            const newProfile = await runTransaction(db, async (transaction) => {
                const statsDoc = await transaction.get(statsRef);
                let currentCount = 0;
                if (statsDoc.exists()) {
                    currentCount = statsDoc.data().totalUsers || 0;
                }

                const newMemberId = currentCount + 1;

                // Update global count
                transaction.set(statsRef, { totalUsers: newMemberId }, { merge: true });

                // Create user profile with Member ID
                const profileData = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    memberId: newMemberId,
                    joinedAt: serverTimestamp()
                };

                transaction.set(userRef, profileData);
                return profileData;
            });

            // Fetch IP-based location if missing (for Global Pulse)
            if (!newProfile.location) {
                try {
                    console.log("📍 Fetching user location for Global Pulse...");
                    const res = await fetch('https://ipapi.co/json/');
                    const locData = await res.json();
                    if (locData && !locData.error) {
                        const locationStr = `${locData.city}, ${locData.region_code || locData.country_name}`;
                        const locationObj = {
                            city: locData.city,
                            region: locData.region,
                            country: locData.country_name,
                            label: locationStr
                        };
                        // Update DB
                        await updateDoc(userRef, { location: locationObj });
                        newProfile.location = locationObj;
                    }
                } catch (error) {
                    console.warn("Could not fetch location:", error);
                }
            }

            console.log("New Member ID Assigned:", newProfile.memberId);
            setUserProfile(newProfile);
            return newProfile;

        } catch (error) {
            console.error("Error ensuring user document:", error);
            return null;
        }
    }

    async function claimFounderStatus() {
        if (!currentUser) return;
        const userRef = doc(db, 'users', currentUser.uid);

        try {
            await runTransaction(db, async (transaction) => {
                // Force update this user to Member #1
                transaction.set(userRef, { memberId: 1 }, { merge: true });
            });

            // Update local state immediately
            setUserProfile(prev => ({ ...prev, memberId: 1 }));
            console.log("Founder Status Claimed: Member #1");
            return true;
        } catch (error) {
            console.error("Error claiming founder status:", error);
            return false;
        }
    }

    function signup(email, password, name) {
        return createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Update profile with name
                return updateProfile(userCredential.user, {
                    displayName: name
                });
            });
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth).then(() => {
            setUserProfile(null);
        });
    }

    function deleteAccount() {
        return deleteUser(auth.currentUser).then(() => {
            setUserProfile(null);
        });
    }

    function loginWithApple() {
        const provider = new OAuthProvider('apple.com');
        return signInWithPopup(auth, provider);
    }

    function resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
    }

    async function updateUserSettings(settings) {
        if (!currentUser) return;
        const userRef = doc(db, 'users', currentUser.uid);
        try {
            await setDoc(userRef, { settings }, { merge: true });
            setUserProfile(prev => ({
                ...prev,
                settings: { ...(prev?.settings || {}), ...settings }
            }));
            return true;
        } catch (error) {
            console.error("Error updating user settings:", error);
            return false;
        }
    }

    async function updateLastActive() {
        if (!currentUser) return;
        const userRef = doc(db, 'users', currentUser.uid);
        try {
            await updateDoc(userRef, {
                lastActive: serverTimestamp()
            });
        } catch (error) {
            console.warn("Error updating presence:", error);
        }
    }

    // Presence Heartbeat: Update 'lastActive' every 5 minutes while app is open
    useEffect(() => {
        if (!currentUser) return;

        // Initial update
        updateLastActive();

        const interval = setInterval(() => {
            updateLastActive();
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
    }, [currentUser]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const profileData = await ensureUserDocument(user);

                if (profileData?.disabled) {
                    console.warn("⛔ ACCESS DENIED: User account is disabled.");
                    await signOut(auth);
                    setUserProfile(null);
                    setCurrentUser(null);
                    alert("Your account has been suspended by an administrator.");
                    setLoading(false);
                    return;
                }

                // Intelligent Founder Recognition
                if (user.email === 'paytonpleasanti@gmail.com') {
                    // We check this after ensureUserDocument, but we need to verify the *profile* from state or fetch it again.
                    // Since state update might be async, we'll check it inside a short timeout or just run it optimistically.
                    // Better: `ensureUserDocument` sets `userProfile`. But here we are inside the auth listener.
                    // safe approach: trigger the claim if we see the email, the transaction handles the rest safely.
                    const userRef = doc(db, 'users', user.uid);
                    const snap = await getDoc(userRef);
                    if (snap.exists() && snap.data().memberId !== 1) {
                        console.log("👑 Fixing Founder Status automatically...");
                        await runTransaction(db, async (transaction) => {
                            transaction.set(userRef, { memberId: 1 }, { merge: true });
                        });
                        // Update local thinking state will happen on next ensure/render cycle or we can force it
                        setUserProfile(prev => ({ ...prev, memberId: 1 }));
                    }
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userProfile,
        claimFounderStatus,
        signup,
        login,
        logout,
        deleteAccount,
        loginWithApple,
        updateUserSettings,
        resetPassword,
        isAdmin: userProfile?.role === 'admin' || currentUser?.email === 'paytonpleasanti@gmail.com'
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <LoadingSplash /> : children}
        </AuthContext.Provider>
    );
}
