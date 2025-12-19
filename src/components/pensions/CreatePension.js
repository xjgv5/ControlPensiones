import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUser,
    faBuilding,
    faCalendarAlt,
    faMapMarkerAlt,
    faStore,
    faDollarSign,
    faSave
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/global.css';

const CreatePension = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        personName: '',
        companyName: '',
        expirationDate: '',
        lugar: 'stw',
        local: '',
        monthlyAmount: '',
        notes: ''
    });

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
            await addDoc(collection(db, 'pensions'), {
                ...formData,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            navigate('/active-pensions');
        } catch (err) {
            setError('Error al crear la pensión. Intenta nuevamente.');
            console.error('Error creating pension:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{
                    fontSize: '24px',
                    color: 'var(--text-primary)'
                }}>
                    Crear Nueva Pensión
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Completa todos los campos obligatorios (*)
                </p>
            </div>

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
                <div className="glass" style={{ padding: '20px', marginBottom: '20px' }}>
                    <h2 style={{
                        fontSize: '18px',
                        marginBottom: '20px',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <FontAwesomeIcon icon={faUser} />
                        Información Personal
                    </h2>

                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'var(--text-secondary)'
                            }}>
                                <FontAwesomeIcon icon={faUser} style={{ marginRight: '8px' }} />
                                Nombre de la Persona *
                            </label>
                            <input
                                type="text"
                                name="personName"
                                value={formData.personName}
                                onChange={handleChange}
                                className="input-field"
                                required
                                placeholder="Ej: Juan Pérez"
                            />
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'var(--text-secondary)'
                            }}>
                                <FontAwesomeIcon icon={faBuilding} style={{ marginRight: '8px' }} />
                                Nombre de la Empresa *
                            </label>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                className="input-field"
                                required
                                placeholder="Ej: Empresa S.A."
                            />
                        </div>
                    </div>
                </div>

                <div className="glass" style={{ padding: '20px', marginBottom: '20px' }}>
                    <h2 style={{
                        fontSize: '18px',
                        marginBottom: '20px',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        Detalles de la Pensión
                    </h2>

                    <div style={{ display: 'grid', gap: '20px' }}>
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'var(--text-secondary)'
                            }}>
                                <FontAwesomeIcon icon={faDollarSign} style={{ marginRight: '8px' }} />
                                Monto Mensual
                            </label>
                            <input
                                type="number"
                                name="monthlyAmount"
                                value={formData.monthlyAmount}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Ej: 1000.00"
                                step="0.01"
                            />
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'var(--text-secondary)'
                            }}>
                                <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: '8px' }} />
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

                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'var(--text-secondary)'
                            }}>
                                <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: '8px' }} />
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
                                color: 'var(--text-secondary)'
                            }}>
                                <FontAwesomeIcon icon={faStore} style={{ marginRight: '8px' }} />
                                Local (Opcional)
                            </label>
                            <input
                                type="text"
                                name="local"
                                value={formData.local}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Ej: Local #5"
                            />
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: 'var(--text-secondary)'
                            }}>
                                Notas Adicionales
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="input-field"
                                style={{ minHeight: '100px', resize: 'vertical' }}
                                placeholder="Notas adicionales sobre la pensión..."
                            />
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'flex-end',
                    marginTop: '30px'
                }}>
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => navigate('/active-pensions')}
                        style={{ minWidth: '120px' }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ minWidth: '120px' }}
                    >
                        <FontAwesomeIcon icon={faSave} style={{ marginRight: '8px' }} />
                        {loading ? 'Creando...' : 'Crear Pensión'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePension;