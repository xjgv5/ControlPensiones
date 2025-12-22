const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.checkExpiringPensions = functions.pubsub
    .schedule('every day 09:00') // Se ejecuta todos los días a las 9:00 AM
    .timeZone('America/Mexico_City') // Ajusta a tu zona horaria
    .onRun(async (context) => {
        try {
            console.log('Iniciando verificación de pensiones próximas a vencer...');

            const now = admin.firestore.Timestamp.now();
            const today = new Date(now.toDate());

            // 1. Obtener todos los usuarios activos (últimas 48 horas)
            const activeUsers = await getActiveUsers();

            if (activeUsers.length === 0) {
                console.log('No hay usuarios activos en las últimas 48 horas');
                return null;
            }

            console.log(`Usuarios activos: ${activeUsers.length}`);

            // 2. Para cada usuario activo, verificar sus configuraciones
            for (const user of activeUsers) {
                await processUserNotifications(user, today);
            }

            console.log('Verificación de pensiones completada');
            return null;

        } catch (error) {
            console.error('Error en la función:', error);
            return null;
        }
    });

async function getActiveUsers() {
    try {
        // Obtener usuarios que estuvieron activos en las últimas 48 horas
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - 48);

        const activityRef = admin.firestore().collection('user_activity');
        const snapshot = await activityRef
            .where('lastActive', '>=', cutoffTime)
            .get();

        const activeUsers = [];
        snapshot.forEach(doc => {
            activeUsers.push({ id: doc.id, ...doc.data() });
        });

        return activeUsers;
    } catch (error) {
        console.error('Error obteniendo usuarios activos:', error);
        return [];
    }
}

async function processUserNotifications(user, today) {
    try {
        // 1. Obtener configuración del usuario
        const settingsRef = admin.firestore().collection('user_notification_settings').doc(user.id);
        const settingsDoc = await settingsRef.get();

        if (!settingsDoc.exists) {
            console.log(`No hay configuración para usuario ${user.email}`);
            return;
        }

        const settings = settingsDoc.data();

        // 2. Verificar si las notificaciones están habilitadas
        if (!settings.enabled) {
            console.log(`Notificaciones deshabilitadas para ${user.email}`);
            return;
        }

        // 3. Verificar horario
        if (!isWithinActiveHours(settings, today)) {
            console.log(`Fuera del horario activo para ${user.email}`);
            return;
        }

        // 4. Verificar fines de semana
        if (!settings.allowWeekends && isWeekend(today)) {
            console.log(`Fin de semana deshabilitado para ${user.email}`);
            return;
        }

        // 5. Obtener tokens FCM del usuario
        const tokens = await getUserTokens(user.id);
        if (tokens.length === 0) {
            console.log(`No hay tokens para ${user.email}`);
            return;
        }

        // 6. Buscar pensiones que vencen en X días
        const daysBefore = settings.daysBefore || 3;
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() + daysBefore);

        const pensions = await getExpiringPensions(targetDate);

        if (pensions.length === 0) {
            console.log(`No hay pensiones próximas a vencer para ${user.email}`);
            return;
        }

        // 7. Enviar notificaciones
        await sendNotifications(user, pensions, tokens, daysBefore);

    } catch (error) {
        console.error(`Error procesando notificaciones para ${user.email}:`, error);
    }
}

async function getUserTokens(userId) {
    try {
        const tokensRef = admin.firestore().collection('user_tokens').doc(userId);
        const tokenDoc = await tokensRef.get();

        if (tokenDoc.exists && tokenDoc.data().token) {
            return [tokenDoc.data().token];
        }

        return [];
    } catch (error) {
        console.error('Error obteniendo tokens:', error);
        return [];
    }
}

async function getExpiringPensions(targetDate) {
    try {
        const targetDateStr = targetDate.toISOString().split('T')[0];

        const pensionsRef = admin.firestore().collection('pensions');
        const snapshot = await pensionsRef
            .where('status', '==', 'active')
            .where('expirationDate', '==', targetDateStr)
            .get();

        const pensions = [];
        snapshot.forEach(doc => {
            pensions.push({ id: doc.id, ...doc.data() });
        });

        return pensions;
    } catch (error) {
        console.error('Error obteniendo pensiones:', error);
        return [];
    }
}

async function sendNotifications(user, pensions, tokens, daysBefore) {
    try {
        const messages = pensions.map(pension => ({
            notification: {
                title: `⚠️ Pensión próxima a vencer`,
                body: `${pension.personName} - ${pension.companyName} vence en ${daysBefore} día${daysBefore !== 1 ? 's' : ''}`
            },
            data: {
                type: 'pension_expiry',
                pensionId: pension.id,
                personName: pension.personName,
                companyName: pension.companyName,
                expirationDate: pension.expirationDate,
                daysBefore: daysBefore.toString(),
                click_action: 'FLUTTER_NOTIFICATION_CLICK'
            },
            tokens: tokens
        }));

        // Enviar notificaciones por lotes
        for (const message of messages) {
            if (message.tokens.length > 0) {
                const response = await admin.messaging().sendMulticast(message);

                // Registrar envío
                await logNotificationSent(user, pension, response);

                console.log(`Notificación enviada a ${user.email}: ${pension.personName}`);
            }
        }
    } catch (error) {
        console.error('Error enviando notificaciones:', error);
    }
}

async function logNotificationSent(user, pension, response) {
    try {
        const logRef = admin.firestore().collection('notification_logs').doc();
        await logRef.set({
            userId: user.id,
            userEmail: user.email,
            pensionId: pension.id,
            pensionName: `${pension.personName} - ${pension.companyName}`,
            expirationDate: pension.expirationDate,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            successCount: response.successCount,
            failureCount: response.failureCount,
            message: 'Pensión próxima a vencer'
        });
    } catch (error) {
        console.error('Error registrando notificación:', error);
    }
}

function isWithinActiveHours(settings, date) {
    try {
        const now = date;
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const [startHour, startMinute] = settings.activeHours.start.split(':').map(Number);
        const [endHour, endMinute] = settings.activeHours.end.split(':').map(Number);

        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;

        return currentTime >= startTime && currentTime <= endTime;
    } catch (error) {
        console.error('Error verificando horario activo:', error);
        return true; // Por defecto, permitir
    }
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Domingo, 6 = Sábado
}