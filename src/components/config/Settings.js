import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCog,
    faUser,
    faEnvelope,
    faLock,
    faShieldAlt,
    faUsers,
    faToggleOn,
    faToggleOff,
    faSave,
    faUserTag,
    faUserCircle
} from '@fortawesome/free-solid-svg-icons';
import NicknameManager from './NicknameManager';

const Settings = () => {
    const { currentUser, updateUserEmail, updateUserPassword } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userLoading, setUserLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('profile');

    // Datos del perfil
    const [profileData, setProfileData] = useState({
        email: currentUser?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (currentUser?.isSuperUser) {
            fetchUsers();
        }
    }, [currentUser]);

    const fetchUsers = async () => {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef);
            const querySnapshot = await getDocs(q);

            const usersData = [];
            querySnapshot.forEach((doc) => {
                usersData.push({ id: doc.id, ...doc.data() });
            });

            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setUserLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Actualizar email si cambió
            if (profileData.email !== currentUser.email) {
                await updateUserEmail(profileData.email);
            }

            // Actualizar contraseña si se proporcionó
            if (profileData.newPassword) {
                if (profileData.newPassword !== profileData.confirmPassword) {
                    throw new Error('Las contraseñas no coinciden');
                }
                if (profileData.newPassword.length < 6) {
                    throw new Error('La contraseña debe tener al menos 6 caracteres');
                }
                await updateUserPassword(profileData.newPassword);
            }

            setSuccess('Perfil actualizado correctamente');
            setProfileData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (err) {
            setError(err.message || 'Error al actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSuperUser = async (userId, currentStatus) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                isSuperUser: !currentStatus
            });

            fetchUsers(); // Recargar lista de usuarios
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

    return (
        <div className="container">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{
                    fontSize: '24px',
                    color: 'var(--text-primary)',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <FontAwesomeIcon icon={faCog} />
                    Configuración
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Gestiona tu perfil y configuración del sistema
                </p>
            </div>

            {/* Pestañas */}
            <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '30px',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={() => setActiveTab('profile')}
                    style={{
                        padding: '12px 24px',
                        background: activeTab === 'profile' ? 'var(--accent-color)' : 'var(--glass-bg)',
                        color: activeTab === 'profile' ? 'var(--primary-color)' : 'var(--text-primary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <FontAwesomeIcon icon={faUserCircle} />
                    Perfil
                </button>

                {currentUser?.isSuperUser && (
                    <>
                        <button
                            onClick={() => setActiveTab('nicknames')}
                            style={{
                                padding: '12px 24px',
                                background: activeTab === 'nicknames' ? 'var(--accent-color)' : 'var(--glass-bg)',
                                color: activeTab === 'nicknames' ? 'var(--primary-color)' : 'var(--text-primary)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <FontAwesomeIcon icon={faUserTag} />
                            Nicknames
                        </button>

                        <button
                            onClick={() => setActiveTab('users')}
                            style={{
                                padding: '12px 24px',
                                background: activeTab === 'users' ? 'var(--accent-color)' : 'var(--glass-bg)',
                                color: activeTab === 'users' ? 'var(--primary-color)' : 'var(--text-primary)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <FontAwesomeIcon icon={faUsers} />
                            Usuarios
                        </button>
                    </>
                )}
            </div>

            {/* Mensajes de estado */}
            {error && (
                <div style={{
                    background: 'rgba(255, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 0, 0, 0.3)',
                    borderRadius: '10px',
                    padding: '12px',
                    marginBottom: '20px',
                    color: '#ff6b6b'
                }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    background: 'rgba(0, 255, 157, 0.1)',
                    border: '1px solid rgba(0, 255, 157, 0.3)',
                    borderRadius: '10px',
                    padding: '12px',
                    marginBottom: '20px',
                    color: '#00ff9d'
                }}>
                    {success}
                </div>
            )}

            {/* Contenido de pestañas */}
            {activeTab === 'profile' && (
                <div className="glass" style={{ padding: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        marginBottom: '20px',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <FontAwesomeIcon icon={faUserCircle} />
                        Información del Perfil
                    </h2>

                    {/* Mostrar nickname actual */}
                    {currentUser?.nickname && (
                        <div style={{
                            marginBottom: '20px',
                            padding: '15px',
                            background: 'rgba(0, 255, 157, 0.05)',
                            borderRadius: '10px',
                            border: '1px solid rgba(0, 255, 157, 0.1)'
                        }}>
                            <div style={{
                                fontSize: '14px',
                                color: 'var(--text-secondary)',
                                marginBottom: '5px'
                            }}>
                                Tu nickname actual:
                            </div>
                            <div style={{
                                fontSize: '18px',
                                color: 'var(--accent-color)',
                                fontWeight: 'bold'
                            }}>
                                {currentUser.nickname}
                            </div>
                            <div style={{
                                fontSize: '12px',
                                color: 'var(--text-secondary)',
                                marginTop: '8px'
                            }}>
                                Este nickname se muestra en el sidebar. Solo los superusuarios pueden modificarlo.
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleUpdateProfile}>
                        <div style={{ display: 'grid', gap: '20px', marginBottom: '30px' }}>
                            {/* Email */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <FontAwesomeIcon icon={faEnvelope} />
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleProfileChange}
                                    className="input-field"
                                    required
                                />
                            </div>

                            {/* Nueva contraseña */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <FontAwesomeIcon icon={faLock} />
                                    Nueva contraseña
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={profileData.newPassword}
                                    onChange={handleProfileChange}
                                    className="input-field"
                                    placeholder="Deja en blanco para mantener la actual"
                                />
                            </div>

                            {/* Confirmar contraseña */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: 'var(--text-secondary)'
                                }}>
                                    Confirmar nueva contraseña
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={profileData.confirmPassword}
                                    onChange={handleProfileChange}
                                    className="input-field"
                                    placeholder="Confirmar nueva contraseña"
                                />
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '15px'
                        }}>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <FontAwesomeIcon icon={faSave} />
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'nicknames' && currentUser?.isSuperUser && (
                <NicknameManager />
            )}

            {activeTab === 'users' && currentUser?.isSuperUser && (
                <div className="glass" style={{ padding: '30px' }}>
                    <h2 style={{
                        fontSize: '20px',
                        marginBottom: '20px',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <FontAwesomeIcon icon={faUsers} />
                        Gestión de Usuarios
                    </h2>

                    {userLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                            Cargando usuarios...
                        </div>
                    ) : users.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                            No hay usuarios registrados
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    style={{
                                        padding: '20px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '15px'
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '16px',
                                            color: 'var(--text-primary)',
                                            marginBottom: '5px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                            <span>{user.email}</span>
                                            {user.id === currentUser.uid && (
                                                <span style={{
                                                    fontSize: '12px',
                                                    background: 'var(--accent-color)',
                                                    color: 'var(--primary-color)',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px'
                                                }}>
                                                    Tú
                                                </span>
                                            )}
                                        </div>

                                        {user.nickname && (
                                            <div style={{
                                                fontSize: '14px',
                                                color: 'var(--accent-color)',
                                                fontWeight: 'bold',
                                                marginBottom: '5px'
                                            }}>
                                                {user.nickname}
                                            </div>
                                        )}

                                        <div style={{
                                            fontSize: '12px',
                                            color: 'var(--text-secondary)',
                                            display: 'flex',
                                            gap: '15px',
                                            flexWrap: 'wrap'
                                        }}>
                                            <span>ID: {user.id.substring(0, 10)}...</span>
                                            <span>Registrado: {new Date(user.createdAt?.toDate()).toLocaleDateString()}</span>
                                            {user.updatedAt && (
                                                <span>Actualizado: {new Date(user.updatedAt?.toDate()).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                                                Super Usuario
                                            </div>
                                            <button
                                                onClick={() => handleToggleSuperUser(user.id, user.isSuperUser)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: user.isSuperUser ? 'var(--accent-color)' : 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    fontSize: '20px',
                                                    padding: '5px'
                                                }}
                                                title={user.isSuperUser ? 'Quitar privilegios' : 'Hacer super usuario'}
                                                disabled={user.id === currentUser.uid}
                                            >
                                                <FontAwesomeIcon icon={user.isSuperUser ? faToggleOn : faToggleOff} />
                                            </button>
                                        </div>

                                        {user.isSuperUser && (
                                            <div style={{
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                background: 'rgba(0, 255, 157, 0.1)',
                                                color: '#00ff9d',
                                                border: '1px solid rgba(0, 255, 157, 0.3)'
                                            }}>
                                                Super Usuario
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{
                        marginTop: '30px',
                        padding: '20px',
                        background: 'rgba(0, 255, 157, 0.05)',
                        borderRadius: '12px',
                        border: '1px solid rgba(0, 255, 157, 0.1)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '10px',
                            color: 'var(--accent-color)'
                        }}>
                            <FontAwesomeIcon icon={faShieldAlt} />
                            <strong>Nota sobre privilegios de Super Usuario:</strong>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                            Los Super Usuarios pueden editar todas las pensiones, gestionar otros usuarios y configurar nicknames.
                            Solo se puede cambiar el estado de Super Usuario de otros usuarios, no el propio.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;