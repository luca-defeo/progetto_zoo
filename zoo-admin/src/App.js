// src/App.js

import React, { useState, useEffect } from 'react';
import Login from './components/auth/Login';
import MainDashboard from './components/dashboard/MainDashboard';
import authService from './services/authService';

// Importa Bootstrap CSS se non l'hai già fatto nel index.js
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Effetto per verificare se l'utente è già autenticato all'avvio
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsInitializing(true);
        
        // Verifica se c'è un utente già autenticato
        if (authService.isAuthenticated()) {
          const user = authService.getCurrentUser();
          setCurrentUser(user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Errore durante l\'inizializzazione:', error);
        // In caso di errore, forza il logout
        authService.logout();
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  // Gestisci il login
  const handleLogin = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.login(username, password);

      if (result.success) {
        setCurrentUser(result.user);
        setIsAuthenticated(true);
      } else {
        setError(result.error || 'Errore durante il login');
      }
    } catch (error) {
      console.error('Errore durante il login:', error);
      setError('Username o password non corretti');
    } finally {
      setLoading(false);
    }
  };

  // Gestisci il logout
  const handleLogout = () => {
    try {
      authService.logout();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setError(null);
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  // Gestisci l'aggiornamento dei dati utente
  const handleUserUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    authService.updateCurrentUser(updatedUser);
  };

  // Mostra loading durante l'inizializzazione
  if (isInitializing) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Caricamento...</span>
          </div>
          <h5 className="text-muted">Inizializzazione Zoo Manager...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {!isAuthenticated ? (
        // Mostra la schermata di login
        <Login 
          onLogin={handleLogin}
          loading={loading}
          error={error}
        />
      ) : (
        // Mostra la dashboard principale
        <MainDashboard 
          currentUser={currentUser}
          onLogout={handleLogout}
          onUserUpdate={handleUserUpdate}
        />
      )}

      {/* Stili CSS globali per l'applicazione */}
      <style>
        {`
        /* Reset e stili globali */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: #f8f9fa;
        }

        .App {
          min-height: 100vh;
        }

        /* Utility classes */
        .text-truncate-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .cursor-pointer {
          cursor: pointer;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Animations */
        .fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        /* Card hover effects */
        .card-hover {
          transition: all 0.3s ease;
        }

        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        /* Button styles */
        .btn-gradient-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
        }

        .btn-gradient-primary:hover {
          background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
          color: white;
          transform: translateY(-1px);
        }

        .btn-gradient-success {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          border: none;
          color: white;
        }

        .btn-gradient-success:hover {
          background: linear-gradient(135deg, #0f8078 0%, #32d96a 100%);
          color: white;
          transform: translateY(-1px);
        }

        .btn-gradient-danger {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
          border: none;
          color: white;
        }

        .btn-gradient-danger:hover {
          background: linear-gradient(135deg, #ff5252 0%, #d84545 100%);
          color: white;
          transform: translateY(-1px);
        }

        /* Form styles */
        .form-control:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        .form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        /* Badge styles */
        .badge-role {
          font-size: 0.75rem;
          padding: 0.35em 0.65em;
        }

        /* Modal styles */
        .modal-backdrop {
          background-color: rgba(0,0,0,0.6);
        }

        .modal-content {
          border: none;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }

        /* Loading states */
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255,255,255,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        /* Responsive improvements */
        @media (max-width: 768px) {
          .container-fluid {
            padding-left: 10px;
            padding-right: 10px;
          }
          
          .card {
            margin-bottom: 1rem;
          }
          
          .btn {
            font-size: 0.875rem;
          }
        }

        /* Status indicators */
        .status-indicator {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 8px;
        }

        .status-active {
          background-color: #28a745;
          box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.3);
        }

        .status-inactive {
          background-color: #dc3545;
          box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.3);
        }

        .status-warning {
          background-color: #ffc107;
          box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.3);
        }

        /* Table improvements */
        .table-responsive {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .table thead th {
          border-bottom: 2px solid #dee2e6;
          font-weight: 600;
          background-color: #f8f9fa;
        }

        /* Empty states */
        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #6c757d;
        }

        .empty-state i {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }
        `}
      </style>
    </div>
  );
}

export default App;