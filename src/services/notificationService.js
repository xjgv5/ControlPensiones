import { getMessaging, getToken, onMessage, deleteToken } from "firebase/messaging";
import { auth, db } from "./firebase";
import {
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    serverTimestamp,
    addDoc
} from "firebase/firestore";
import { format, addDays, differenceInDays, isAfter, isBefore } from "date-fns";

// Inicializar Firebase Cloud Messaging
let messaging = null;

const getMessagingInstance = () => {
    if (!messaging) {
        messaging = getMessaging();
    }
    return messaging;
};

// Solicitar permiso para notificaciones
export const requestNotificationPermission = async () => {
    try {
        if (!("Notification" in window)) {
            console.log("Este navegador no soporta notificaciones");
            return null;
        }

        // Verificar si ya tenemos permiso
        if (Notification.permission === "granted") {
            return await getFCMToken();
        }

        // Solicitar permiso
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
            console.log("Permiso para notificaciones concedido");
            return await getFCMToken();
        } else {
            console.log("Permiso para notificaciones denegado");
            return null;
        }
    } catch (error) {
        console.error("Error al solicitar permiso:", error);
        return null;
    }
};

// Obtener token FCM
export const getFCMToken = async () => {
    try {
        const messaging = getMessagingInstance();
        const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;

        if (!vapidKey) {
            console.error("VAPID key no configurada");
            return null;
        }

        const currentToken = await getToken(messaging, { vapidKey });

        if (currentToken) {
            console.log("Token FCM obtenido:", currentToken);

            // Guardar token en Firestore
            if (auth.currentUser) {
                await saveUserToken(currentToken);
            }

            return currentToken;
        } else {
            console.log('No se pudo obtener el token FCM');
            return null;
        }
    } catch (error) {
        console.error("Error al obtener token FCM:", error);
        return null;
    }
};

// Guardar token del usuario en Firestore
const saveUserToken = async (token) => {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const tokenRef = doc(db, "user_tokens", user.uid);
        await setDoc(tokenRef, {
            userId: user.uid,
            token: token,
            email: user.email,
            deviceInfo: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language
            },
            notificationSettings: {
                enabled: true,
                daysBefore: 3, // Días antes de vencer
                sendTime: "09:00", // Hora de envío
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                activeHours: {
                    start: "08:00",
                    end: "22:00"
                },
                allowWeekends: true
            },
            lastActive: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        }, { merge: true });

        console.log("Token guardado en Firestore");
    } catch (error) {
        console.error("Error guardando token:", error);
    }
};

// Eliminar token (cuando usuario cierra sesión)
export const deleteFCMToken = async () => {
    try {
        const messaging = getMessagingInstance();
        const token = await getToken(messaging);

        if (token) {
            await deleteToken(messaging);
            console.log("Token eliminado");

            // Eliminar de Firestore
            if (auth.currentUser) {
                const tokenRef = doc(db, "user_tokens", auth.currentUser.uid);
                await updateDoc(tokenRef, {
                    token: null,
                    notificationSettings: {
                        enabled: false
                    },
                    updatedAt: serverTimestamp()
                });
            }
        }
    } catch (error) {
        console.error("Error eliminando token:", error);
    }
};

// Escuchar mensajes en primer plano
export const setupForegroundNotifications = (callback) => {
    try {
        const messaging = getMessagingInstance();

        onMessage(messaging, (payload) => {
            console.log("Mensaje recibido en primer plano:", payload);

            if (callback && typeof callback === 'function') {
                callback(payload);
            }

            // Mostrar notificación si la app está en primer plano
            if (payload.notification || payload.data) {
                showBrowserNotification(
                    payload.notification?.title || payload.data?.title || "Notificación",
                    payload.notification?.body || payload.data?.body || "Nueva notificación"
                );
            }
        });
    } catch (error) {
        console.error("Error configurando notificaciones en primer plano:", error);
    }
};

// Mostrar notificación del navegador
export const showBrowserNotification = (title, body, options = {}) => {
    if (!("Notification" in window)) {
        console.log("Este navegador no soporta notificaciones");
        return;
    }

    if (Notification.permission === "granted") {
        const notification = new Notification(title, {
            body: body,
            icon: "/logo192.png",
            badge: "/logo192.png",
            vibrate: [200, 100, 200],
            tag: "pension-notification",
            renotify: true,
            requireInteraction: true,
            ...options
        });

        notification.onclick = () => {
            window.focus();
            notification.close();

            // Navegar a la pensión si hay ID
            if (options.data?.pensionId) {
                window.location.href = `/active-pensions?pension=${options.data.pensionId}`;
            }
        };
    }
};

// Obtener configuraciones de notificación del usuario
export const getUserNotificationSettings = async (userId) => {
    try {
        const settingsRef = doc(db, "user_notification_settings", userId);
        const settingsDoc = await getDoc(settingsRef);

        if (settingsDoc.exists()) {
            return settingsDoc.data();
        } else {
            // Configuración por defecto
            const defaultSettings = {
                daysBefore: 3,
                sendTime: "09:00",
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                activeHours: {
                    start: "08:00",
                    end: "22:00"
                },
                allowWeekends: true,
                enabled: true,
                createdAt: serverTimestamp()
            };

            await setDoc(settingsRef, defaultSettings);
            return defaultSettings;
        }
    } catch (error) {
        console.error("Error obteniendo configuración:", error);
        return null;
    }
};

// Actualizar configuraciones de notificación
export const updateUserNotificationSettings = async (userId, settings) => {
    try {
        const settingsRef = doc(db, "user_notification_settings", userId);
        await setDoc(settingsRef, {
            ...settings,
            updatedAt: serverTimestamp()
        }, { merge: true });

        return true;
    } catch (error) {
        console.error("Error actualizando configuración:", error);
        return false;
    }
};

// Registrar actividad del usuario
export const updateUserActivity = async () => {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const activityRef = doc(db, "user_activity", user.uid);
        await setDoc(activityRef, {
            userId: user.uid,
            email: user.email,
            lastActive: serverTimestamp(),
            userAgent: navigator.userAgent,
            online: true
        }, { merge: true });
    } catch (error) {
        console.error("Error registrando actividad:", error);
    }
};

// Verificar si el usuario está activo (últimas 48 horas)
export const isUserActive = async (userId) => {
    try {
        const activityRef = doc(db, "user_activity", userId);
        const activityDoc = await getDoc(activityRef);

        if (activityDoc.exists()) {
            const data = activityDoc.data();
            const lastActive = data.lastActive?.toDate();
            const now = new Date();
            const hoursDiff = (now - lastActive) / (1000 * 60 * 60);

            return hoursDiff <= 48; // Activo si estuvo en línea en las últimas 48 horas
        }

        return false;
    } catch (error) {
        console.error("Error verificando actividad:", error);
        return false;
    }
};

// Inicializar servicio de notificaciones
export const initNotifications = async () => {
    if (!("Notification" in window)) {
        console.log("Este navegador no soporta notificaciones");
        return false;
    }

    // Configurar Service Worker
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Service Worker registrado:', registration);
        } catch (error) {
            console.error('Error registrando Service Worker:', error);
        }
    }

    // Configurar notificaciones en primer plano
    setupForegroundNotifications((payload) => {
        console.log('Notificación recibida:', payload);
    });

    // Registrar actividad del usuario
    await updateUserActivity();

    return true;
};