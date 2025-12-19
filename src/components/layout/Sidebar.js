import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome,
    faPlusCircle,
    faList,
    faCog,
    faSignOutAlt,
    faBars,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/global.css';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const menuItems = [
        { path: '/dashboard', icon: faHome, label: 'Dashboard' },
        { path: '/create-pension', icon: faPlusCircle, label: 'Crear Pensión' },
        { path: '/active-pensions', icon: faList, label: 'Ver Pensiones' },
        ...(currentUser?.isSuperUser
            ? [{ path: '/config', icon: faCog, label: 'Configuración' }]
            : []
        ),
    ];

    const NavItem = ({ item }) => (
        <NavLink
            to={item.path}
            className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
            }
            onClick={() => setIsOpen(false)}
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '15px 20px',
                textDecoration: 'none',
                color: 'var(--text-secondary)',
                transition: 'all 0.3s ease',
                borderRadius: '12px',
                marginBottom: '8px'
            }}
            activeStyle={{
                background: 'var(--glass-bg)',
                color: 'var(--accent-color)',
                borderLeft: `4px solid var(--accent-color)`
            }}
        >
            <FontAwesomeIcon icon={item.icon} style={{ marginRight: '12px', width: '20px' }} />
            <span>{item.label}</span>
        </NavLink>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 1001,
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '10px',
                    padding: '10px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'block'
                }}
                className="glass"
            >
                <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
            </button>

            {/* Sidebar */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                width: isOpen ? '250px' : '0',
                background: 'var(--secondary-color)',
                backdropFilter: 'blur(10px)',
                borderRight: '1px solid var(--glass-border)',
                transition: 'width 0.3s ease',
                overflow: 'hidden',
                zIndex: 1000
            }}>
                <div style={{ padding: '20px' }}>
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '30px',
                        marginTop: '60px'
                    }}>
                        <h2 style={{
                            fontSize: '18px',
                            color: 'var(--accent-color)'
                        }}>
                            Control Pensiones
                        </h2>
                        <p style={{
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                            marginTop: '5px'
                        }}>
                            {currentUser?.email}
                        </p>
                        {currentUser?.isSuperUser && (
                            <span style={{
                                fontSize: '10px',
                                background: 'var(--accent-color)',
                                color: 'var(--primary-color)',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                display: 'inline-block',
                                marginTop: '5px'
                            }}>
                                Super Usuario
                            </span>
                        )}
                    </div>

                    <nav>
                        {menuItems.map((item) => (
                            <NavItem key={item.path} item={item} />
                        ))}
                    </nav>

                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '15px 20px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            width: '100%',
                            cursor: 'pointer',
                            borderRadius: '12px',
                            transition: 'all 0.3s ease',
                            marginTop: '20px'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'var(--glass-bg)';
                            e.target.style.color = '#ff6b6b';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.color = 'var(--text-secondary)';
                        }}
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: '12px', width: '20px' }} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 999,
                        display: 'block'
                    }}
                />
            )}
        </>
    );
};

export default Sidebar;