import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrash,
    faTimes,
    faExclamationTriangle,
    faUserSlash,
    faShieldAlt
} from '@fortawesome/free-solid-svg-icons';

const DeleteUserModal = ({ user, onClose, onConfirm, loading }) => {
    const [confirmationText, setConfirmationText] = useState('');

    const isConfirmed = confirmationText.toLowerCase() === 'eliminar';

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
        }}>
            <div
                className="glass"
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    padding: '30px',
                    position: 'relative',
                    animation: 'slideIn 0.3s ease'
                }}
            >
                {/* Botón de cerrar */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '20px',
                        padding: '5px'
                    }}
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>

                {/* Icono de advertencia */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'rgba(255, 107, 107, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        border: '2px solid rgba(255, 107, 107, 0.3)'
                    }}>
                        <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            style={{ fontSize: '36px', color: '#ff6b6b' }}
                        />
                    </div>
                </div>

                <h2 style={{
                    fontSize: '24px',
                    marginBottom: '10px',
                    color: 'var(--text-primary)',
                    textAlign: 'center'
                }}>
                    Eliminar Usuario
                </h2>

                {/* Información del usuario */}
                <div className="glass" style={{
                    padding: '20px',
                    marginBottom: '25px',
                    background: 'rgba(255, 107, 107, 0.05)',
                    border: '1px solid rgba(255, 107, 107, 0.1)'
                }}>
                    <div style={{ marginBottom: '15px' }}>
                        <div style={{
                            fontSize: '14px',
                            color: 'var(--text-secondary)',
                            marginBottom: '5px'
                        }}>
                            Usuario a eliminar:
                        </div>
                        <div style={{
                            fontSize: '18px',
                            color: '#ff6b6b',
                            fontWeight: 'bold',
                            marginBottom: '5px'
                        }}>
                            {user.email}
                        </div>
                        {user.nickname && (
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                Nickname: {user.nickname}
                            </div>
                        )}
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '15px',
                        fontSize: '13px'
                    }}>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', marginBottom: '3px' }}>
                                ID:
                            </div>
                            <div style={{
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                wordBreak: 'break-all'
                            }}>
                                {user.id.substring(0, 20)}...
                            </div>
                        </div>

                        <div>
                            <div style={{ color: 'var(--text-secondary)', marginBottom: '3px' }}>
                                Tipo:
                            </div>
                            <div>
                                {user.isSuperUser ? (
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        background: 'rgba(0, 255, 157, 0.1)',
                                        color: '#00ff9d',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        fontSize: '12px'
                                    }}>
                                        <FontAwesomeIcon icon={faShieldAlt} />
                                        Super Usuario
                                    </span>
                                ) : 'Usuario Normal'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advertencia */}
                <div style={{
                    padding: '15px',
                    background: 'rgba(255, 107, 107, 0.1)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 107, 107, 0.3)',
                    marginBottom: '25px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        color: '#ff6b6b'
                    }}>
                        <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginTop: '2px' }} />
                        <div>
                            <strong>Advertencia: Esta acción es irreversible</strong>
                            <ul style={{
                                marginTop: '10px',
                                paddingLeft: '20px',
                                fontSize: '14px',
                                color: 'var(--text-secondary)'
                            }}>
                                <li>El usuario perderá acceso al sistema</li>
                                <li>Todas sus pensiones asignadas permanecerán</li>
                                <li>No podrá recuperar su cuenta</li>
                                <li>El registro será eliminado permanentemente</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Confirmación */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '10px',
                        color: 'var(--text-secondary)'
                    }}>
                        Para confirmar, escribe <strong>"eliminar"</strong>:
                    </label>
                    <input
                        type="text"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        className="input-field"
                        placeholder="Escribe 'eliminar' para confirmar"
                        style={{
                            borderColor: isConfirmed ? '#ff6b6b' : 'var(--glass-border)',
                            background: isConfirmed ? 'rgba(255, 107, 107, 0.05)' : 'var(--glass-bg)'
                        }}
                    />
                </div>

                {/* Botones */}
                <div style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={onClose}
                        style={{ minWidth: '100px' }}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirm(user)}
                        className="btn-primary"
                        disabled={!isConfirmed || loading}
                        style={{
                            minWidth: '140px',
                            background: !isConfirmed || loading
                                ? 'rgba(255, 107, 107, 0.3)'
                                : 'linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                        {loading ? 'Eliminando...' : 'Eliminar Usuario'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteUserModal;