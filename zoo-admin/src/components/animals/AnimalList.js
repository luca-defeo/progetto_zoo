// src/components/animals/AnimalList.js

import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import authService from '../../services/authService';
import { AnimalCategory, AnimalCategoryLabels, CategoryBadgeClasses } from '../../constants/enums';

const AnimalList = ({ onAddAnimal, onEditAnimal }) => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Permessi utente
  const isAdmin = authService.isAdmin();
  const isManager = authService.isManager();
  const canEdit = isAdmin || isManager;
  const canDelete = isAdmin || isManager;

  // Carica gli animali all'avvio
  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAnimals();
      setAnimals(data || []);
    } catch (err) {
      console.error('Errore nel caricamento animali:', err);
      setError(err.message || 'Errore nel caricamento degli animali');
      setAnimals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (animal) => {
    if (!canDelete) return;
    
    try {
      setDeleting(true);
      await apiService.deleteAnimal(animal.id);
      
      // Ricarica la lista
      await loadAnimals();
      
      // Chiudi il modal di conferma
      setDeleteConfirm(null);
      
    } catch (err) {
      console.error('Errore nell\'eliminazione:', err);
      setError(err.message || 'Errore nell\'eliminazione dell\'animale');
    } finally {
      setDeleting(false);
    }
  };

  const formatWeight = (weight) => {
    return weight ? `${weight} kg` : 'Non specificato';
  };

  // Raggruppa gli animali per categoria
  const groupAnimalsByCategory = () => {
    const grouped = {};
    
    animals.forEach(animal => {
      const category = animal.category || 'OTHER';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(animal);
    });

    return grouped;
  };

  // Ottieni informazioni sulla categoria
  const getCategoryInfo = (category) => {
    const icons = {
      'MAMMAL': 'bi-heart-fill',
      'BIRD': 'bi-twitter',
      'REPTILE': 'bi-bug',
      'FISH': 'bi-droplet-fill',
      'AMPHIBIAN': 'bi-water',
      'OTHER': 'bi-question-circle'
    };

    const colors = {
      'MAMMAL': 'mammal',
      'BIRD': 'bird',
      'REPTILE': 'reptile',
      'FISH': 'fish',
      'AMPHIBIAN': 'amphibian',
      'OTHER': 'other'
    };

    return {
      label: AnimalCategoryLabels[category] || 'Altro',
      icon: icons[category] || icons['OTHER'],
      colorClass: colors[category] || colors['OTHER']
    };
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
                Sei sicuro di voler eliminare l'animale <strong>{deleteConfirm.name}</strong>?
              </p>
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
      <div className="animals-container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Caricamento...</span>
            </div>
            <h5 className="text-muted">Caricamento animali...</h5>
          </div>
        </div>
      </div>
    );
  }

  const groupedAnimals = groupAnimalsByCategory();
  const categories = Object.keys(groupedAnimals);

  return (
    <div className="animals-container">
      {/* Header con titolo e pulsante aggiungi */}
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">Gestione Animali</h1>
            <p className="page-subtitle">
              {animals.length} {animals.length === 1 ? 'animale registrato' : 'animali registrati'} in {categories.length} {categories.length === 1 ? 'categoria' : 'categorie'}
            </p>
          </div>
          {canEdit && onAddAnimal && (
            <button 
              className="btn btn-primary btn-add"
              onClick={onAddAnimal}
            >
              <i className="bi bi-plus me-2"></i>
              Aggiungi Animale
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
            onClick={loadAnimals}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Riprova
          </button>
        </div>
      )}

      {/* Contenuto principale */}
      {animals.length === 0 ? (
        // Stato vuoto
        <div className="empty-state">
          <div className="empty-state-icon">
            <i className="bi bi-clipboard-data"></i>
          </div>
          <h3 className="empty-state-title">Nessun animale trovato</h3>
          <p className="empty-state-description">
            {canEdit 
              ? 'Inizia aggiungendo il primo animale al sistema.'
              : 'Non ci sono animali registrati nel sistema.'}
          </p>
          {canEdit && onAddAnimal && (
            <button 
              className="btn btn-primary"
              onClick={onAddAnimal}
            >
              <i className="bi bi-plus me-2"></i>
              Aggiungi Primo Animale
            </button>
          )}
        </div>
      ) : (
        // Card per categoria
        <div className="categories-container">
          {categories.map(category => {
            const categoryInfo = getCategoryInfo(category);
            const categoryAnimals = groupedAnimals[category];
            
            return (
              <div key={category} className={`category-card ${categoryInfo.colorClass}`}>
                <div className="category-header">
                  <div className="category-title">
                    <i className={`bi ${categoryInfo.icon} category-icon`}></i>
                    <h3 className="category-name">{categoryInfo.label}</h3>
                  </div>
                  <div className="category-count">
                    <span className="count-badge">
                      {categoryAnimals.length} {categoryAnimals.length === 1 ? 'animale' : 'animali'}
                    </span>
                  </div>
                </div>
                
                <div className="category-content">
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nome</th>
                          <th>Peso</th>
                          <th>Recinto</th>
                          <th>Responsabile</th>
                          {canEdit && <th className="text-center">Azioni</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {categoryAnimals.map((animal) => (
                          <tr key={animal.id}>
                            <td>
                              <span className="badge-id">#{animal.id}</span>
                            </td>
                            <td>
                              <strong className="animal-name">{animal.name}</strong>
                            </td>
                            <td>
                              <span className="weight-info">{formatWeight(animal.weight)}</span>
                            </td>
                            <td>
                              {animal.enclosure ? (
                                <span className="badge-enclosure">Recinto #{animal.enclosure}</span>
                              ) : (
                                <span className="text-muted">Non assegnato</span>
                              )}
                            </td>
                            <td>
                              {animal.user ? (
                                <span className="badge-user">Utente #{animal.user}</span>
                              ) : (
                                <span className="text-muted">Non assegnato</span>
                              )}
                            </td>
                            {canEdit && (
                              <td className="text-center">
                                <div className="action-buttons">
                                  {onEditAnimal && (
                                    <button
                                      className="btn-action btn-edit"
                                      onClick={() => onEditAnimal(animal)}
                                      title="Modifica animale"
                                    >
                                      <i className="bi bi-pencil"></i>
                                    </button>
                                  )}
                                  {canDelete && (
                                    <button
                                      className="btn-action btn-delete"
                                      onClick={() => setDeleteConfirm(animal)}
                                      title="Elimina animale"
                                    >
                                      <i className="bi bi-trash"></i>
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal di conferma eliminazione */}
      <DeleteConfirmModal />

     <style>
{`
.animals-container {
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

.categories-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.category-card {
  background: white;
  border-radius: 16px;
  border: 2px solid rgba(46, 125, 50, 0.1);
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(46, 125, 50, 0.15);
  border-color: #81c784;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 2px solid #e8f5e9;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
}

.category-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.category-name {
  color: #2e7d32;
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}

.count-badge {
  background: #e8f5e9;
  color: #2e7d32;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid #81c784;
}

.category-content {
  padding: 0;
}

.table-responsive {
  border-radius: 0;
  box-shadow: none;
  background: transparent;
}

.table {
  margin: 0;
  background: transparent;
  width: 100%;
  border-collapse: collapse;
}

.table thead th {
  background-color: #f9fafb;
  border-bottom: 2px solid #e8f5e9;
  color: #2e7d32;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 18px 24px;
  text-align: left;
}

.table tbody td {
  padding: 18px 24px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.table tbody tr {
  transition: all 0.2s ease;
}

.table tbody tr:hover {
  background-color: #f9fafb;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.badge-id {
  background: #e8f5e9;
  color: #2e7d32;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #81c784;
}

.animal-name {
  color: #2e7d32;
  font-size: 16px;
  font-weight: 600;
}

.weight-info {
  color: #546e7a;
  font-size: 14px;
  font-weight: 500;
}

.badge-enclosure {
  background: #e3f2fd;
  color: #1565c0;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #64b5f6;
}

.badge-user {
  background: #fce4ec;
  color: #c2185b;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #f48fb1;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
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

/* Colori per categorie - Tema Zoo */
.mammal .category-icon {
  background: linear-gradient(135deg, #8d6e63, #6d4c41);
}

.bird .category-icon {
  background: linear-gradient(135deg, #42a5f5, #1e88e5);
}

.reptile .category-icon {
  background: linear-gradient(135deg, #66bb6a, #43a047);
}

.fish .category-icon {
  background: linear-gradient(135deg, #29b6f6, #0288d1);
}

.amphibian .category-icon {
  background: linear-gradient(135deg, #26a69a, #00897b);
}

.other .category-icon {
  background: linear-gradient(135deg, #78909c, #546e7a);
}

/* Modal */
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
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #2e7d32;
}

.modal-body {
  padding: 32px;
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
  gap: 12px;
  justify-content: flex-end;
}

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

/* Alert */
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

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.spinner-border {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
}

.spinner-border-sm {
  width: 14px;
  height: 14px;
}

@keyframes spinner-border {
  to { transform: rotate(360deg); }
}

.text-muted {
  color: #78909c;
}

.text-center {
  text-align: center;
}

.text-primary {
  color: #2e7d32;
}

.ms-auto {
  margin-left: auto;
}

.me-1 {
  margin-right: 4px;
}

.me-2 {
  margin-right: 8px;
}

.mb-3 {
  margin-bottom: 16px;
}

.d-flex {
  display: flex;
}

.justify-content-between {
  justify-content: space-between;
}

.justify-content-center {
  justify-content: center;
}

.align-items-center {
  align-items: center;
}

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
  .animals-container {
    padding: 20px;
  }

  .page-title {
    font-size: 28px;
  }

  .page-header .d-flex {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .category-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    text-align: center;
  }

  .category-title {
    justify-content: center;
  }

  .table thead th,
  .table tbody td {
    padding: 14px 18px;
  }

  .table {
    font-size: 14px;
  }

  .category-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .category-name {
    font-size: 20px;
  }

  .empty-state {
    padding: 60px 24px;
  }
}

@media (max-width: 480px) {
  .animals-container {
    padding: 15px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 14px;
  }

  .table thead th,
  .table tbody td {
    padding: 12px 14px;
    font-size: 13px;
  }

  .btn-add {
    padding: 10px 18px;
    font-size: 14px;
  }

  .modal-dialog {
    margin: 10px;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 20px;
  }

  .category-header {
    padding: 20px;
  }
}
`}
</style>
    </div>
  );
};

export default AnimalList;