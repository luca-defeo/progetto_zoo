// src/components/users/UserForm.js

import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import { Role, OperatorType, RoleLabels, OperatorTypeLabels } from '../../constants/enums';

const UserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    username: '',
    password: '',
    role: '',
    operatorType: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!user;

  // Carica dati iniziali
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        lastName: user.lastName || '',
        username: user.username || '',
        password: '', // Non precompilare la password per sicurezza
        role: user.role || '',
        operatorType: user.operatorType || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Se cambia il ruolo, resetta operatorType se non è OPERATOR
    if (name === 'role' && value !== Role.OPERATOR) {
      setFormData(prev => ({
        ...prev,
        operatorType: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) {
      errors.push('Il nome è obbligatorio');
    }
    
    if (!formData.lastName.trim()) {
      errors.push('Il cognome è obbligatorio');
    }
    
    if (!formData.username.trim()) {
      errors.push('Lo username è obbligatorio');
    }
    
    if (!isEditing && !formData.password.trim()) {
      errors.push('La password è obbligatoria per nuovi utenti');
    }
    
    if (formData.password && formData.password.length < 6) {
      errors.push('La password deve essere di almeno 6 caratteri');
    }
    
    if (!formData.role) {
      errors.push('Il ruolo è obbligatorio');
    }
    
    if (formData.role === Role.OPERATOR && !formData.operatorType) {
      errors.push('Il tipo di operatore è obbligatorio per il ruolo Operator');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepara i dati per l'API
      const userData = {
        name: formData.name.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        role: formData.role,
        operatorType: formData.role === Role.OPERATOR ? formData.operatorType : null
      };

      // Aggiungi password solo se presente
      if (formData.password.trim()) {
        userData.password = formData.password;
      }

      if (isEditing) {
        await apiService.updateUser(user.id, userData);
      } else {
        await apiService.createUser(userData);
      }

      onSave();
    } catch (err) {
      console.error('Errore nel salvataggio:', err);
      setError(err.message || 'Errore nel salvataggio dell\'utente');
    } finally {
      setLoading(false);
    }
  };

  const getRoleOptions = () => {
    return Object.values(Role).map(role => ({
      value: role,
      label: RoleLabels[role] || role
    }));
  };

  const getOperatorTypeOptions = () => {
    return Object.values(OperatorType).map(type => ({
      value: type,
      label: OperatorTypeLabels[type] || type
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-person-plus me-2"></i>
                {isEditing ? `Modifica ${user.name} ${user.lastName}` : 'Nuovo Utente'}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onCancel}
                disabled={loading}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>

            {/* Body */}
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <span>{error}</span>
                </div>
              )}

              <div className="row">
                {/* Nome */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Nome <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Es: Mario"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Cognome */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Cognome <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Es: Rossi"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Username <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-at"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Es: mario.rossi"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Password {!isEditing && <span className="text-danger">*</span>}
                    {isEditing && <small className="text-muted">(lascia vuoto per non modificare)</small>}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimo 6 caratteri"
                      disabled={loading}
                      required={!isEditing}
                    />
                  </div>
                </div>

                {/* Ruolo */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Ruolo <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-shield-check"></i>
                    </span>
                    <select
                      className="form-select"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    >
                      <option value="">Seleziona ruolo</option>
                      {getRoleOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tipo Operatore (solo se ruolo è OPERATOR) */}
                {formData.role === Role.OPERATOR && (
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Tipo Operatore <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-person-workspace"></i>
                      </span>
                      <select
                        className="form-select"
                        name="operatorType"
                        value={formData.operatorType}
                        onChange={handleChange}
                        disabled={loading}
                        required
                      >
                        <option value="">Seleziona tipo</option>
                        {getOperatorTypeOptions().map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Info sui ruoli */}
              <div className="info-box">
                <div className="d-flex align-items-start">
                  <i className="bi bi-info-circle text-info me-2 mt-1"></i>
                  <div>
                    <small className="text-muted">
                      <strong>Amministratore:</strong> Accesso completo, può gestire tutto il sistema.<br/>
                      <strong>Manager:</strong> Può visualizzare tutto, modificare animali e gabbie, visualizzare utenti.<br/>
                      <strong>Operatore:</strong> Può solo visualizzare animali e gabbie. Richiede specificare il tipo.
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Annulla
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    {isEditing ? 'Aggiornamento...' : 'Creazione...'}
                  </>
                ) : (
                  <>
                    <i className={`bi ${isEditing ? 'bi-check-lg' : 'bi-plus-lg'} me-2`}></i>
                    {isEditing ? 'Aggiorna' : 'Crea Utente'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>
        {`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 20px;
        }

        .modal-dialog {
          max-width: 700px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          overflow: hidden;
        }

        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #dee2e6;
          background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .btn-close {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 5px;
          border-radius: 4px;
          transition: background-color 0.3s;
        }

        .btn-close:hover {
          background: rgba(255,255,255,0.1);
        }

        .modal-body {
          padding: 30px;
          max-height: 60vh;
          overflow-y: auto;
        }

        .modal-footer {
          padding: 20px;
          border-top: 1px solid #dee2e6;
          background: #f8f9fa;
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .form-label {
          color: #2c3e50;
          margin-bottom: 8px;
        }

        .input-group-text {
          background: #f8f9fa;
          border-color: #ced4da;
          color: #6c757d;
        }

        .form-control,
        .form-select {
          border-color: #ced4da;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #6c5ce7;
          box-shadow: 0 0 0 0.2rem rgba(108, 92, 231, 0.25);
        }

        .info-box {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
          margin-top: 20px;
        }

        .alert {
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .text-danger {
          color: #dc3545 !important;
        }

        .btn {
          font-weight: 500;
          padding: 8px 20px;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%);
          border: none;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #5b4cdb 0%, #9085f2 100%);
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #6c757d;
          border-color: #6c757d;
        }

        .btn-secondary:hover {
          background: #5a6268;
          border-color: #545b62;
        }

        @media (max-width: 768px) {
          .modal-overlay {
            padding: 10px;
          }

          .modal-dialog {
            max-height: 95vh;
          }

          .modal-body {
            padding: 20px;
            max-height: 70vh;
          }

          .modal-header {
            padding: 15px 20px;
          }

          .modal-footer {
            padding: 15px 20px;
          }

          .col-md-6 {
            margin-bottom: 1rem;
          }
        }
        `}
      </style>
    </div>
  );
};

export default UserForm;