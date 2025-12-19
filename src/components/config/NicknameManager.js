import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserEdit,
    faSave,
    faTimes,
    faSearch,
    faUserTag
} from '@fortawesome/free-solid-svg-icons';

const NicknameManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [newNickname, setNewNickname] = useState('');
    const { currentUser, updateUserNickname } = useAuth();

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

            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditNickname = (user) => {
        setEditingUser(user.id);
        setNewNickname(user.nickname || '');
    };

    const handleSaveNickname = async (userId) => {
        if (!newNickname.trim()) {
            alert('El nickname no puede estar vacío');
            return;
        }

        try {
            await updateUserNickname(userId, newNickname.trim());
            setEditingUser(null);
            fetchUsers(); // Recargar lista
        } catch (error) {
            alert(error.message);
        }
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        setNewNickname('');
    };

    const filteredUsers = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
            user.email?.toLowerCase().includes(searchLower) ||
            user.nickname?.toLowerCase().includes(searchLower) ||
            user.id.toLowerCase().includes(searchLower)
        );
    });

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                Cargando usuarios...
            </div>
        );
    }

    return (
        <div className="glass" style={{ padding: '30px', marginTop: '20px' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px'
            }}>
                <FontAwesomeIcon icon={faUserTag} style={{ color: 'var(--accent-color)', fontSize: '20px' }} />
                <h2 style={{
                    fontSize: '20px',
                    color: 'var(--text-primary)'
                }}>
                    Gestión de Nicknames
                </h2>
            </div>

            <p style={{
                color: 'var(--text-secondary)',
                marginBottom: '25px',
                fontSize: '14px'
            }}>
                Configura los nicknames que se mostrarán en el sidebar. Solo visible para superusuarios.
            </p>

            {/* Barra de búsqueda */}
            <div style={{ marginBottom: '25px' }}>
                <div style={{ position: 'relative' }}>
                    <FontAwesomeIcon
                        icon={faSearch}
                        style={{
                            position: 'absolute',
                            left: '15px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-secondary)'
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Buscar usuarios por email o nickname..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field"
                        style={{ paddingLeft: '45px' }}
                    />
                </div>
            </div>

            {/* Lista de usuarios */}
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                {filteredUsers.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: 'var(--text-secondary)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '10px'
                    }}>
                        No se encontraron usuarios
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                style={{
                                    padding: '18px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                    e.currentTarget.style.transform = 'translateX(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        {/* Email */}
                                        <div style={{
                                            fontSize: '14px',
                                            color: 'var(--text-primary)',
                                            marginBottom: '5px',
                                            fontWeight: '500'
                                        }}>
                                            {user.email}
                                        </div>

                                        {/* Nickname actual o campo de edición */}
                                        {editingUser === user.id ? (
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <input
                                                    type="text"
                                                    value={newNickname}
                                                    onChange={(e) => setNewNickname(e.target.value)}
                                                    className="input-field"
                                                    style={{
                                                        flex: 1,
                                                        padding: '8px 12px',
                                                        fontSize: '13px'
                                                    }}
                                                    placeholder="Nuevo nickname"
                                                    autoFocus
                                                />
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <button
                                                        onClick={() => handleSaveNickname(user.id)}
                                                        className="btn-primary"
                                                        style={{
                                                            padding: '8px 12px',
                                                            fontSize: '12px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '5px'
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faSave} />
                                                        Guardar
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="btn-secondary"
                                                        style={{
                                                            padding: '8px 12px',
                                                            fontSize: '12px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '5px'
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} />
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{
                                                fontSize: '16px',
                                                color: 'var(--accent-color)',
                                                fontWeight: 'bold',
                                                marginBottom: '8px'
                                            }}>
                                                {user.nickname || 'Sin nickname'}
                                            </div>
                                        )}

                                        {/* Información adicional */}
                                        <div style={{
                                            display: 'flex',
                                            gap: '15px',
                                            fontSize: '11px',
                                            color: 'var(--text-secondary)',
                                            marginTop: '8px'
                                        }}>
                                            <span>
                                                ID: {user.id.substring(0, 8)}...
                                            </span>
                                            <span>
                                                Super: {user.isSuperUser ? '✅' : '❌'}
                                            </span>
                                            <span>
                                                Creado: {user.createdAt?.toDate().toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Botón de editar (si no está editando) */}
                                    {editingUser !== user.id && (
                                        <button
                                            onClick={() => handleEditNickname(user)}
                                            className="btn-secondary"
                                            style={{
                                                padding: '8px 12px',
                                                fontSize: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                minWidth: '80px'
                                            }}
                                            disabled={user.id === currentUser.uid && !currentUser.isSuperUser}
                                        >
                                            <FontAwesomeIcon icon={faUserEdit} />
                                            Editar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Información importante */}
            <div style={{
                marginTop: '25px',
                padding: '15px',
                background: 'rgba(0, 255, 157, 0.05)',
                borderRadius: '10px',
                border: '1px solid rgba(0, 255, 157, 0.1)'
            }}>
                <div style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5'
                }}>
                    <strong>Nota:</strong> Los nicknames se muestran en el sidebar principal.
                    Puedes usar nombres como "Administrador Principal", "Gerente STW", "Supervisor Nvbola", etc.
                    Solo los superusuarios pueden modificar los nicknames.
                </div>
            </div>
        </div>
    );
};

export default NicknameManager;