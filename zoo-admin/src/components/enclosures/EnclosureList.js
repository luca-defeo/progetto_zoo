// src/components/enclosures/EnclosureList.js

import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import authService from '../../services/authService';

const EnclosureList = ({ onAddEnclosure, onEditEnclosure }) => {
  const [enclosures, setEnclosures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedEnclosure, setSelectedEnclosure] = useState(null);
  const [showAnimalsModal, setShowAnimalsModal] = useState(false);

  // Permessi utente
  const isAdmin = authService.isAdmin();
  const isManager = authService.isManager();
  const canEdit = isAdmin || isManager;
  const canDelete = isAdmin || isManager;

  // Carica le gabbie all'avvio
  useEffect(() => {
    loadEnclosures();
  }, []);

  const loadEnclosures = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getEnclosures();
      setEnclosures(data || []);
    } catch (err) {
      console.error('Errore nel caricamento gabbie:', err);
      setError(err.message || 'Errore nel caricamento delle gabbie');
      setEnclosures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (enclosure) => {
    if (!canDelete) return;
    
    try {
      setDeleting(true);
      await apiService.deleteEnclosure(enclosure.id);
      
      // Ricarica la lista
      await loadEnclosures();
      
      // Chiudi il modal di conferma
      setDeleteConfirm(null);
      
    } catch (err) {
      console.error('Errore nell\'eliminazione:', err);
      setError(err.message || 'Errore nell\'eliminazione della gabbia');
    } finally {
      setDeleting(false);
    }
  };

  const formatArea = (area) => {
    return area ? `${area} m²` : 'Non specificata';
  };

  const getAnimalsCount = (animals) => {
    return animals ? animals.length : 0;
  };

  const handleCardClick = (enclosure) => {
    setSelectedEnclosure(enclosure);
    setShowAnimalsModal(true);
  };

  const getCategoryBadge = (category) => {
    const badgeColors = {
      'MAMMAL': 'category-mammal',
      'BIRD': 'category-bird',
      'REPTILE': 'category-reptile',
      'FISH': 'category-fish',
      'AMPHIBIAN': 'category-amphibian'
    };
    return badgeColors[category] || 'category-default';
  };

  // Modal per visualizzare gli animali della gabbia
  const AnimalsModal = () => {
    if (!showAnimalsModal || !selectedEnclosure) return null;

    const animals = selectedEnclosure.animals || [];

    return (
      <div className="modal-overlay">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-house me-2"></i>
                Animali nella gabbia: <strong>{selectedEnclosure.name}</strong>
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowAnimalsModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-body">
              {animals.length === 0 ? (
                <div className="empty-animals">
                  <i className="bi bi-clipboard-x display-4 text-muted mb-3"></i>
                  <h4>Gabbia vuota</h4>
                  <p className="text-muted">Non ci sono animali in questa gabbia al momento.</p>
                </div>
              ) : (
                <div className="animals-grid">
                  {animals.map((animal) => (
                    <div key={animal.id} className="animal-card">
                      <div className="animal-header">
                        <h6 className="animal-name">{animal.name}</h6>
                        <span className={`badge ${getCategoryBadge(animal.category)}`}>
                          {animal.category}
                        </span>
                      </div>
                      <div className="animal-details">
                        <div className="animal-detail">
                          <i className="bi bi-hash text-muted"></i>
                          <span>ID: {animal.id}</span>
                        </div>
                        {animal.weight && (
                          <div className="animal-detail">
                            <i className="bi bi-speedometer text-muted"></i>
                            <span>{animal.weight} kg</span>
                          </div>
                        )}
                        {animal.user && (
                          <div className="animal-detail">
                            <i className="bi bi-person text-muted"></i>
                            <span>Responsabile: #{animal.user}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <div className="modal-info">
                <i className="bi bi-info-circle me-2"></i>
                <span>{animals.length} {animals.length === 1 ? 'animale' : 'animali'} totali</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAnimalsModal(false)}
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente per conferma eliminazione
  const DeleteConfirmModal = () => {
    if (!deleteConfirm) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Conferma Eliminazione</h5>
            </div>
            <div className="modal-body">
              <p>
                Sei sicuro di voler eliminare la gabbia <strong>{deleteConfirm.name}</strong>?
              </p>
              {getAnimalsCount(deleteConfirm.animals) > 0 && (
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Attenzione: questa gabbia contiene {getAnimalsCount(deleteConfirm.animals)} animali.
                </div>
              )}
              <p className="text-muted">Questa azione non può essere annullata.</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
              >
                Annulla
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Eliminazione...
                  </>
                ) : (
                  'Elimina'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="enclosures-container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Caricamento...</span>
            </div>
            <h5 className="text-muted">Caricamento gabbie...</h5>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="enclosures-container">
      {/* Header con titolo e pulsante aggiungi */}
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">Gestione Gabbie</h1>
            <p className="page-subtitle">
              {enclosures.length} {enclosures.length === 1 ? 'gabbia registrata' : 'gabbie registrate'}
            </p>
          </div>
          {canEdit && onAddEnclosure && (
            <button 
              className="btn btn-primary btn-add"
              onClick={onAddEnclosure}
            >
              <i className="bi bi-plus me-2"></i>
              Aggiungi Gabbia
            </button>
          )}
        </div>
      </div>

      {/* Messaggio di errore */}
      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <span>{error}</span>
          <button 
            className="btn btn-sm btn-outline-danger ms-auto"
            onClick={loadEnclosures}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Riprova
          </button>
        </div>
      )}

      {/* Contenuto principale */}
      {enclosures.length === 0 ? (
        // Stato vuoto
        <div className="empty-state">
          <div className="empty-state-icon">
            <i className="bi bi-house-door"></i>
          </div>
          <h3 className="empty-state-title">Nessuna gabbia trovata</h3>
          <p className="empty-state-description">
            {canEdit 
              ? 'Inizia aggiungendo la prima gabbia al sistema.'
              : 'Non ci sono gabbie registrate nel sistema.'}
          </p>
          {canEdit && onAddEnclosure && (
            <button 
              className="btn btn-primary"
              onClick={onAddEnclosure}
            >
              <i className="bi bi-plus me-2"></i>
              Aggiungi Prima Gabbia
            </button>
          )}
        </div>
      ) : (
        // Grid di card
        <div className="enclosures-grid">
          {enclosures.map((enclosure) => (
            <div key={enclosure.id} className="enclosure-card" onClick={() => handleCardClick(enclosure)}>
              <div className="card-header">
                <div className="card-id">
                  <span className="badge-id">#{enclosure.id}</span>
                </div>
                <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                  {canEdit && onEditEnclosure && (
                    <button
                      className="btn-action btn-edit"
                      onClick={() => onEditEnclosure(enclosure)}
                      title="Modifica gabbia"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className="btn-action btn-delete"
                      onClick={() => setDeleteConfirm(enclosure)}
                      title="Elimina gabbia"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="card-body">
                <h3 className="card-title">
                  {enclosure.name}
                </h3>
                
                <div className="card-info">
                  <div className="info-row">
                    <div className="info-item">
                      <span className="info-label">Area</span>
                      <span className="info-value">{formatArea(enclosure.area)}</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="info-label">Responsabile</span>
                      <span className="info-value">
                        {enclosure.user ? `#${enclosure.user}` : 'Non assegnato'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="animals-summary">
                    <span className="animals-label">Animali contenuti</span>
                    <span className={`animals-count ${getAnimalsCount(enclosure.animals) > 0 ? 'has-animals' : 'empty'}`}>
                      {getAnimalsCount(enclosure.animals)}
                    </span>
                  </div>
                </div>
                
                {enclosure.description && (
                  <div className="card-description">
                    <p>{enclosure.description}</p>
                  </div>
                )}
              </div>
              
              <div className="card-footer">
                <span className="footer-text">Clicca per vedere i dettagli</span>
                <i className="bi bi-chevron-right"></i>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal degli animali */}
      <AnimalsModal />

      {/* Modal di conferma eliminazione */}
      <DeleteConfirmModal />

      <style>
        {`
        .enclosures-container {
          padding: 24px;
          background-color: #f8f9fa;
          min-height: 100vh;
        }

        .page-header {
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #e9ecef;
        }

        .page-title {
          color: #2d3748;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .page-subtitle {
          color: #718096;
          font-size: 16px;
          font-weight: 500;
          margin: 0;
        }

        .btn-add {
          padding: 12px 20px;
          font-size: 15px;
          font-weight: 600;
          border-radius: 8px;
          border: none;
          background-color: #059669;
          color: white;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .btn-add:hover {
          background-color: #047857;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }

        .empty-state {
          text-align: center;
          padding: 64px 32px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .empty-state-icon {
          font-size: 64px;
          color: #9ca3af;
          margin-bottom: 24px;
        }

        .empty-state-title {
          color: #374151;
          margin-bottom: 12px;
          font-size: 24px;
          font-weight: 600;
        }

        .empty-state-description {
          color: #6b7280;
          font-size: 16px;
          margin-bottom: 32px;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        .enclosures-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 24px;
        }

        .enclosure-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
          cursor: pointer;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .enclosure-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px 16px;
          border-bottom: 1px solid #f3f4f6;
        }

        .badge-id {
          background-color: #f3f4f6;
          color: #4b5563;
          font-size: 13px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }

        .card-actions {
          display: flex;
          gap: 8px;
        }

        .btn-action {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-edit {
          color: #d97706;
        }

        .btn-edit:hover {
          background-color: #fef3c7;
          border-color: #f59e0b;
          color: #b45309;
        }

        .btn-delete {
          color: #dc2626;
        }

        .btn-delete:hover {
          background-color: #fee2e2;
          border-color: #f87171;
          color: #b91c1c;
        }

        .card-body {
          padding: 0 24px 20px;
        }

        .card-title {
          color: #1f2937;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 20px;
          line-height: 1.3;
        }

        .card-info {
          margin-bottom: 16px;
        }

        .info-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .info-item {
          background-color: #f9fafb;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #f3f4f6;
        }

        .info-label {
          display: block;
          font-size: 12px;
          color: #6b7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .info-value {
          display: block;
          font-size: 15px;
          color: #374151;
          font-weight: 600;
        }

        .animals-summary {
          background-color: #f0fdf4;
          border: 1px solid #d1fae5;
          border-radius: 8px;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .animals-label {
          font-size: 14px;
          color: #166534;
          font-weight: 600;
        }

        .animals-count {
          font-size: 18px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          min-width: 32px;
          text-align: center;
        }

        .animals-count.has-animals {
          background-color: #059669;
          color: white;
        }

        .animals-count.empty {
          background-color: #e5e7eb;
          color: #6b7280;
        }

        .card-description {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-left: 4px solid #0ea5e9;
          border-radius: 6px;
          padding: 12px;
        }

        .card-description p {
          margin: 0;
          color: #475569;
          font-size: 14px;
          line-height: 1.5;
        }

        .card-footer {
          padding: 12px 24px;
          background-color: #f9fafb;
          border-top: 1px solid #f3f4f6;
          display: flex;
          justify-content: between;
          align-items: center;
        }

        .footer-text {
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
          flex: 1;
        }

        .card-footer i {
          color: #9ca3af;
          font-size: 16px;
          transition: transform 0.2s ease;
        }

        .enclosure-card:hover .card-footer i {
          transform: translateX(4px);
          color: #059669;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
        }

        .modal-dialog {
          max-width: 500px;
          width: 90%;
        }

        .modal-lg {
          max-width: 800px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .modal-header {
          padding: 24px 32px;
          border-bottom: 1px solid #e5e7eb;
          background-color: #f9fafb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
        }

        .btn-close {
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          color: #6b7280;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .btn-close:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .modal-body {
          padding: 32px;
          max-height: 60vh;
          overflow-y: auto;
        }

        .modal-footer {
          padding: 20px 32px;
          border-top: 1px solid #e5e7eb;
          background-color: #f9fafb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-info {
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }

        .empty-animals {
          text-align: center;
          padding: 48px 24px;
          color: #6b7280;
        }

        .animals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .animal-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          background: #fafbfc;
          transition: all 0.2s ease;
        }

        .animal-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .animal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .animal-name {
          margin: 0;
          color: #1f2937;
          font-weight: 600;
          font-size: 16px;
        }

        .animal-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .animal-detail {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6b7280;
        }

        .animal-detail i {
          width: 14px;
        }

        .category-mammal { background: #dbeafe; color: #1e40af; }
        .category-bird { background: #e0f2fe; color: #0369a1; }
        .category-reptile { background: #dcfce7; color: #16a34a; }
        .category-fish { background: #fef3c7; color: #d97706; }
        .category-amphibian { background: #f3e8ff; color: #7c3aed; }
        .category-default { background: #f3f4f6; color: #6b7280; }

        .alert {
          border-radius: 8px;
          border: 1px solid;
          padding: 16px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
        }

        .alert-danger {
          background-color: #fef2f2;
          border-color: #fecaca;
          color: #b91c1c;
        }

        .alert-warning {
          background-color: #fffbeb;
          border-color: #fed7aa;
          color: #d97706;
        }

        .badge {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          .enclosures-container {
            padding: 16px;
          }

          .enclosures-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .page-title {
            font-size: 28px;
          }

          .card-title {
            font-size: 20px;
          }

          .page-header .d-flex {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .animals-grid {
            grid-template-columns: 1fr;
          }

          .modal-dialog {
            width: 95%;
          }

          .info-row {
            grid-template-columns: 1fr;
          }
        }
        `}
      </style>
    </div>
  );
};

export default EnclosureList;