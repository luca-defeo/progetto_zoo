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

        .categories-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .category-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .category-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #f3f4f6;
        }

        .category-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .category-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: white;
        }

        .category-name {
          color: #1f2937;
          font-size: 22px;
          font-weight: 700;
          margin: 0;
        }

        .count-badge {
          background-color: #f3f4f6;
          color: #4b5563;
          font-size: 14px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
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
        }

        .table thead th {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          color: #374151;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 16px 20px;
        }

        .table tbody td {
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }

        .table tbody tr:hover {
          background-color: #f9fafb;
        }

        .table tbody tr:last-child td {
          border-bottom: none;
        }

        .badge-id {
          background-color: #f3f4f6;
          color: #4b5563;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
        }

        .animal-name {
          color: #1f2937;
          font-size: 16px;
          font-weight: 600;
        }

        .weight-info {
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }

        .badge-enclosure {
          background-color: #e0f2fe;
          color: #0369a1;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .badge-user {
          background-color: #f3e8ff;
          color: #7c3aed;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .btn-action {
          width: 32px;
          height: 32px;
          border-radius: 6px;
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

        /* Colori per categorie */
        .mammal .category-icon {
          background: linear-gradient(135deg, #dc2626, #ef4444);
        }

        .bird .category-icon {
          background: linear-gradient(135deg, #0ea5e9, #38bdf8);
        }

        .reptile .category-icon {
          background: linear-gradient(135deg, #059669, #10b981);
        }

        .fish .category-icon {
          background: linear-gradient(135deg, #d97706, #f59e0b);
        }

        .amphibian .category-icon {
          background: linear-gradient(135deg, #7c3aed, #a855f7);
        }

        .other .category-icon {
          background: linear-gradient(135deg, #6b7280, #9ca3af);
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
        }

        .modal-title {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
        }

        .modal-body {
          padding: 32px;
        }

        .modal-footer {
          padding: 20px 32px;
          border-top: 1px solid #e5e7eb;
          background-color: #f9fafb;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

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

        @media (max-width: 768px) {
          .animals-container {
            padding: 16px;
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

          .table thead th,
          .table tbody td {
            padding: 12px 16px;
          }

          .table {
            font-size: 14px;
          }
        }
        `}
      </style>
    </div>
  );
};

export default AnimalList;