import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    getUserNotificationSettings,
    updateUserNotificationSettings,
    requestNotificationPermission
} from '../../services/notificationService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBell,
    faBellSlash,
    faSave,
    faClock,
    faCalendarDay,
    faEnvelope,
    faMobileAlt,
    faCheckCircle,
    faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { toast } from '../../App';

const NotificationSettings = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [permission, setPermission] = useState(Notification.permission);
    const [settings, setSettings] = useState({
        enabled: true,
        daysBefore: 3,
        sendTime: "09:00",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        activeHours: {
            start: "08:00",
            end: "22:00"
        },
        allowWeekends: true
    });

    useEffect(() => {
        loadSettings();
    }, [currentUser]);

    useEffect(() => {
        // Escuchar cambios en el permiso
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const loadSettings = async () => {
        if (!currentUser) return;

        try {
            const userSettings = await getUserNotificationSettings(currentUser.uid);
            if (userSettings) {
                setSettings(prev => ({
                    ...prev,
                    ...userSettings
                }));
            }
        } catch (error) {
            console.error('Error cargando configuración:', error);
            toast.error('Error al cargar configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleEnableNotifications = async () => {
        try {
            const token = await requestNotificationPermission();
            if (token) {
                setPermission('granted');
                toast.success('Notificaciones activadas correctamente');
            }
        } catch (error) {
            console.error('Error activando notificaciones:', error);
            toast.error('Error al activar notificaciones');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setSettings(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setSettings(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSave = async () => {
        if (!currentUser) return;

        setSaving(true);
        try {
            const success = await updateUserNotificationSettings(currentUser.uid, settings);
            if (success) {
                toast.success('Configuración guardada correctamente');
            } else {
                toast.error('Error al guardar configuración');
            }
        } catch (error) {
            console.error('Error guardando configuración:', error);
            toast.error('Error al guardar configuración');
        } finally {
            setSaving(false);
        }
    };

    const handleOpenBrowserSettings = () => {
        // Abrir configuración del navegador
        if (typeof window !== 'undefined') {
            if (window.chrome) {
                window.open('chrome://settings/content/notifications');
            } else if (window.safari) {
                window.open('x-apple.systempreferences:com.apple.preference.notifications');
            } else {
                alert('Abre la configuración de notificaciones de tu navegador');
            }
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                Cargando configuración...
            </div>
        );
    }

    return (
        <div className="glass" style={{ padding: '30px' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '25px'
            }}>
                <FontAwesomeIcon
                    icon={permission === 'granted' ? faBell : faBellSlash}
                    style={{
                        fontSize: '28px',
                        color: permission === 'granted' ? 'var(--accent-color)' : '#ff6b6b'
                    }}
                />
                <div>
                    <h2 style={{ fontSize: '20px', color: 'var(--text-primary)', marginBottom: '5px' }}>
                        Configuración de Notificaciones
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Configura cómo y cuándo recibir notificaciones sobre pensiones
                    </p>
                </div>
            </div>

            {/* Estado del permiso */}
            <div style={{
                padding: '20px',
                background: permission === 'granted'
                    ? 'rgba(0, 255, 157, 0.05)'
                    : 'rgba(255, 107, 107, 0.05)',
                border: `1px solid ${permission === 'granted'
                    ? 'rgba(0, 255, 157, 0.2)'
                    : 'rgba(255, 107, 107, 0.2)'}`,
                borderRadius: '12px',
                marginBottom: '25px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <div style={{
                            fontSize: '16px',
                            color: permission === 'granted' ? 'var(--accent-color)' : '#ff6b6b',
                            marginBottom: '5px'
                        }}>
                            {permission === 'granted' ? '✅ Notificaciones activadas' : '🔕 Notificaciones desactivadas'}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            {permission === 'granted'
                                ? 'Recibirás notificaciones en tu dispositivo'
                                : 'Activa las notificaciones para recibir alertas importantes'}
                        </div>
                    </div>

                    {permission !== 'granted' ? (
                        <button
                            onClick={handleEnableNotifications}
                            className="btn-primary"
                            style={{ minWidth: '140px' }}
                        >
                            Activar Notificaciones
                        </button>
                    ) : (
                        <button
                            onClick={handleOpenBrowserSettings}
                            className="btn-secondary"
                            style={{ minWidth: '140px' }}
                        >
                            Gestionar en Navegador
                        </button>
                    )}
                </div>
            </div>

            {/* Configuración de notificaciones */}
            <div style={{ display: 'grid', gap: '25px' }}>
                {/* Días antes de vencer */}
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '15px'
                    }}>
                        <FontAwesomeIcon icon={faCalendarDay} style={{ color: 'var(--text-secondary)' }} />
                        <label style={{
                            fontSize: '16px',
                            color: 'var(--text-primary)',
                            fontWeight: '500'
                        }}>
                            Notificar días antes del vencimiento
                        </label>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '10px'
                    }}>
                        {[1, 2, 3, 5, 7].map((days) => (
                            <button
                                key={days}
                                type="button"
                                onClick={() => setSettings(prev => ({ ...prev, daysBefore: days }))}
                                style={{
                                    padding: '12px',
                                    background: settings.daysBefore === days
                                        ? 'var(--accent-color)'
                                        : 'var(--glass-bg)',
                                    color: settings.daysBefore === days
                                        ? 'var(--primary-color)'
                                        : 'var(--text-primary)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    fontWeight: settings.daysBefore === days ? '600' : 'normal'
                                }}
                            >
                                {days} día{days !== 1 ? 's' : ''}
                            </button>
                        ))}
                    </div>

                    <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        marginTop: '10px'
                    }}>
                        Recibirás una notificación {settings.daysBefore} día{settings.daysBefore !== 1 ? 's' : ''} antes del vencimiento
                    </div>
                </div>

                {/* Hora de envío */}
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '15px'
                    }}>
                        <FontAwesomeIcon icon={faClock} style={{ color: 'var(--text-secondary)' }} />
                        <label style={{
                            fontSize: '16px',
                            color: 'var(--text-primary)',
                            fontWeight: '500'
                        }}>
                            Hora preferida para notificaciones
                        </label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <input
                            type="time"
                            name="sendTime"
                            value={settings.sendTime}
                            onChange={handleChange}
                            className="input-field"
                            style={{ maxWidth: '150px' }}
                        />

                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            Zona horaria: {settings.timezone}
                        </div>
                    </div>
                </div>

                {/* Horario activo */}
                <div>
                    <label style={{
                        display: 'block',
                        marginBottom: '15px',
                        fontSize: '16px',
                        color: 'var(--text-primary)',
                        fontWeight: '500'
                    }}>
                        Horario activo para notificaciones
                    </label>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '15px'
                    }}>
                        <div>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                Hora de inicio
                            </div>
                            <input
                                type="time"
                                name="activeHours.start"
                                value={settings.activeHours.start}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                Hora de fin
                            </div>
                            <input
                                type="time"
                                name="activeHours.end"
                                value={settings.activeHours.end}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        marginTop: '10px'
                    }}>
                        Solo recibirás notificaciones entre {settings.activeHours.start} y {settings.activeHours.end}
                    </div>
                </div>

                {/* Fines de semana */}
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '10px'
                    }}>
                        <input
                            type="checkbox"
                            id="allowWeekends"
                            name="allowWeekends"
                            checked={settings.allowWeekends}
                            onChange={handleChange}
                            style={{
                                width: '18px',
                                height: '18px',
                                cursor: 'pointer'
                            }}
                        />
                        <label
                            htmlFor="allowWeekends"
                            style={{
                                fontSize: '16px',
                                color: 'var(--text-primary)',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            Recibir notificaciones en fines de semana
                        </label>
                    </div>

                    <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        marginLeft: '28px'
                    }}>
                        {settings.allowWeekends
                            ? 'Recibirás notificaciones los sábados y domingos'
                            : 'No recibirás notificaciones los fines de semana'}
                    </div>
                </div>

                {/* Información importante */}
                <div style={{
                    padding: '20px',
                    background: 'rgba(77, 171, 247, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(77, 171, 247, 0.2)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        marginBottom: '10px'
                    }}>
                        <FontAwesomeIcon icon={faMobileAlt} style={{ color: '#4dabf7', marginTop: '2px' }} />
                        <div>
                            <div style={{
                                fontSize: '14px',
                                color: 'var(--text-primary)',
                                fontWeight: '500',
                                marginBottom: '5px'
                            }}>
                                Notificaciones Push
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                Las notificaciones funcionarán incluso cuando la aplicación esté cerrada,
                                siempre que hayas dado permiso y hayas usado la aplicación en las últimas 48 horas.
                                Las notificaciones llegarán a tu dispositivo móvil o de escritorio.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botón de guardar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button
                        onClick={handleSave}
                        className="btn-primary"
                        disabled={saving || permission !== 'granted'}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            minWidth: '140px'
                        }}
                    >
                        <FontAwesomeIcon icon={faSave} />
                        {saving ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;