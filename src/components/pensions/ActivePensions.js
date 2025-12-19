import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faFilter,
    faSync,
    faEdit,
    faToggleOn,
    faToggleOff,
    faCalendarPlus,
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import PensionList from './PensionList';
import RenewModal from './RenewModal';
import EditModal from './EditModal';
import '../../styles/global.css';

const ActivePensions = () => {
    const [pensions, setPensions] = useState([]);
    const [filteredPensions, setFilteredPensions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        zone: 'all',
        status: 'all',
        showExpired: false
    });
    const [selectedPension, setSelectedPension] = useState(null);
    const [showRenewModal, setShowRenewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const { currentUser } = useAuth();

    useEffect(() => {
        fetchPensions();
    }, []);

    useEffect(() => {
        filterPensions();
    }, [pensions, filters, searchTerm]);

    const fetchPensions = async () => {
        try {
            const pensionsRef = collection(db, 'pensions');
            const q = query(pensionsRef);
            const querySnapshot = await getDocs(q);

            const pensionsData = [];
            querySnapshot.forEach((doc) => {
                pensionsData.push({ id: doc.id, ...doc.data() });
            });

            setPensions(pensionsData);
        } catch (error) {
            console.error('Error fetching pensions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterPensions = () => {
        let filtered = [...pensions];

        // Filtro por zona
        if (filters.zone !== 'all') {
            filtered = filtered.filter(p =>
                p.lugar?.toLowerCase() === filters.zone.toLowerCase()
            );
        }

        // Filtro por estado
        if (filters.status !== 'all') {
            filtered = filtered.filter(p => p.status === filters.status);
        }

        // Filtro por búsqueda
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.personName?.toLowerCase().includes(term) ||
                p.companyName?.toLowerCase().includes(term)
            );
        }

        // Filtro por vencimiento
        if (filters.showExpired) {
            const today = new Date();
            filtered = filtered.filter(p => {
                const expDate = new Date(p.expirationDate);
                return expDate < today;
            });
        }

        setFilteredPensions(filtered);
    };

    const handleRenewPension = (pension) => {
        setSelectedPension(pension);
        setShowRenewModal(true);
    };

    const handleEditPension = (pension) => {
        if (currentUser?.isSuperUser) {
            setSelectedPension(pension);
            setShowEditModal(true);
        }
    };

    const handleToggleStatus = async (pension) => {
        try {
            const pensionRef = doc(db, 'pensions', pension.id);
            const newStatus = pension.status === 'active' ? 'inactive' : 'active';

            await updateDoc(pensionRef, {
                status: newStatus,
                updatedAt: new Date()
            });

            fetchPensions(); // Recargar la lista
        } catch (error) {
            console.error('Error updating pension status:', error);
        }
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    if (loading) {
        return (
            <div className="container">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '200px'
                }}>
                    <div className="glass" style={{ padding: '30px' }}>
                        Cargando pensiones...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{
                    fontSize: '24px',
                    color: 'var(--text-primary)',
                    marginBottom: '10px'
                }}>
                    Pensiones Activas
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Total: {filteredPensions.length} pensiones encontradas
                </p>
            </div>

            {/* Filtros y búsqueda */}
            <div className="glass" style={{ padding: '20px', marginBottom: '20px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '15px',
                    '@media (min-width: 768px)': {
                        gridTemplateColumns: 'repeat(3, 1fr)'
                    }
                }}>
                    {/* Barra de búsqueda */}
                    <div style={{ gridColumn: '1 / -1' }}>
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
                                placeholder="Buscar por nombre o empresa..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input-field"
                                style={{ paddingLeft: '45px' }}
                            />
                        </div>
                    </div>

                    {/* Filtro por zona */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: 'var(--text-secondary)',
                            fontSize: '14px'
                        }}>
                            <FontAwesomeIcon icon={faFilter} style={{ marginRight: '8px' }} />
                            Zona
                        </label>
                        <select
                            value={filters.zone}
                            onChange={(e) => handleFilterChange('zone', e.target.value)}
                            className="input-field"
                            style={{ fontSize: '14px' }}
                        >
                            <option value="all">Todas las zonas</option>
                            <option value="stw">STW</option>
                            <option value="nvbola">Nvbola</option>
                        </select>
                    </div>

                    {/* Filtro por estado */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: 'var(--text-secondary)',
                            fontSize: '14px'
                        }}>
                            Estado
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="input-field"
                            style={{ fontSize: '14px' }}
                        >
                            <option value="all">Todos los estados</option>
                            <option value="active">Activas</option>
                            <option value="inactive">Inactivas</option>
                        </select>
                    </div>

                    {/* Filtro de vencimiento */}
                    <div>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: 'var(--text-secondary)',
                            fontSize: '14px'
                        }}>
                            <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '8px' }} />
                            Mostrar vencidas
                        </label>
                        <button
                            onClick={() => handleFilterChange('showExpired', !filters.showExpired)}
                            className="btn-secondary"
                            style={{
                                width: '100%',
                                background: filters.showExpired ? 'var(--accent-color)' : 'var(--glass-bg)',
                                color: filters.showExpired ? 'var(--primary-color)' : 'var(--text-primary)'
                            }}
                        >
                            {filters.showExpired ? 'Mostrando vencidas' : 'Ocultar vencidas'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Botón de recargar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button
                    onClick={fetchPensions}
                    className="btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <FontAwesomeIcon icon={faSync} />
                    Actualizar lista
                </button>
            </div>

            {/* Lista de pensiones */}
            <PensionList
                pensions={filteredPensions}
                onRenew={handleRenewPension}
                onEdit={handleEditPension}
                onToggleStatus={handleToggleStatus}
                currentUser={currentUser}
            />

            {/* Modales */}
            {showRenewModal && selectedPension && (
                <RenewModal
                    pension={selectedPension}
                    onClose={() => {
                        setShowRenewModal(false);
                        setSelectedPension(null);
                    }}
                    onSuccess={() => {
                        setShowRenewModal(false);
                        setSelectedPension(null);
                        fetchPensions();
                    }}
                />
            )}

            {showEditModal && selectedPension && (
                <EditModal
                    pension={selectedPension}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedPension(null);
                    }}
                    onSuccess={() => {
                        setShowEditModal(false);
                        setSelectedPension(null);
                        fetchPensions();
                    }}
                />
            )}
        </div>
    );
};

export default ActivePensions;