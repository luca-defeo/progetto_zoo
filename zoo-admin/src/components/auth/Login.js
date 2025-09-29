// src/components/auth/Login.js

import React, { useState } from 'react';

const Login = ({ onLogin, loading, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      onLogin(username, password);
    }
  };

  const handleDemoLogin = (role) => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
      onLogin('admin', 'admin123');
    } else if (role === 'manager') {
      setUsername('manager');
      setPassword('manager123');
      onLogin('manager', 'manager123');
    } else if (role === 'operator') {
      setUsername('operator');
      setPassword('operator123');
      onLogin('operator', 'operator123');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-8 col-md-6 col-lg-4">
            
            {/* Card Login */}
            <div className="card shadow-lg border-0">
              <div className="card-body p-4">
                
                {/* Header */}
                <div className="text-center mb-4">
                  <div 
                    className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: '60px', height: '60px' }}
                  >
                    <i className="bi bi-building fs-3"></i>
                  </div>
                  <h2 className="fw-bold mb-2">Zoo Manager</h2>
                  <p className="text-muted">Sistema di Gestione</p>
                </div>

                {/* Errore */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center mb-3">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <span>{error}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  
                  {/* Username */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Username</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-person"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Inserisci username"
                        disabled={loading}
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Password</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Inserisci password"
                        disabled={loading}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Pulsante Login */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Accesso...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Accedi
                      </>
                    )}
                  </button>
                </form>

               

               
              </div>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;