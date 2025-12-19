import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateEmail,
    updatePassword,
    createUserWithEmailAndPassword // ← AGREGAR ESTA IMPORTACIÓN
} from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

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
                nickname: email.split('@')[0], // Nickname por defecto
                isSuperUser: false,
                createdAt: new Date()
            });
        }

        return userCredential;
    };

    const logout = () => signOut(auth);

    const updateUserEmail = (email) => updateEmail(currentUser, email);

    const updateUserPassword = (password) => updatePassword(currentUser, password);

    // Función para actualizar el nickname (solo superusuario)
    const updateUserNickname = async (userId, newNickname) => {
        if (!currentUser?.isSuperUser) {
            throw new Error('Solo los superusuarios pueden cambiar nicknames');
        }

        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            nickname: newNickname,
            updatedAt: new Date()
        }, { merge: true });

        // Si es el usuario actual, actualizar el estado
        if (userId === currentUser.uid) {
            setCurrentUser(prev => ({
                ...prev,
                nickname: newNickname
            }));
        }
    };

    // Función para crear nuevos usuarios (solo superusuario)
    const createNewUser = async (email, password, isSuperUser = false, nickname = '') => {
        if (!currentUser?.isSuperUser) {
            throw new Error('Solo los superusuarios pueden crear nuevos usuarios');
        }

        try {
            // 1. Crear usuario en Authentication
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const userId = userCredential.user.uid;

            // 2. Crear documento en Firestore
            await setDoc(doc(db, 'users', userId), {
                email: email,
                nickname: nickname || email.split('@')[0],
                isSuperUser: isSuperUser,
                createdBy: currentUser.uid,
                createdByEmail: currentUser.email,
                createdAt: new Date(),
                status: 'active',
                requiresPasswordChange: true // Bandera para primer inicio
            });

            return { success: true, userId };
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                const userData = userDoc.exists() ? userDoc.data() : {};

                setCurrentUser({
                    ...user,
                    isSuperUser: userData.isSuperUser || false,
                    nickname: userData.nickname || user.email.split('@')[0], // Default
                    ...userData
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
        updateUserPassword,
        updateUserNickname,
        createNewUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};