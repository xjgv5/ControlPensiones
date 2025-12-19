import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTimes,
    faEdit,
    faSave,
    faUser,
    faBuilding,
    faCalendarAlt,
    faMapMarkerAlt,
    faStore,
    faDollarSign
} from '@fortawesome/free-solid-svg-icons';

const EditModal = ({ pension, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        personName: pension.personName || '',
        companyName: pension.companyName || '',
        expirationDate: pension.expirationDate || '',
        lugar: pension.lugar || 'stw',
        local: pension.local || '',
        monthlyAmount: pension.monthlyAmount || '',
        notes: pension.notes || '',
        status: pension.status || 'active'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validaciones
            if (!formData.personName.trim() || !formData.companyName.trim() || !formData.expirationDate) {
                throw new Error('Todos los campos obligatorios deben estar completos');
            }

            const pensionRef = doc(db, 'pensions', pension.id);
            await updateDoc(pensionRef, {
                ...formData,
                updatedAt: new Date(),
                monthlyAmount: formData.monthlyAmount ? parseFloat(formData.monthlyAmount) : null
            });

            onSuccess();
        } catch (err) {
            setError(err.message || 'Error al actualizar la pensión');
        } finally {
            setLoading(false);
        }
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
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: '30px',
                    position: 'relative'
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
                    marginBottom: '20px',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <FontAwesomeIcon icon={faEdit} />
                    Editar Pensión
                </h2>

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
                    <div style={{ display: 'grid', gap: '20px', marginBottom: '30px' }}>
                        {/* Información personal */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <FontAwesomeIcon icon={faUser} />
                                Nombre de la Persona *
                            </label>
                            <input
                                type="text"
                                name="personName"
                                value={formData.personName}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <FontAwesomeIcon icon={faBuilding} />
                                Nombre de la Empresa *
                            </label>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>

                        {/* Detalles */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '15px'
                        }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <FontAwesomeIcon icon={faDollarSign} />
                                    Monto Mensual
                                </label>
                                <input
                                    type="number"
                                    name="monthlyAmount"
                                    value={formData.monthlyAmount}
                                    onChange={handleChange}
                                    className="input-field"
                                    step="0.01"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <FontAwesomeIcon icon={faCalendarAlt} />
                                    Fecha de Vencimiento *
                                </label>
                                <input
                                    type="date"
                                    name="expirationDate"
                                    value={formData.expirationDate}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                />
                            </div>
                        </div>

                        {/* Ubicación */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '15px'
                        }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                                    Lugar *
                                </label>
                                <select
                                    name="lugar"
                                    value={formData.lugar}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                >
                                    <option value="stw">STW</option>
                                    <option value="nvbola">Nvbola</option>
                                </select>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    color: 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <FontAwesomeIcon icon={faStore} />
                                    Local
                                </label>
                                <input
                                    type="text"
                                    name="local"
                                    value={formData.local}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        {/* Estado */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'var(--text-secondary)'
                            }}>
                                Estado
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option value="active">Activa</option>
                                <option value="inactive">Inactiva</option>
                            </select>
                        </div>

                        {/* Notas */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'var(--text-secondary)'
                            }}>
                                Notas
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="input-field"
                                style={{ minHeight: '100px', resize: 'vertical' }}
                                placeholder="Notas adicionales..."
                            />
                        </div>
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
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditModal;