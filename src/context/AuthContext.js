import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    getAuth, // ← AGREGAR ESTA IMPORTACIÓN
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateEmail,
    updatePassword,
    createUserWithEmailAndPassword
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

    // Función para crear nuevos usuarios (solo superusuario) - SIN CAMBIAR SESIÓN
    const createNewUser = async (email, password, isSuperUser = false, nickname = '') => {
        if (!currentUser?.isSuperUser) {
            throw new Error('Solo los superusuarios pueden crear nuevos usuarios');
        }

        try {
            // SOLUCIÓN CORREGIDA: No usar getAuth() separado, usar el auth existente
            // Creamos el usuario directamente con el auth actual
            const userCredential = await createUserWithEmailAndPassword(
                auth, // Usamos la misma instancia de auth
                email,
                password
            );

            const userId = userCredential.user.uid;

            // Crear documento en Firestore
            await setDoc(doc(db, 'users', userId), {
                email: email,
                nickname: nickname || email.split('@')[0],
                isSuperUser: isSuperUser,
                createdBy: currentUser.uid,
                createdByEmail: currentUser.email,
                createdAt: new Date(),
                status: 'active',
                requiresPasswordChange: true
            });

            return {
                success: true,
                userId,
                email,
                message: 'Usuario creado exitosamente'
            };

        } catch (error) {
            console.error('Error creating user:', error);

            // Manejo específico de errores
            let customMessage = 'Error al crear el usuario';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    customMessage = 'El correo electrónico ya está registrado';
                    break;
                case 'auth/invalid-email':
                    customMessage = 'El correo electrónico no es válido';
                    break;
                case 'auth/operation-not-allowed':
                    customMessage = 'La creación de usuarios está deshabilitada';
                    break;
                case 'auth/weak-password':
                    customMessage = 'La contraseña es demasiado débil (mínimo 6 caracteres)';
                    break;
                default:
                    customMessage = error.message || customMessage;
            }

            throw new Error(customMessage);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                const userData = userDoc.exists() ? userDoc.data() : {};

                setCurrentUser({
                    uid: user.uid,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    isSuperUser: userData.isSuperUser || false,
                    nickname: userData.nickname || user.email?.split('@')[0] || 'Usuario',
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