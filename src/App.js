import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Sidebar from './components/layout/Sidebar';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import CreatePension from './components/pensions/CreatePension';
import ActivePensions from './components/pensions/ActivePensions';
import Settings from './components/config/Settings';
import './styles/global.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{
          minHeight: '100vh',
          backgroundColor: 'var(--primary-color)'
        }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <PrivateRoute>
                <div style={{
                  display: 'flex',
                  minHeight: '100vh'
                }}>
                  <Sidebar />
                  <div style={{
                    flex: 1,
                    padding: '20px',
                    marginLeft: '0',
                    transition: 'margin-left 0.3s ease'
                  }}>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/create-pension" element={<CreatePension />} />
                      <Route path="/active-pensions" element={<ActivePensions />} />
                      <Route path="/config" element={<Settings />} />
                      <Route path="/" element={<Navigate to="/dashboard" />} />
                      <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </div>
                </div>
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;