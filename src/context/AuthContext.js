import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateEmail,
    updatePassword
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                email: userCredential.user.email,
                isSuperUser: false,
                createdAt: new Date()
            });
        }

        return userCredential;
    };

    const logout = () => signOut(auth);

    const updateUserEmail = (email) => updateEmail(currentUser, email);

    const updateUserPassword = (password) => updatePassword(currentUser, password);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                setCurrentUser({
                    ...user,
                    isSuperUser: userDoc.exists() ? userDoc.data().isSuperUser : false
                });
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        login,
        logout,
        updateUserEmail,
        updateUserPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};