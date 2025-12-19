import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserPlus,
    faEnvelope,
    faLock,
    faShieldAlt,
    faUserTag,
    faSave,
    faArrowLeft,
    faEye,
    faEyeSlash,
    faKey
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/global.css';

const CreateUser = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        isSuperUser: false,
        nickname: ''
    });

    // Solo superusuarios pueden crear usuarios
    if (!currentUser?.isSuperUser) {
        return (
            <div className="container">
                <div className="glass" style={{ padding: '40px', textAlign: 'center' }}>
                    <FontAwesomeIcon
                        icon={faShieldAlt}
                        style={{
                            fontSize: '50px',
                            color: '#ff6b6b',
                            marginBottom: '20px'
                        }}
                    />
                    <h2 style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '15px' }}>
                        Acceso Restringido
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '25px' }}>
                        Solo los superusuarios pueden crear nuevos usuarios.
                    </p>
                    <button
                        onClick={() => navigate('/config')}
                        className="btn-primary"
                    >
                        Volver a Configuración
                    </button>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const generateRandomPassword = () => {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";

        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        setFormData(prev => ({
            ...prev,
            password: password,
            confirmPassword: password
        }));
    };

    const validateForm = () => {
        if (!formData.email) {
            return 'El correo electrónico es obligatorio';
        }

        if (!formData.email.includes('@')) {
            return 'El correo electrónico no es válido';
        }

        if (!formData.password) {
            return 'La contraseña es obligatoria';
        }

        if (formData.password.length < 6) {
            return 'La contraseña debe tener al menos 6 caracteres';
        }

        if (formData.password !== formData.confirmPassword) {
            return 'Las contraseñas no coinciden';
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        try {
            // 1. Crear usuario en Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            const userId = userCredential.user.uid;

            // 2. Crear documento en Firestore
            await setDoc(doc(db, 'users', userId), {
                email: formData.email,
                nickname: formData.nickname || formData.email.split('@')[0],
                isSuperUser: formData.isSuperUser,
                createdBy: currentUser.uid,
                createdByEmail: currentUser.email,
                createdAt: new Date(),
                status: 'active'
            });

            // 3. Cerrar sesión del nuevo usuario (para que inicie sesión con su contraseña)
            await auth.signOut();

            // 4. Volver a iniciar sesión con el usuario original
            await auth.signInWithEmailAndPassword(currentUser.email, currentUser.password || '');

            setSuccess('Usuario creado exitosamente');

            // Resetear formulario
            setFormData({
                email: '',
                password: '',
                confirmPassword: '',
                isSuperUser: false,
                nickname: ''
            });

            // Auto-redirigir después de 2 segundos
            setTimeout(() => {
                navigate('/config');
            }, 2000);

        } catch (err) {
            console.error('Error creando usuario:', err);

            // Manejar errores específicos de Firebase
            switch (err.code) {
                case 'auth/email-already-in-use':
                    setError('El correo electrónico ya está registrado');
                    break;
                case 'auth/invalid-email':
                    setError('El correo electrónico no es válido');
                    break;
                case 'auth/operation-not-allowed':
                    setError('La creación de usuarios está deshabilitada');
                    break;
                case 'auth/weak-password':
                    setError('La contraseña es demasiado débil');
                    break;
                default:
                    setError('Error al crear el usuario: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Contraseña copiada al portapapeles');
        }).catch(err => {
            console.error('Error al copiar:', err);
        });
    };

    return (
        <div className="container">
            <div style={{ marginBottom: '30px' }}>
                <button
                    onClick={() => navigate('/config')}
                    className="btn-secondary"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '20px'
                    }}
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Volver a Configuración
                </button>

                <h1 style={{
                    fontSize: '24px',
                    color: 'var(--text-primary)',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <FontAwesomeIcon icon={faUserPlus} />
                    Crear Nuevo Usuario
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Complete el formulario para registrar un nuevo usuario en el sistema
                </p>
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
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>
                        Redirigiendo a configuración...
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="glass" style={{ padding: '30px', marginBottom: '20px' }}>
                    <h2 style={{
                        fontSize: '18px',
                        marginBottom: '20px',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <FontAwesomeIcon icon={faEnvelope} />
                        Información del Usuario
                    </h2>

                    <div style={{ display: 'grid', gap: '20px' }}>
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
                                Correo electrónico *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field"
                                required
                                placeholder="usuario@empresa.com"
                            />
                        </div>

                        {/* Contraseña */}
                        <div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '8px'
                            }}>
                                <label style={{
                                    color: 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <FontAwesomeIcon icon={faLock} />
                                    Contraseña provisional *
                                </label>
                                <button
                                    type="button"
                                    onClick={generateRandomPassword}
                                    className="btn-secondary"
                                    style={{
                                        fontSize: '12px',
                                        padding: '8px 12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}
                                >
                                    <FontAwesomeIcon icon={faKey} />
                                    Generar contraseña
                                </button>
                            </div>

                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                    placeholder="Contraseña provisional"
                                    style={{ paddingRight: '50px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '15px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>

                            {/* Mostrar contraseña generada */}
                            {formData.password && (
                                <div style={{
                                    marginTop: '10px',
                                    padding: '10px',
                                    background: 'rgba(0, 255, 157, 0.05)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(0, 255, 157, 0.1)'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
                                                Contraseña generada:
                                            </div>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                                fontFamily: 'monospace',
                                                letterSpacing: '1px'
                                            }}>
                                                {formData.password}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(formData.password)}
                                            className="btn-secondary"
                                            style={{
                                                fontSize: '12px',
                                                padding: '6px 12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            Copiar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirmar contraseña */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'var(--text-secondary)'
                            }}>
                                Confirmar contraseña *
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="input-field"
                                required
                                placeholder="Confirmar contraseña"
                            />
                        </div>

                        {/* Nickname (opcional) */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <FontAwesomeIcon icon={faUserTag} />
                                Nickname (opcional)
                            </label>
                            <input
                                type="text"
                                name="nickname"
                                value={formData.nickname}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Ej: Gerente STW, Supervisor Nvbola"
                                maxLength="30"
                            />
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '5px' }}>
                                Se mostrará en lugar del email en el sidebar
                            </div>
                        </div>

                        {/* Super usuario */}
                        <div style={{
                            padding: '15px',
                            background: 'rgba(255, 193, 7, 0.05)',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 193, 7, 0.1)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <FontAwesomeIcon icon={faShieldAlt} style={{ color: '#ffc107' }} />
                                <label style={{
                                    color: 'var(--text-primary)',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <input
                                        type="checkbox"
                                        name="isSuperUser"
                                        checked={formData.isSuperUser}
                                        onChange={handleChange}
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            cursor: 'pointer'
                                        }}
                                    />
                                    Super Usuario
                                </label>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '28px' }}>
                                Los superusuarios tienen acceso completo al sistema: pueden editar todas las pensiones,
                                gestionar usuarios y configurar nicknames.
                            </div>
                        </div>

                        {/* Información importante */}
                        <div style={{
                            padding: '15px',
                            background: 'rgba(77, 171, 247, 0.05)',
                            borderRadius: '10px',
                            border: '1px solid rgba(77, 171, 247, 0.1)'
                        }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                <strong>Nota importante:</strong> El nuevo usuario recibirá la contraseña provisional
                                que configures aquí. Deberá cambiarla en su primer inicio de sesión desde la sección
                                "Configuración" → "Perfil".
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => navigate('/config')}
                        style={{ minWidth: '120px' }}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{
                            minWidth: '120px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <FontAwesomeIcon icon={faSave} />
                        {loading ? 'Creando...' : 'Crear Usuario'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateUser;