// Script del Service Worker para notificaciones push
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Configuración de Firebase
firebase.initializeApp({
    apiKey: "AIzaSyA7XoL_swcWzzxFpOLXhqBANA3TTTxy4wU",
    authDomain: "pensioncontrolsystem.firebaseapp.com",
    projectId: "pensioncontrolsystem",
    storageBucket: "pensioncontrolsystem.firebasestorage.app",
    messagingSenderId: "22575552982",
    appId: "G-YHR5R53YQW"
});

const messaging = firebase.messaging();

// Manejar notificaciones en segundo plano
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Mensaje recibido en background:', payload);

    const notificationTitle = payload.data.title || 'Notificación de Pensiones';
    const notificationOptions = {
        body: payload.data.body || 'Tienes una nueva notificación',
        icon: '/logo192.png',
        badge: '/logo192.png',
        vibrate: [200, 100, 200],
        data: payload.data,
        tag: 'pension-notification',
        requireInteraction: true,
        actions: [
            {
                action: 'open',
                title: 'Abrir App'
            },
            {
                action: 'dismiss',
                title: 'Descartar'
            }
        ]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar clic en notificación
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notificación clickeada:', event);

    event.notification.close();

    const action = event.action;
    const notificationData = event.notification.data || {};

    if (action === 'dismiss') {
        console.log('Notificación descartada');
        return;
    }

    // Abrir la app cuando se hace clic en la notificación
    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        })
            .then((clientList) => {
                // Si ya hay una ventana abierta, enfócala
                for (const client of clientList) {
                    if (client.url.includes('/') && 'focus' in client) {
                        // Enviar datos de la notificación a la app
                        if (notificationData.pensionId) {
                            client.postMessage({
                                type: 'NOTIFICATION_CLICK',
                                data: notificationData
                            });
                        }
                        return client.focus();
                    }
                }
                // Si no hay ventana abierta, abre una nueva
                if (clients.openWindow) {
                    let url = '/';
                    if (notificationData.pensionId) {
                        url = `/active-pensions?pension=${notificationData.pensionId}`;
                    }
                    return clients.openWindow(url);
                }
            })
    );
});

// Manejar acción de botones
self.addEventListener('notificationclose', (event) => {
    console.log('[firebase-messaging-sw.js] Notificación cerrada:', event);
});