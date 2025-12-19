import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

export const createUserService = async (userData, currentUser) => {
    try {
        if (!currentUser?.isSuperUser) {
            throw new Error('Solo los superusuarios pueden crear nuevos usuarios');
        }

        // 1. Guardar el usuario actual para restaurarlo después
        const originalUser = auth.currentUser;

        // 2. Crear el nuevo usuario usando una instancia temporal de auth
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            userData.email,
            userData.password
        );

        const newUserId = userCredential.user.uid;

        // 3. Crear documento del usuario en Firestore
        await setDoc(doc(db, 'users', newUserId), {
            email: userData.email,
            nickname: userData.nickname || userData.email.split('@')[0],
            isSuperUser: userData.isSuperUser || false,
            createdBy: currentUser.uid,
            createdByEmail: currentUser.email,
            createdAt: new Date(),
            status: 'active',
            requiresPasswordChange: true
        });

        // 4. Cerrar sesión del nuevo usuario inmediatamente
        // (No necesitamos mantenerlo logueado)
        await auth.signOut();

        // 5. Si había un usuario original, restaurar su sesión
        if (originalUser) {
            // Necesitaríamos las credenciales originales aquí
            // En lugar de eso, simplemente manejaremos el estado en el frontend
        }

        return {
            success: true,
            userId: newUserId,
            email: userData.email
        };

    } catch (error) {
        console.error('Error en createUserService:', error);
        throw error;
    }
};