import React, { useState } from 'react';
import { format, addMonths } from 'date-fns';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendarPlus, faSave } from '@fortawesome/free-solid-svg-icons';

const RenewModal = ({ pension, onClose, onSuccess }) => {
    const [newDate, setNewDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Establecer fecha sugerida (6 meses después de la fecha actual)
    React.useEffect(() => {
        const today = new Date();
        const suggestedDate = addMonths(today, 6);
        setNewDate(format(suggestedDate, 'yyyy-MM-dd'));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!newDate) {
                throw new Error('Por favor selecciona una fecha');
            }

            const pensionRef = doc(db, 'pensions', pension.id);
            await updateDoc(pensionRef, {
                expirationDate: newDate,
                updatedAt: new Date(),
                lastRenewal: new Date()
            });

            onSuccess();
        } catch (err) {
            setError(err.message || 'Error al renovar la pensión');
        } finally {
            setLoading(false);
        }
    };

    const quickRenewOptions = [
        { label: '3 meses', months: 3 },
        { label: '6 meses', months: 6 },
        { label: '1 año', months: 12 },
        { label: '2 años', months: 24 }
    ];

    const handleQuickRenew = (months) => {
        const today = new Date();
        const newExpiryDate = addMonths(today, months);
        setNewDate(format(newExpiryDate, 'yyyy-MM-dd'));
    };

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

                <h2 style={{
                    fontSize: '24px',
                    marginBottom: '10px',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <FontAwesomeIcon icon={faCalendarPlus} />
                    Renovar Pensión
                </h2>

                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Renovando pensión para: <strong>{pension.personName}</strong>
                </p>

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

                <form onSubmit={handleSubmit}>
                    {/* Fecha de vencimiento actual */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: 'var(--text-secondary)'
                        }}>
                            Fecha de vencimiento actual
                        </label>
                        <div className="input-field" style={{
                            background: 'var(--secondary-color)',
                            color: 'var(--text-primary)'
                        }}>
                            {format(new Date(pension.expirationDate), "dd 'de' MMMM, yyyy")}
                        </div>
                    </div>

                    {/* Renovación rápida */}
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '12px',
                            color: 'var(--text-secondary)'
                        }}>
                            Renovación rápida
                        </label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                            gap: '10px'
                        }}>
                            {quickRenewOptions.map((option) => (
                                <button
                                    key={option.months}
                                    type="button"
                                    onClick={() => handleQuickRenew(option.months)}
                                    className="btn-secondary"
                                    style={{
                                        padding: '10px',
                                        fontSize: '14px',
                                        background: newDate === format(addMonths(new Date(), option.months), 'yyyy-MM-dd')
                                            ? 'var(--accent-color)'
                                            : 'var(--glass-bg)'
                                    }}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Nueva fecha de vencimiento */}
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: 'var(--text-secondary)'
                        }}>
                            Nueva fecha de vencimiento *
                        </label>
                        <input
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="input-field"
                            required
                            min={format(new Date(), 'yyyy-MM-dd')}
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
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{ minWidth: '100px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <FontAwesomeIcon icon={faSave} />
                            {loading ? 'Renovando...' : 'Renovar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RenewModal;