import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUsers,
    faMoneyBillWave,
    faUserSlash,
    faChartBar
} from '@fortawesome/free-solid-svg-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import StatsCard from './StatsCard';
import '../../styles/global.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalActive: { stw: 0, nvbola: 0, total: 0 },
        totalRevenue: { stw: 0, nvbola: 0, total: 0 },
        totalInactive: { stw: 0, nvbola: 0, total: 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const pensionsRef = collection(db, 'pensions');
            const q = query(pensionsRef);
            const querySnapshot = await getDocs(q);

            let totalActive = { stw: 0, nvbola: 0, total: 0 };
            let totalRevenue = { stw: 0, nvbola: 0, total: 0 };
            let totalInactive = { stw: 0, nvbola: 0, total: 0 };

            querySnapshot.forEach((doc) => {
                const pension = doc.data();
                const location = pension.lugar?.toLowerCase() || '';
                const amount = parseFloat(pension.monthlyAmount) || 0;

                if (pension.status === 'active') {
                    totalActive.total++;
                    totalRevenue.total += amount;

                    if (location.includes('stw')) {
                        totalActive.stw++;
                        totalRevenue.stw += amount;
                    } else if (location.includes('nvbola')) {
                        totalActive.nvbola++;
                        totalRevenue.nvbola += amount;
                    }
                } else if (pension.status === 'inactive') {
                    totalInactive.total++;
                    if (location.includes('stw')) {
                        totalInactive.stw++;
                    } else if (location.includes('nvbola')) {
                        totalInactive.nvbola++;
                    }
                }
            });

            setStats({
                totalActive,
                totalRevenue,
                totalInactive
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div className="glass" style={{ padding: '30px' }}>
                    Cargando estadísticas...
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <h1 style={{
                fontSize: '24px',
                marginBottom: '20px',
                color: 'var(--text-primary)'
            }}>
                Resumen General
            </h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <StatsCard
                    title="Pensiones Activas"
                    icon={faUsers}
                    data={stats.totalActive}
                    color="#00ff9d"
                />

                <StatsCard
                    title="Ingresos Mensuales"
                    icon={faMoneyBillWave}
                    data={stats.totalRevenue}
                    color="#4dabf7"
                    isCurrency
                />

                <StatsCard
                    title="Pensiones Inactivas"
                    icon={faUserSlash}
                    data={stats.totalInactive}
                    color="#ff6b6b"
                />
            </div>

            <div className="glass" style={{ padding: '20px', marginTop: '20px' }}>
                <h2 style={{
                    fontSize: '18px',
                    marginBottom: '15px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <FontAwesomeIcon icon={faChartBar} />
                    Distribución por Zona
                </h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '15px'
                }}>
                    <div>
                        <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>STW</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalActive.stw}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            Activas • ${stats.totalRevenue.stw.toFixed(2)}/mes
                        </p>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Nvbola</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalActive.nvbola}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            Activas • ${stats.totalRevenue.nvbola.toFixed(2)}/mes
                        </p>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalActive.total}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            Activas • ${stats.totalRevenue.total.toFixed(2)}/mes
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;