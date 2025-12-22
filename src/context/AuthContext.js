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
import { doc, getDoc, setDoc, updateDoc, deleteDoc, getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

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


    // Función para crear nuevos usuarios SIN cambiar sesión
    const createNewUser = async (email, password, isSuperUser = false, nickname = '') => {
        if (!currentUser?.isSuperUser) {
            throw new Error('Solo los superusuarios pueden crear nuevos usuarios');
        }

        try {
            // SOLUCIÓN: Crear una nueva instancia de Firebase para esta operación
            // Esto evita que afecte la sesión del usuario actual

            // 1. Importar configuración directamente
            const firebaseConfig = {
                apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
                authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
                projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
                storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.REACT_APP_FIREBASE_APP_ID
            };

            // 2. Crear una app secundaria para esta operación
            const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
            const secondaryAuth = getAuth(secondaryApp);
            const secondaryDb = getFirestore(secondaryApp);

            // 3. Crear usuario en la instancia secundaria
            const userCredential = await createUserWithEmailAndPassword(
                secondaryAuth,
                email,
                password
            );

            const userId = userCredential.user.uid;

            // 4. Crear documento en Firestore
            await setDoc(doc(secondaryDb, 'users', userId), {
                email: email,
                nickname: nickname || email.split('@')[0],
                isSuperUser: isSuperUser,
                createdBy: currentUser.uid,
                createdByEmail: currentUser.email,
                createdAt: new Date(),
                status: 'active',
                requiresPasswordChange: true
            });

            // 5. Cerrar sesión en la instancia secundaria
            await signOut(secondaryAuth);

            return {
                success: true,
                userId,
                email: email
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
                case 'auth/app-not-authorized':
                    customMessage = 'Error de configuración. Reinicia la aplicación';
                    break;
                default:
                    customMessage = error.message || customMessage;
            }

            throw new Error(customMessage);
        }
    };

    // Función para eliminar usuarios (solo superusuario, no puede eliminarse a sí mismo)
    const deleteUser = async (userId, userEmail) => {
        if (!currentUser?.isSuperUser) {
            throw new Error('Solo los superusuarios pueden eliminar usuarios');
        }

        if (userId === currentUser.uid) {
            throw new Error('No puedes eliminarte a ti mismo');
        }

        try {
            // Nota: Para eliminar usuarios de Authentication necesitarías Firebase Admin SDK
            // Esta función solo eliminará de Firestore por ahora
            // Para eliminación completa necesitarías un backend/cloud function

            // Eliminar de Firestore
            const userRef = doc(db, 'users', userId);
            await deleteDoc(userRef);

            return {
                success: true,
                message: `Usuario ${userEmail} eliminado del sistema`,
                userId
            };

        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
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
        createNewUser,
        deleteUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};