const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function listAllUsers() {
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.get();

        console.log('\n📋 USUARIOS REGISTRADOS:\n');
        console.log('═'.repeat(80));

        snapshot.forEach((doc) => {
            const user = doc.data();
            console.log(`ID: ${doc.id}`);
            console.log(`Email: ${user.email}`);
            console.log(`Nickname: ${user.nickname || 'No asignado'}`);
            console.log(`Super Usuario: ${user.isSuperUser ? '✅' : '❌'}`);
            console.log(`Creado por: ${user.createdByEmail || 'Sistema'}`);
            console.log(`Fecha: ${user.createdAt?.toDate().toLocaleString()}`);
            console.log(`Estado: ${user.status || 'active'}`);
            console.log('─'.repeat(40));
        });

        console.log(`\nTotal: ${snapshot.size} usuarios\n`);

    } catch (error) {
        console.error('Error:', error);
    }
}

listAllUsers();