import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,
    faToggleOn,
    faToggleOff,
    faTrash,
    faEnvelope,
    faUserTag,
    faShieldAlt,
    faCalendar,
    faKey
} from '@fortawesome/free-solid-svg-icons';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef);
            const querySnapshot = await getDocs(q);

            const usersData = [];
            querySnapshot.forEach((doc) => {
                usersData.push({ id: doc.id, ...doc.data() });
            });

            // Ordenar por fecha de creación (más recientes primero)
            usersData.sort((a, b) => {
                return new Date(b.createdAt?.toDate()) - new Date(a.createdAt?.toDate());
            });

            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        if (!currentUser?.isSuperUser) return;

        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                status: currentStatus === 'active' ? 'inactive' : 'active',
                updatedAt: new Date()
            });

            fetchUsers(); // Recargar lista
        } catch (error) {
            console.error('Error updating user status:', error);
        }
    };

    const handleResetPassword = async (userId) => {
        if (!currentUser?.isSuperUser) return;

        if (window.confirm('¿Estás seguro de que quieres resetear la contraseña de este usuario? Se le enviará un correo para restablecerla.')) {
            // Aquí implementarías el reset de contraseña
            // Firebase Admin SDK requerido para el backend
            alert('Función de reset de contraseña requeriría implementación en backend');
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                Cargando usuarios...
            </div>
        );
    }

    return (
        <div className="glass" style={{ padding: '20px', marginTop: '20px' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px'
            }}>
                <FontAwesomeIcon icon={faUsers} style={{ color: 'var(--accent-color)', fontSize: '20px' }} />
                <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>
                    Usuarios Registrados ({users.length})
                </h3>
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
                {users.map((user) => (
                    <div
                        key={user.id}
                        style={{
                            padding: '20px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            border: '1px solid var(--glass-border)',
                            borderLeft: user.status === 'inactive'
                                ? '4px solid #ff6b6b'
                                : user.isSuperUser
                                    ? '4px solid var(--accent-color)'
                                    : '4px solid transparent'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                            {/* Información del usuario */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <FontAwesomeIcon icon={faEnvelope} style={{ color: 'var(--text-secondary)', fontSize: '14px' }} />
                                    <div style={{
                                        fontSize: '16px',
                                        color: 'var(--text-primary)',
                                        fontWeight: '500'
                                    }}>
                                        {user.email}
                                        {user.id === currentUser?.uid && (
                                            <span style={{
                                                fontSize: '12px',
                                                background: 'var(--accent-color)',
                                                color: 'var(--primary-color)',
                                                padding: '2px 8px',
                                                borderRadius: '10px',
                                                marginLeft: '10px'
                                            }}>
                                                Tú
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {user.nickname && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                        <FontAwesomeIcon icon={faUserTag} style={{ color: 'var(--text-secondary)', fontSize: '14px' }} />
                                        <div style={{
                                            fontSize: '14px',
                                            color: 'var(--accent-color)',
                                            fontWeight: 'bold'
                                        }}>
                                            {user.nickname}
                                        </div>
                                    </div>
                                )}

                                {/* Detalles adicionales */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                    gap: '10px',
                                    marginTop: '15px',
                                    fontSize: '12px',
                                    color: 'var(--text-secondary)'
                                }}>
                                    <div>
                                        <div style={{ marginBottom: '2px' }}>Creado por:</div>
                                        <div style={{ fontWeight: '500' }}>{user.createdByEmail || 'Sistema'}</div>
                                    </div>

                                    <div>
                                        <div style={{ marginBottom: '2px' }}>Fecha creación:</div>
                                        <div style={{ fontWeight: '500' }}>
                                            {user.createdAt?.toDate().toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ marginBottom: '2px' }}>Estado:</div>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '10px',
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            background: user.status === 'active'
                                                ? 'rgba(0, 255, 157, 0.1)'
                                                : 'rgba(255, 107, 107, 0.1)',
                                            color: user.status === 'active' ? '#00ff9d' : '#ff6b6b',
                                            border: `1px solid ${user.status === 'active'
                                                ? 'rgba(0, 255, 157, 0.3)'
                                                : 'rgba(255, 107, 107, 0.3)'}`
                                        }}>
                                            {user.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Acciones (solo para superusuarios) */}
                            {currentUser?.isSuperUser && user.id !== currentUser.uid && (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px',
                                    minWidth: '120px'
                                }}>
                                    {/* Toggle Super Usuario */}
                                    <button
                                        onClick={() => handleToggleSuperUser(user.id, user.isSuperUser)}
                                        className="btn-secondary"
                                        style={{
                                            padding: '8px 12px',
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: user.isSuperUser
                                                ? 'rgba(0, 255, 157, 0.1)'
                                                : 'transparent',
                                            color: user.isSuperUser ? '#00ff9d' : 'var(--text-primary)'
                                        }}
                                    >
                                        <FontAwesomeIcon icon={user.isSuperUser ? faToggleOn : faToggleOff} />
                                        {user.isSuperUser ? 'Super Usuario' : 'Hacer Super'}
                                    </button>

                                    {/* Toggle Estado */}
                                    <button
                                        onClick={() => handleToggleStatus(user.id, user.status)}
                                        className="btn-secondary"
                                        style={{
                                            padding: '8px 12px',
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: user.status === 'active'
                                                ? 'rgba(255, 107, 107, 0.1)'
                                                : 'rgba(0, 255, 157, 0.1)',
                                            color: user.status === 'active' ? '#ff6b6b' : '#00ff9d'
                                        }}
                                    >
                                        {user.status === 'active' ? 'Desactivar' : 'Activar'}
                                    </button>

                                    {/* Reset Password */}
                                    <button
                                        onClick={() => handleResetPassword(user.id)}
                                        className="btn-secondary"
                                        style={{
                                            padding: '8px 12px',
                                            fontSize: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faKey} />
                                        Reset Password
                                    </button>
                                </div>
                            )}

                            {/* Badge de Super Usuario */}
                            {user.isSuperUser && (
                                <div style={{
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    background: 'rgba(0, 255, 157, 0.1)',
                                    color: '#00ff9d',
                                    border: '1px solid rgba(0, 255, 157, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    height: 'fit-content'
                                }}>
                                    <FontAwesomeIcon icon={faShieldAlt} />
                                    Super Usuario
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserList;