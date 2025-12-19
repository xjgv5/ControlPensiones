import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarPlus,
    faEdit,
    faToggleOn,
    faToggleOff,
    faBuilding,
    faUser,
    faMapMarkerAlt,
    faStore
} from '@fortawesome/free-solid-svg-icons';

const PensionList = ({ pensions, onRenew, onEdit, onToggleStatus, currentUser }) => {
    const getStatusBadge = (status) => {
        const styles = {
            active: {
                background: 'rgba(0, 255, 157, 0.1)',
                color: '#00ff9d',
                border: '1px solid rgba(0, 255, 157, 0.3)'
            },
            inactive: {
                background: 'rgba(255, 107, 107, 0.1)',
                color: '#ff6b6b',
                border: '1px solid rgba(255, 107, 107, 0.3)'
            }
        };

        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                ...styles[status]
            }}>
                {status === 'active' ? 'Activa' : 'Inactiva'}
            </span>
        );
    };

    const getZoneBadge = (zone) => {
        const isSTW = zone?.toLowerCase() === 'stw';
        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                background: isSTW ? 'rgba(77, 171, 247, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                color: isSTW ? '#4dabf7' : '#ffc107',
                border: isSTW ? '1px solid rgba(77, 171, 247, 0.3)' : '1px solid rgba(255, 193, 7, 0.3)'
            }}>
                {zone?.toUpperCase()}
            </span>
        );
    };

    const isExpired = (expirationDate) => {
        if (!expirationDate) return false;
        const today = new Date();
        const expDate = new Date(expirationDate);
        return expDate < today;
    };

    if (pensions.length === 0) {
        return (
            <div className="glass" style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text-secondary)'
            }}>
                <p>No se encontraron pensiones con los filtros aplicados</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gap: '15px' }}>
            {pensions.map((pension) => {
                const expired = isExpired(pension.expirationDate);

                return (
                    <div
                        key={pension.id}
                        className="glass"
                        style={{
                            padding: '20px',
                            borderLeft: expired ? '4px solid #ff6b6b' : '4px solid transparent',
                            transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: '15px',
                            '@media (min-width: 768px)': {
                                gridTemplateColumns: '2fr 1fr'
                            }
                        }}>
                            {/* Información de la pensión */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                    <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>
                                        {pension.personName}
                                    </h3>
                                    {getStatusBadge(pension.status)}
                                    {getZoneBadge(pension.lugar)}
                                    {expired && pension.status === 'active' && (
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            background: 'rgba(255, 107, 107, 0.1)',
                                            color: '#ff6b6b',
                                            border: '1px solid rgba(255, 107, 107, 0.3)'
                                        }}>
                                            VENCIDA
                                        </span>
                                    )}
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '15px',
                                    marginBottom: '15px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FontAwesomeIcon icon={faBuilding} style={{ color: 'var(--text-secondary)' }} />
                                        <span style={{ color: 'var(--text-secondary)' }}>{pension.companyName}</span>
                                    </div>

                                    {pension.local && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FontAwesomeIcon icon={faStore} style={{ color: 'var(--text-secondary)' }} />
                                            <span style={{ color: 'var(--text-secondary)' }}>Local: {pension.local}</span>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FontAwesomeIcon icon={faCalendarPlus} style={{ color: 'var(--text-secondary)' }} />
                                        <span style={{
                                            color: expired ? '#ff6b6b' : 'var(--text-secondary)',
                                            fontWeight: expired ? '600' : 'normal'
                                        }}>
                                            Vence: {format(new Date(pension.expirationDate), "dd 'de' MMMM, yyyy", { locale: es })}
                                        </span>
                                    </div>

                                    {pension.monthlyAmount && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FontAwesomeIcon icon={faBuilding} style={{ color: 'var(--text-secondary)' }} />
                                            <span style={{ color: 'var(--text-secondary)' }}>
                                                ${parseFloat(pension.monthlyAmount).toFixed(2)}/mes
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {pension.notes && (
                                    <p style={{
                                        color: 'var(--text-secondary)',
                                        fontSize: '14px',
                                        fontStyle: 'italic',
                                        marginTop: '10px',
                                        padding: '10px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '8px'
                                    }}>
                                        {pension.notes}
                                    </p>
                                )}
                            </div>

                            {/* Botones de acción */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                justifyContent: 'center',
                                '@media (min-width: 768px)': {
                                    alignItems: 'flex-end'
                                }
                            }}>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {pension.status === 'active' && (
                                        <button
                                            onClick={() => onRenew(pension)}
                                            className="btn-primary"
                                            style={{
                                                padding: '8px 16px',
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faCalendarPlus} />
                                            Renovar
                                        </button>
                                    )}

                                    {currentUser?.isSuperUser && (
                                        <button
                                            onClick={() => onEdit(pension)}
                                            className="btn-secondary"
                                            style={{
                                                padding: '8px 16px',
                                                fontSize: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                            Editar
                                        </button>
                                    )}

                                    <button
                                        onClick={() => onToggleStatus(pension)}
                                        className="btn-secondary"
                                        style={{
                                            padding: '8px 16px',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            background: pension.status === 'active'
                                                ? 'rgba(255, 107, 107, 0.1)'
                                                : 'rgba(0, 255, 157, 0.1)',
                                            color: pension.status === 'active' ? '#ff6b6b' : '#00ff9d'
                                        }}
                                    >
                                        <FontAwesomeIcon icon={pension.status === 'active' ? faToggleOff : faToggleOn} />
                                        {pension.status === 'active' ? 'Desactivar' : 'Activar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PensionList;