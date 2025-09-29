// src/components/animals/AnimalForm.js

import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import { AnimalCategory, AnimalCategoryLabels } from '../../constants/enums';

const AnimalForm = ({ animal, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    weight: '',
    user: '',
    enclosure: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enclosures, setEnclosures] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const isEditing = !!animal;

  // Carica dati iniziali
  useEffect(() => {
    if (animal) {
      setFormData({
        name: animal.name || '',
        category: animal.category || '',
        weight: animal.weight ? animal.weight.toString() : '',
        user: animal.user ? animal.user.toString() : '',
        enclosure: animal.enclosure ? animal.enclosure.toString() : ''
      });
    }
    
    loadOptions();
  }, [animal]);

  const loadOptions = async () => {
    try {
      setLoadingOptions(true);
      const [enclosuresData, usersData] = await Promise.all([
        apiService.getEnclosures().catch(() => []),  // CAMBIATO: da enclosures.getAll()
        apiService.getUsers().catch(() => [])        // CAMBIATO: da users.getAll()
      ]);
      
      setEnclosures(enclosuresData || []);
      setUsers(usersData || []);
    } catch (err) {
      console.error('Errore nel caricamento opzioni:', err);
    } finally {
      setLoadingOptions(false);
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
    
    if (!formData.category) {
      errors.push('La categoria è obbligatoria');
    }
    
    if (formData.weight && (isNaN(formData.weight) || parseFloat(formData.weight) <= 0)) {
      errors.push('Il peso deve essere un numero positivo');
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
      const animalData = {
        name: formData.name.trim(),
        category: formData.category,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        user: formData.user ? parseInt(formData.user) : null,
        enclosure: formData.enclosure ? parseInt(formData.enclosure) : null
      };

      if (isEditing) {
        await apiService.updateAnimal(animal.id, animalData);  // CAMBIATO: da animals.update()
      } else {
        await apiService.createAnimal(animalData);             // CAMBIATO: da animals.create()
      }

      onSave();
    } catch (err) {
      console.error('Errore nel salvataggio:', err);
      setError(err.message || 'Errore nel salvataggio dell\'animale');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryOptions = () => {
    return Object.values(AnimalCategory).map(category => ({
      value: category,
      label: AnimalCategoryLabels[category] || category
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
                <i className="bi bi-clipboard-data me-2"></i>
                {isEditing ? `Modifica ${animal.name}` : 'Nuovo Animale'}
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
                      <i className="bi bi-card-text"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Es: Leo, Pingu, Rex..."
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Categoria */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Categoria <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-tags"></i>
                    </span>
                    <select
                      className="form-select"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    >
                      <option value="">Seleziona categoria</option>
                      {getCategoryOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Peso */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Peso (kg)
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-speedometer2"></i>
                    </span>
                    <input
                      type="number"
                      className="form-control"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="Es: 25.5"
                      min="0"
                      step="0.1"
                      disabled={loading}
                    />
                    <span className="input-group-text">kg</span>
                  </div>
                </div>

                {/* Recinto */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">
                    Recinto
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-house"></i>
                    </span>
                    <select
                      className="form-select"
                      name="enclosure"
                      value={formData.enclosure}
                      onChange={handleChange}
                      disabled={loading || loadingOptions}
                    >
                      <option value="">Nessun recinto assegnato</option>
                      {enclosures.map(enclosure => (
                        <option key={enclosure.id} value={enclosure.id}>
                          #{enclosure.id} - {enclosure.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {loadingOptions && (
                    <small className="text-muted">
                      <i className="spinner-border spinner-border-sm me-1"></i>
                      Caricamento recinti...
                    </small>
                  )}
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
                      disabled={loading || loadingOptions}
                    >
                      <option value="">Nessun responsabile</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          #{user.id} - {user.name} {user.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  {loadingOptions && (
                    <small className="text-muted">
                      <i className="spinner-border spinner-border-sm me-1"></i>
                      Caricamento utenti...
                    </small>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="info-box">
                <div className="d-flex align-items-center">
                  <i className="bi bi-info-circle text-info me-2"></i>
                  <small className="text-muted">
                    I campi contrassegnati con * sono obbligatori.
                    Recinto e responsabile sono opzionali e possono essere assegnati in seguito.
                  </small>
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
                disabled={loading || loadingOptions}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    {isEditing ? 'Aggiornamento...' : 'Creazione...'}
                  </>
                ) : (
                  <>
                    <i className={`bi ${isEditing ? 'bi-check-lg' : 'bi-plus-lg'} me-2`}></i>
                    {isEditing ? 'Aggiorna' : 'Crea Animale'}
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
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

export default AnimalForm;