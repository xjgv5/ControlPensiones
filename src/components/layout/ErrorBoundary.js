import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            errorInfo: errorInfo
        });
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="container" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    padding: '20px'
                }}>
                    <div className="glass" style={{
                        padding: '40px',
                        textAlign: 'center',
                        maxWidth: '600px'
                    }}>
                        <h2 style={{
                            color: '#ff6b6b',
                            marginBottom: '20px',
                            fontSize: '24px'
                        }}>
                            ⚠️ Algo salió mal
                        </h2>

                        <div style={{
                            background: 'rgba(255, 107, 107, 0.1)',
                            border: '1px solid rgba(255, 107, 107, 0.3)',
                            borderRadius: '10px',
                            padding: '15px',
                            marginBottom: '20px',
                            textAlign: 'left'
                        }}>
                            <p style={{
                                color: 'var(--text-primary)',
                                marginBottom: '10px',
                                fontWeight: '600'
                            }}>
                                Error:
                            </p>
                            <code style={{
                                color: 'var(--text-secondary)',
                                fontSize: '14px',
                                wordBreak: 'break-word'
                            }}>
                                {this.state.error?.toString() || 'Error desconocido'}
                            </code>
                        </div>

                        {this.state.errorInfo && (
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '10px',
                                padding: '15px',
                                marginBottom: '25px',
                                textAlign: 'left',
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                <p style={{
                                    color: 'var(--text-primary)',
                                    marginBottom: '10px',
                                    fontSize: '14px'
                                }}>
                                    Detalles:
                                </p>
                                <pre style={{
                                    color: 'var(--text-secondary)',
                                    fontSize: '12px',
                                    margin: 0,
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </div>
                        )}

                        <div style={{
                            display: 'flex',
                            gap: '15px',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-primary"
                                style={{ minWidth: '140px' }}
                            >
                                🔄 Recargar aplicación
                            </button>

                            <button
                                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                                className="btn-secondary"
                                style={{ minWidth: '140px' }}
                            >
                                ↩️ Intentar de nuevo
                            </button>

                            <button
                                onClick={() => window.history.back()}
                                className="btn-secondary"
                                style={{ minWidth: '140px' }}
                            >
                                ← Volver atrás
                            </button>
                        </div>

                        <p style={{
                            fontSize: '12px',
                            color: 'var(--text-secondary)',
                            marginTop: '25px',
                            opacity: 0.7
                        }}>
                            Si el error persiste, contacta al administrador del sistema.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;