import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../App'; // Importar toast
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
    const { currentUser, createNewUser } = useAuth();
    const [loading, setLoading] = useState(false);
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
        toast.error('Solo los superusuarios pueden crear nuevos usuarios');
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

        toast.info('Contraseña generada automáticamente');
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

        const validationError = validateForm();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setLoading(true);

        try {
            // Usar la función del contexto que NO cambia la sesión
            const result = await createNewUser(
                formData.email,
                formData.password,
                formData.isSuperUser,
                formData.nickname
            );

            // Mostrar notificación de éxito
            toast.success(
                <div>
                    <strong>Usuario creado exitosamente</strong>
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>
                        {formData.email} - {formData.isSuperUser ? 'Super Usuario' : 'Usuario Normal'}
                    </div>
                </div>,
                { autoClose: 5000 }
            );

            // Resetear formulario
            setFormData({
                email: '',
                password: '',
                confirmPassword: '',
                isSuperUser: false,
                nickname: ''
            });

            // Opcional: redirigir después de 2 segundos
            setTimeout(() => {
                navigate('/config');
            }, 2000);

        } catch (err) {
            console.error('Error creando usuario:', err);

            // Manejar errores específicos de Firebase
            let errorMessage = 'Error al crear el usuario';

            switch (err.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'El correo electrónico ya está registrado';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'El correo electrónico no es válido';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'La creación de usuarios está deshabilitada';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'La contraseña es demasiado débil';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Error de red. Verifica tu conexión';
                    break;
                default:
                    errorMessage = err.message || 'Error al crear el usuario';
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success('Contraseña copiada al portapapeles', { autoClose: 2000 });
        }).catch(err => {
            console.error('Error al copiar:', err);
            toast.error('No se pudo copiar la contraseña');
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
                                Los superusuarios tienen acceso completo al sistema.
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