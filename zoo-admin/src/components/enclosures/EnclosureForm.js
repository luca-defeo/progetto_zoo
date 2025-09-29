// src/components/enclosures/EnclosureForm.js

import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';

const EnclosureForm = ({ enclosure, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    description: '',
    user: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const isEditing = !!enclosure;

  // Carica dati iniziali
  useEffect(() => {
    if (enclosure) {
      setFormData({
        name: enclosure.name || '',
        area: enclosure.area ? enclosure.area.toString() : '',
        description: enclosure.description || '',
        user: enclosure.user ? enclosure.user.toString() : ''
      });
    }
    
    loadUsers();
  }, [enclosure]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const usersData = await apiService.getUsers().catch(() => []);  // CAMBIATO: da users.getAll()
      setUsers(usersData || []);
    } catch (err) {
      console.error('Errore nel caricamento utenti:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) {
      errors.push('Il nome è obbligatorio');
    }
    
    if (formData.area && (isNaN(formData.area) || parseFloat(formData.area) <= 0)) {
      errors.push('L\'area deve essere un numero positivo');
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
      const enclosureData = {
        name: formData.name.trim(),
        area: formData.area ? parseFloat(formData.area) : null,
        description: formData.description.trim() || null,
        user: formData.user ? parseInt(formData.user) : null
      };

      if (isEditing) {
        await apiService.updateEnclosure(enclosure.id, enclosureData);  // CAMBIATO: da enclosures.update()
      } else {
        await apiService.createEnclosure(enclosureData);                // CAMBIATO: da enclosures.create()
      }

      onSave();
    } catch (err) {
      console.error('Errore nel salvataggio:', err);
      setError(err.message || 'Errore nel salvataggio della gabbia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-house me-2"></i>
                {isEditing ? `Modifica ${enclosure.name}` : 'Nuova Gabbia'}
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
                <div className="col-12 mb-3">
                  <label className="form-label fw-semibold">
                    Nome <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-house-door"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Es: Gabbia Leoni, Recinto Pinguini..."
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Area */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Area (m²)
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-rulers"></i>
                    </span>
                    <input
                      type="number"
                      className="form-control"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      placeholder="Es: 150"
                      min="0"
                      step="0.1"
                      disabled={loading}
                    />
                    <span className="input-group-text">m²</span>
                  </div>
                </div>

                {/* Responsabile */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Responsabile
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-person"></i>
                    </span>
                    <select
                      className="form-select"
                      name="user"
                      value={formData.user}
                      onChange={handleChange}
                      disabled={loading || loadingUsers}
                    >
                      <option value="">Nessun responsabile</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          #{user.id} - {user.name} {user.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  {loadingUsers && (
                    <small className="text-muted">
                      <i className="spinner-border spinner-border-sm me-1"></i>
                      Caricamento utenti...
                    </small>
                  )}
                </div>

                {/* Descrizione */}
                <div className="col-12 mb-3">
                  <label className="form-label fw-semibold">
                    Descrizione
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-card-text"></i>
                    </span>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Descrizione della gabbia, caratteristiche, note particolari..."
                      rows="3"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="info-box">
                <div className="d-flex align-items-start">
                  <i className="bi bi-info-circle text-info me-2 mt-1"></i>
                  <div>
                    <small className="text-muted">
                      <strong>Campo obbligatorio:</strong> Solo il nome è richiesto.<br/>
                      <strong>Area:</strong> Inserisci l'area in metri quadrati per tenere traccia della capienza.<br/>
                      <strong>Responsabile:</strong> L'utente responsabile della manutenzione e gestione della gabbia.
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
                disabled={loading || loadingUsers}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    {isEditing ? 'Aggiornamento...' : 'Creazione...'}
                  </>
                ) : (
                  <>
                    <i className={`bi ${isEditing ? 'bi-check-lg' : 'bi-plus-lg'} me-2`}></i>
                    {isEditing ? 'Aggiorna' : 'Crea Gabbia'}
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
          max-width: 600px;
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
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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
          border-color: #28a745;
          box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
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
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          border: none;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #218838 0%, #1ea085 100%);
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

        textarea.form-control {
          resize: vertical;
          min-height: 80px;
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

export default EnclosureForm;