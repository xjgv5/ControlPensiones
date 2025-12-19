import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const StatsCard = ({ title, icon, data, color, isCurrency = false }) => {
    const formatNumber = (num) => {
        if (isCurrency) {
            return `$${num.toFixed(2)}`;
        }
        return num.toString();
    };

    return (
        <div className="glass" style={{ padding: '20px' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px'
            }}>
                <h3 style={{
                    fontSize: '16px',
                    color: 'var(--text-secondary)'
                }}>
                    {title}
                </h3>
                <FontAwesomeIcon icon={icon} style={{ color, fontSize: '20px' }} />
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                textAlign: 'center'
            }}>
                <div>
                    <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        marginBottom: '4px'
                    }}>
                        STW
                    </div>
                    <div style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: color
                    }}>
                        {formatNumber(data.stw)}
                    </div>
                </div>

                <div>
                    <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        marginBottom: '4px'
                    }}>
                        Nvbola
                    </div>
                    <div style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: color
                    }}>
                        {formatNumber(data.nvbola)}
                    </div>
                </div>

                <div>
                    <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        marginBottom: '4px'
                    }}>
                        Total
                    </div>
                    <div style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: color
                    }}>
                        {formatNumber(data.total)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsCard;