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
  padding: 30px;
  background: transparent;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #e8f5e9;
}

.page-title {
  color: #2e7d32;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.page-subtitle {
  color: #546e7a;
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.btn-add {
  background: #2e7d32;
  color: white;
  border: 2px solid #2e7d32;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
}

.btn-add:hover {
  background: #1b5e20;
  border-color: #1b5e20;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

.empty-state {
  text-align: center;
  padding: 80px 32px;
  background: white;
  border-radius: 16px;
  border: 2px solid rgba(46, 125, 50, 0.1);
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.empty-state-icon {
  font-size: 64px;
  color: #81c784;
  margin-bottom: 24px;
}

.empty-state-title {
  color: #2e7d32;
  margin-bottom: 12px;
  font-size: 24px;
  font-weight: 600;
}

.empty-state-description {
  color: #546e7a;
  font-size: 16px;
  margin-bottom: 32px;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

/* ===== CARD GABBIE SEMPLIFICATE ===== */
.enclosures-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.enclosure-card {
  background: white;
  border-radius: 12px;
  border: 2px solid rgba(46, 125, 50, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.enclosure-card:hover {
  border-color: #81c784;
  box-shadow: 0 8px 24px rgba(46, 125, 50, 0.15);
  transform: translateY(-4px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 2px solid #e8f5e9;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
}

.badge-id {
  background: #e8f5e9;
  color: #2e7d32;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #81c784;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 2px solid;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit {
  color: #fb8c00;
  border-color: #ffe0b2;
}

.btn-edit:hover {
  background: #fff3e0;
  border-color: #fb8c00;
  color: #ef6c00;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(251, 140, 0, 0.3);
}

.btn-delete {
  color: #e53935;
  border-color: #ffcdd2;
}

.btn-delete:hover {
  background: #ffebee;
  border-color: #e53935;
  color: #c62828;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(229, 57, 53, 0.3);
}

.card-body {
  padding: 24px;
}

.card-title {
  color: #2e7d32;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.3;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  gap: 12px;
}

.info-item {
  flex: 1;
  background: #f5f5f5;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 3px solid #81c784;
}

.info-label {
  display: block;
  font-size: 11px;
  color: #78909c;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.info-value {
  display: block;
  font-size: 15px;
  color: #2e7d32;
  font-weight: 600;
}

.animals-summary {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border: 2px solid #81c784;
  border-radius: 10px;
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.animals-label {
  font-size: 13px;
  color: #2e7d32;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.animals-count {
  font-size: 24px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 8px;
  min-width: 40px;
  text-align: center;
}

.animals-count.has-animals {
  background: #2e7d32;
  color: white;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);
}

.animals-count.empty {
  background: #e0e0e0;
  color: #78909c;
}

.card-description {
  background: #f9fafb;
  border-left: 3px solid #4fc3f7;
  border-radius: 6px;
  padding: 12px 14px;
  margin-top: 12px;
}

.card-description p {
  margin: 0;
  color: #546e7a;
  font-size: 14px;
  line-height: 1.5;
}

.card-footer {
  padding: 14px 24px;
  background: #f9fafb;
  border-top: 2px solid #e8f5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-text {
  color: #78909c;
  font-size: 13px;
  font-weight: 500;
}

.card-footer i {
  color: #bdbdbd;
  font-size: 16px;
  transition: all 0.3s ease;
}

.enclosure-card:hover .card-footer i {
  transform: translateX(4px);
  color: #2e7d32;
}

/* ===== MODALS ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 20px;
}

.modal-dialog {
  max-width: 500px;
  width: 100%;
}

.modal-lg {
  max-width: 800px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  padding: 24px 32px;
  border-bottom: 2px solid #e8f5e9;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #2e7d32;
}

.btn-close {
  background: #f5f5f5;
  border: 2px solid #e0e0e0;
  color: #78909c;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: #e0e0e0;
  border-color: #bdbdbd;
  color: #546e7a;
}

.modal-body {
  padding: 32px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-body p {
  color: #546e7a;
  line-height: 1.6;
  margin-bottom: 12px;
}

.modal-body strong {
  color: #2e7d32;
  font-weight: 600;
}

.modal-footer {
  padding: 20px 32px;
  border-top: 2px solid #e8f5e9;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-info {
  color: #78909c;
  font-size: 14px;
  font-weight: 500;
}

.empty-animals {
  text-align: center;
  padding: 60px 24px;
  color: #78909c;
}

.animals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.animal-card {
  border: 2px solid #e8f5e9;
  border-radius: 10px;
  padding: 18px;
  background: #fafafa;
  transition: all 0.3s ease;
}

.animal-card:hover {
  border-color: #81c784;
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.15);
  transform: translateY(-2px);
}

.animal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e8f5e9;
}

.animal-name {
  margin: 0;
  color: #2e7d32;
  font-weight: 600;
  font-size: 16px;
}

.animal-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.animal-detail {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #546e7a;
}

.animal-detail i {
  width: 16px;
  color: #81c784;
}

/* Badge categorie */
.category-mammal { 
  background: linear-gradient(135deg, #8d6e63, #6d4c41);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-bird { 
  background: linear-gradient(135deg, #42a5f5, #1e88e5);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-reptile { 
  background: linear-gradient(135deg, #66bb6a, #43a047);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-fish { 
  background: linear-gradient(135deg, #29b6f6, #0288d1);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-amphibian { 
  background: linear-gradient(135deg, #26a69a, #00897b);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-default { 
  background: linear-gradient(135deg, #78909c, #546e7a);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid;
}

.btn-secondary {
  background: white;
  color: #546e7a;
  border-color: #e0e0e0;
}

.btn-secondary:hover {
  background: #f5f5f5;
  border-color: #bdbdbd;
}

.btn-danger {
  background: #e53935;
  color: white;
  border-color: #e53935;
}

.btn-danger:hover {
  background: #c62828;
  border-color: #c62828;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(229, 57, 53, 0.3);
}

.btn-danger:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background: #2e7d32;
  color: white;
  border: 2px solid #2e7d32;
}

.btn-primary:hover {
  background: #1b5e20;
  border-color: #1b5e20;
}

/* Alerts */
.alert {
  border-radius: 12px;
  border: 2px solid;
  padding: 18px 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.alert-danger {
  background: #ffebee;
  border-color: #ef9a9a;
  color: #c62828;
}

.alert-warning {
  background: #fff3e0;
  border-color: #ffcc80;
  color: #ef6c00;
}

.btn-outline-danger {
  background: white;
  color: #e53935;
  border: 2px solid #e53935;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline-danger:hover {
  background: #e53935;
  color: white;
}

.badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
}

/* Spinner */
.spinner-border {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}

@keyframes spinner-border {
  to { transform: rotate(360deg); }
}

/* Utility classes */
.text-muted { color: #78909c; }
.text-center { text-align: center; }
.ms-auto { margin-left: auto; }
.me-1 { margin-right: 4px; }
.me-2 { margin-right: 8px; }
.mb-3 { margin-bottom: 16px; }
.d-flex { display: flex; }
.justify-content-between { justify-content: space-between; }
.justify-content-center { justify-content: center; }
.align-items-center { align-items: center; }

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .enclosures-container {
    padding: 20px;
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
    flex-direction: column;
  }

  .card-body {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .enclosures-container {
    padding: 15px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 14px;
  }

  .btn-add {
    padding: 10px 18px;
    font-size: 14px;
  }

  .card-header {
    padding: 16px 20px;
  }

  .card-body {
    padding: 16px 20px;
  }

  .card-footer {
    padding: 12px 20px;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 20px;
  }
}
`}
</style>
    </div>
  );
};

export default EnclosureList;