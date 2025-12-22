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
    faKey,
    faUserSlash,
    faUserCheck,
    faEdit,
    faSave,
    faTimes,
    faSearch,
    faFilter,
    faUserPlus,
    faCog,
    faUserCog,
    faList
} from '@fortawesome/free-solid-svg-icons';
import { toast } from '../../App';
import DeleteUserModal from './DeleteUserModal';
import '../../styles/global.css';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'create', 'nicknames'
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'super', 'normal'
    const [editingNickname, setEditingNickname] = useState(null);
    const [newNickname, setNewNickname] = useState('');
    const { currentUser, deleteUser, updateUserNickname } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterAndSearchUsers();
    }, [users, searchTerm, filterType]);

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
            setFilteredUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Error al cargar la lista de usuarios');
        } finally {
            setLoading(false);
        }
    };

    const filterAndSearchUsers = () => {
        let filtered = [...users];

        // Filtro por tipo
        if (filterType !== 'all') {
            filtered = filtered.filter(user =>
                filterType === 'super' ? user.isSuperUser : !user.isSuperUser
            );
        }

        // Filtro por búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(user =>
                user.email?.toLowerCase().includes(term) ||
                user.nickname?.toLowerCase().includes(term) ||
                user.id.toLowerCase().includes(term)
            );
        }

        setFilteredUsers(filtered);
    };

    const handleDeleteUser = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        setDeleteLoading(true);

        try {
            await deleteUser(userToDelete.id, userToDelete.email);

            toast.success(
                <div>
                    <strong>Usuario eliminado</strong>
                    <div style={{ fontSize: '12px', marginTop: '5px' }}>
                        {userToDelete.email} ha sido eliminado del sistema
                    </div>
                </div>,
                { autoClose: 5000 }
            );

            // Recargar lista
            await fetchUsers();
            setShowDeleteModal(false);
            setUserToDelete(null);

        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.message || 'Error al eliminar el usuario');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleResetPassword = async (userId) => {
        if (!currentUser?.isSuperUser) return;

        if (window.confirm('¿Estás seguro de que quieres resetear la contraseña de este usuario? Se le enviará un correo para restablecerla.')) {
            toast.info('Función de reset de contraseña requiere configuración en Firebase Console');
        }
    };

    const handleToggleSuperUser = async (userId, currentStatus) => {
        if (!currentUser?.isSuperUser) return;

        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                isSuperUser: !currentStatus,
                updatedAt: new Date()
            });

            toast.success(
                !currentStatus ? 'Usuario convertido a Super Usuario' : 'Usuario convertido a Usuario Normal'
            );

            fetchUsers();
        } catch (error) {
            console.error('Error updating user role:', error);
            toast.error('Error al cambiar rol del usuario');
        }
    };

    const handleEditNickname = (user) => {
        setEditingNickname(user.id);
        setNewNickname(user.nickname || '');
    };

    const handleSaveNickname = async (userId) => {
        if (!newNickname.trim()) {
            toast.error('El nickname no puede estar vacío');
            return;
        }

        try {
            await updateUserNickname(userId, newNickname.trim());
            setEditingNickname(null);
            fetchUsers();
            toast.success('Nickname actualizado correctamente');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleCancelEdit = () => {
        setEditingNickname(null);
        setNewNickname('');
    };

    const handleCreateUserClick = () => {
        // Redirigir a la página de creación de usuarios
        window.location.href = '/create-user';
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                Cargando usuarios...
            </div>
        );
    }

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
                    <FontAwesomeIcon icon={faUsers} />
                    Gestión de Usuarios
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Administra todos los usuarios del sistema desde un solo lugar
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
                    onClick={() => setActiveTab('list')}
                    style={{
                        padding: '12px 24px',
                        background: activeTab === 'list' ? 'var(--accent-color)' : 'var(--glass-bg)',
                        color: activeTab === 'list' ? 'var(--primary-color)' : 'var(--text-primary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <FontAwesomeIcon icon={faList} />
                    Lista de Usuarios
                </button>

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
                    Gestionar Nicknames
                </button>

                <button
                    onClick={handleCreateUserClick}
                    style={{
                        padding: '12px 24px',
                        background: 'var(--glass-bg)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginLeft: 'auto'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--accent-color)';
                        e.currentTarget.style.color = 'var(--primary-color)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--glass-bg)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                >
                    <FontAwesomeIcon icon={faUserPlus} />
                    Nuevo Usuario
                </button>
            </div>

            {/* Contenido de Lista de Usuarios */}
            {activeTab === 'list' && (
                <div className="glass" style={{ padding: '30px' }}>
                    {/* Filtros y búsqueda */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '20px',
                        marginBottom: '30px'
                    }}>
                        <div>
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

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '15px'
                        }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: 'var(--text-secondary)',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <FontAwesomeIcon icon={faFilter} />
                                    Filtrar por tipo
                                </label>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="input-field"
                                    style={{ fontSize: '14px' }}
                                >
                                    <option value="all">Todos los usuarios</option>
                                    <option value="super">Super Usuarios</option>
                                    <option value="normal">Usuarios Normales</option>
                                </select>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: 'var(--text-secondary)',
                                    fontSize: '14px'
                                }}>
                                    Estadísticas
                                </label>
                                <div style={{
                                    display: 'flex',
                                    gap: '15px',
                                    fontSize: '12px'
                                }}>
                                    <div style={{
                                        padding: '8px 12px',
                                        background: 'rgba(0, 255, 157, 0.1)',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(0, 255, 157, 0.2)'
                                    }}>
                                        <div style={{ color: 'var(--text-secondary)' }}>Total</div>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#00ff9d' }}>
                                            {users.length}
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '8px 12px',
                                        background: 'rgba(77, 171, 247, 0.1)',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(77, 171, 247, 0.2)'
                                    }}>
                                        <div style={{ color: 'var(--text-secondary)' }}>Super</div>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4dabf7' }}>
                                            {users.filter(u => u.isSuperUser).length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lista de usuarios */}
                    <div style={{ display: 'grid', gap: '15px', maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
                        {filteredUsers.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px',
                                color: 'var(--text-secondary)',
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: '12px'
                            }}>
                                {searchTerm || filterType !== 'all'
                                    ? 'No se encontraron usuarios con los filtros aplicados'
                                    : 'No hay usuarios registrados'}
                            </div>
                        ) : (
                            filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    style={{
                                        padding: '20px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--glass-border)',
                                        borderLeft: user.id === currentUser?.uid
                                            ? '4px solid #ffc107'
                                            : user.isSuperUser
                                                ? '4px solid var(--accent-color)'
                                                : '4px solid #4dabf7',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
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
                                                            background: '#ffc107',
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
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
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
                                                        <FontAwesomeIcon icon={user.status === 'active' ? faUserCheck : faUserSlash} size="xs" />
                                                        {user.status === 'active' ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px',
                                            minWidth: '140px'
                                        }}>
                                            {/* Toggle Super Usuario */}
                                            {currentUser?.isSuperUser && user.id !== currentUser.uid && (
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
                                                    {user.isSuperUser ? 'Super' : 'Hacer Super'}
                                                </button>
                                            )}

                                            {/* Botón Eliminar */}
                                            {currentUser?.isSuperUser && (
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="btn-secondary"
                                                    style={{
                                                        padding: '8px 12px',
                                                        fontSize: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        background: 'rgba(255, 107, 107, 0.1)',
                                                        color: '#ff6b6b',
                                                        borderColor: 'rgba(255, 107, 107, 0.3)',
                                                        opacity: user.id === currentUser.uid ? 0.5 : 1,
                                                        cursor: user.id === currentUser.uid ? 'not-allowed' : 'pointer'
                                                    }}
                                                    disabled={user.id === currentUser.uid}
                                                    title={user.id === currentUser.uid ? 'No puedes eliminarte a ti mismo' : 'Eliminar usuario'}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                    Eliminar
                                                </button>
                                            )}

                                            {/* Botón Reset Password */}
                                            {currentUser?.isSuperUser && user.id !== currentUser.uid && (
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
                                            )}

                                            {/* Botón Editar Nickname */}
                                            {currentUser?.isSuperUser && (
                                                <button
                                                    onClick={() => handleEditNickname(user)}
                                                    className="btn-secondary"
                                                    style={{
                                                        padding: '8px 12px',
                                                        fontSize: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                    Editar Nickname
                                                </button>
                                            )}
                                        </div>

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
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Contenido de Gestionar Nicknames */}
            {activeTab === 'nicknames' && (
                <div className="glass" style={{ padding: '30px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '20px'
                    }}>
                        <FontAwesomeIcon icon={faUserTag} style={{ color: 'var(--accent-color)', fontSize: '20px' }} />
                        <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>
                            Gestión de Nicknames
                        </h3>
                    </div>

                    <p style={{
                        color: 'var(--text-secondary)',
                        marginBottom: '25px',
                        fontSize: '14px'
                    }}>
                        Configura los nicknames que se mostrarán en el sidebar para cada usuario.
                    </p>

                    <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
                        {users.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px',
                                color: 'var(--text-secondary)',
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: '12px'
                            }}>
                                No hay usuarios registrados
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {users.map((user) => (
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

                                                {/* Nickname actual o campo de edición */}
                                                {editingNickname === user.id ? (
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
                                                        Super: {user.isSuperUser ? '✅' : '❌'}
                                                    </span>
                                                    <span>
                                                        Creado: {user.createdAt?.toDate().toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Botón de editar (si no está editando) */}
                                            {editingNickname !== user.id && (
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
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
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
            )}

            {/* Modal de confirmación para eliminar */}
            {showDeleteModal && userToDelete && (
                <DeleteUserModal
                    user={userToDelete}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setUserToDelete(null);
                    }}
                    onConfirm={confirmDeleteUser}
                    loading={deleteLoading}
                />
            )}
        </div>
    );
};

export default UserList;