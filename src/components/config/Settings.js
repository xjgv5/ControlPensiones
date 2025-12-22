import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCog,
    faUser,
    faEnvelope,
    faLock,
    faSave,
    faUserCircle,
    faBell
} from '@fortawesome/free-solid-svg-icons';
import UserList from '../users/UserList';
import { toast } from '../../App';
import NotificationSettings from './NotificationSettings';

const Settings = () => {
    const { currentUser, updateUserEmail, updateUserPassword } = useAuth();
    const [loading, setLoading] = useState(false);
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

            toast.success('Perfil actualizado correctamente');

        } catch (err) {
            setError(err.message || 'Error al actualizar el perfil');
            toast.error(err.message || 'Error al actualizar el perfil');
        } finally {
            setLoading(false);
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


                <button
                    onClick={() => setActiveTab('notifications')}
                    style={{
                        padding: '12px 24px',
                        background: activeTab === 'notifications' ? 'var(--accent-color)' : 'var(--glass-bg)',
                        color: activeTab === 'notifications' ? 'var(--primary-color)' : 'var(--text-primary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <FontAwesomeIcon icon={faBell} />
                    Notificaciones
                </button>

                {currentUser?.isSuperUser && (
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
                        <FontAwesomeIcon icon={faUserCircle} />
                        Gestión de Usuarios
                    </button>
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

            {activeTab === 'notifications' && (
                <NotificationSettings />
            )}

            {activeTab === 'users' && currentUser?.isSuperUser && (
                <UserList />
            )}
        </div>
    );
};

export default Settings;