// Script para agregar nicknames a usuarios existentes
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Descarga desde Firebase

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addNicknamesToExistingUsers() {
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.get();

        console.log(`Encontrados ${snapshot.size} usuarios`);

        const batch = db.batch();
        let count = 0;

        snapshot.forEach((doc) => {
            const userData = doc.data();

            // Solo agregar nickname si no existe
            if (!userData.nickname) {
                const defaultNickname = userData.email
                    ? userData.email.split('@')[0]
                    : `Usuario_${doc.id.substring(0, 4)}`;

                batch.update(doc.ref, {
                    nickname: defaultNickname,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                count++;
            }
        });

        if (count > 0) {
            await batch.commit();
            console.log(`✓ Nicknames agregados a ${count} usuarios`);
        } else {
            console.log('✓ Todos los usuarios ya tienen nickname');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

addNicknamesToExistingUsers();