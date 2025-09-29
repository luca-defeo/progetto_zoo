// src/components/users/UserList.js

import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import authService from '../../services/authService';
import { Role, OperatorType, RoleLabels, OperatorTypeLabels, RoleBadgeClasses } from '../../constants/enums';

const UserList = ({ onAddUser, onEditUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Permessi utente
  const isAdmin = authService.isAdmin();
  const isManager = authService.isManager();
  const canEdit = isAdmin; // Solo admin può modificare utenti
  const canDelete = isAdmin; // Solo admin può eliminare utenti

  // Carica gli utenti all'avvio
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Errore nel caricamento utenti:', err);
      setError(err.message || 'Errore nel caricamento degli utenti');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (!canDelete) return;
    
    try {
      setDeleting(true);
      await apiService.deleteUser(user.id);
      
      // Ricarica la lista
      await loadUsers();
      
      // Chiudi il modal di conferma
      setDeleteConfirm(null);
      
    } catch (err) {
      console.error('Errore nell\'eliminazione:', err);
      setError(err.message || 'Errore nell\'eliminazione dell\'utente');
    } finally {
      setDeleting(false);
    }
  };

  const getAnimalsCount = (animals) => {
    return animals ? animals.length : 0;
  };

  const getEnclosuresCount = (enclosures) => {
    return enclosures ? enclosures.length : 0;
  };

  // Raggruppa gli utenti per ruolo e tipo operatore
  const groupUsersByRole = () => {
    const grouped = {
      ADMIN: [],
      MANAGER: [],
      OPERATOR: {
        ZOOKEEPER: [],
        VETERINARIAN: [],
        SECURITY_GUARD: [],
        OTHER: []
      }
    };

    users.forEach(user => {
      if (user.role === 'OPERATOR') {
        const operatorType = user.operatorType || 'OTHER';
        grouped.OPERATOR[operatorType].push(user);
      } else {
        grouped[user.role] = grouped[user.role] || [];
        grouped[user.role].push(user);
      }
    });

    return grouped;
  };

  // Ottieni informazioni sul ruolo
  const getRoleInfo = (role, operatorType = null) => {
    const icons = {
      'ADMIN': 'bi-shield-check',
      'MANAGER': 'bi-person-badge',
      'ZOOKEEPER': 'bi-person-arms-up',
      'VETERINARIAN': 'bi-heart-pulse',
      'SECURITY_GUARD': 'bi-shield',
      'OTHER': 'bi-person'
    };

    const colors = {
      'ADMIN': 'admin',
      'MANAGER': 'manager',
      'ZOOKEEPER': 'zookeeper',
      'VETERINARIAN': 'veterinarian',
      'SECURITY_GUARD': 'security',
      'OTHER': 'other'
    };

    if (role === 'OPERATOR' && operatorType) {
      return {
        label: OperatorTypeLabels[operatorType] || 'Operatore Generico',
        icon: icons[operatorType] || icons['OTHER'],
        colorClass: colors[operatorType] || colors['OTHER']
      };
    }

    return {
      label: RoleLabels[role] || role,
      icon: icons[role] || icons['OTHER'],
      colorClass: colors[role] || colors['OTHER']
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
                Sei sicuro di voler eliminare l'utente <strong>{deleteConfirm.name} {deleteConfirm.lastName}</strong>?
              </p>
              {(getAnimalsCount(deleteConfirm.animals) > 0 || getEnclosuresCount(deleteConfirm.enclosures) > 0) && (
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Attenzione: questo utente ha assegnati:
                  {getAnimalsCount(deleteConfirm.animals) > 0 && <div>• {getAnimalsCount(deleteConfirm.animals)} animali</div>}
                  {getEnclosuresCount(deleteConfirm.enclosures) > 0 && <div>• {getEnclosuresCount(deleteConfirm.enclosures)} gabbie</div>}
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
      <div className="users-container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Caricamento...</span>
            </div>
            <h5 className="text-muted">Caricamento utenti...</h5>
          </div>
        </div>
      </div>
    );
  }

  const groupedUsers = groupUsersByRole();
  const totalUsers = users.length;
  const adminCount = groupedUsers.ADMIN.length;
  const managerCount = groupedUsers.MANAGER.length;
  const operatorCount = Object.values(groupedUsers.OPERATOR).reduce((total, arr) => total + arr.length, 0);

  return (
    <div className="users-container">
      {/* Header con titolo e pulsante aggiungi */}
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">Gestione Utenti</h1>
            <p className="page-subtitle">
              {totalUsers} {totalUsers === 1 ? 'utente registrato' : 'utenti registrati'}: {adminCount} Admin, {managerCount} Manager, {operatorCount} Operatori
            </p>
          </div>
          {canEdit && onAddUser && (
            <button 
              className="btn btn-primary btn-add"
              onClick={onAddUser}
            >
              <i className="bi bi-plus me-2"></i>
              Aggiungi Utente
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
            onClick={loadUsers}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Riprova
          </button>
        </div>
      )}

      {/* Contenuto principale */}
      {users.length === 0 ? (
        // Stato vuoto
        <div className="empty-state">
          <div className="empty-state-icon">
            <i className="bi bi-people"></i>
          </div>
          <h3 className="empty-state-title">Nessun utente trovato</h3>
          <p className="empty-state-description">
            {canEdit 
              ? 'Inizia aggiungendo il primo utente al sistema.'
              : 'Non ci sono utenti registrati nel sistema.'}
          </p>
          {canEdit && onAddUser && (
            <button 
              className="btn btn-primary"
              onClick={onAddUser}
            >
              <i className="bi bi-plus me-2"></i>
              Aggiungi Primo Utente
            </button>
          )}
        </div>
      ) : (
        <div className="roles-container">
          {/* Admin */}
          {groupedUsers.ADMIN.length > 0 && (
            <div className="role-card admin">
              <div className="role-header">
                <div className="role-title">
                  <i className="bi bi-shield-check role-icon"></i>
                  <h3 className="role-name">Amministratori</h3>
                </div>
                <div className="role-count">
                  <span className="count-badge">
                    {groupedUsers.ADMIN.length} {groupedUsers.ADMIN.length === 1 ? 'utente' : 'utenti'}
                  </span>
                </div>
              </div>
              <div className="role-content">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nome Completo</th>
                        <th>Username</th>
                        <th>Animali</th>
                        <th>Gabbie</th>
                        {canEdit && <th className="text-center">Azioni</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {groupedUsers.ADMIN.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <span className="badge-id">#{user.id}</span>
                          </td>
                          <td>
                            <strong className="user-name">{user.name} {user.lastName}</strong>
                          </td>
                          <td>
                            <code className="username-code">{user.username}</code>
                          </td>
                          <td>
                            {getAnimalsCount(user.animals) > 0 ? (
                              <span className="badge-animals">{getAnimalsCount(user.animals)}</span>
                            ) : (
                              <span className="text-muted">0</span>
                            )}
                          </td>
                          <td>
                            {getEnclosuresCount(user.enclosures) > 0 ? (
                              <span className="badge-enclosures">{getEnclosuresCount(user.enclosures)}</span>
                            ) : (
                              <span className="text-muted">0</span>
                            )}
                          </td>
                          {canEdit && (
                            <td className="text-center">
                              <div className="action-buttons">
                                {onEditUser && (
                                  <button
                                    className="btn-action btn-edit"
                                    onClick={() => onEditUser(user)}
                                    title="Modifica utente"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                )}
                                {canDelete && (
                                  <button
                                    className="btn-action btn-delete"
                                    onClick={() => setDeleteConfirm(user)}
                                    title="Elimina utente"
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
          )}

          {/* Manager */}
          {groupedUsers.MANAGER.length > 0 && (
            <div className="role-card manager">
              <div className="role-header">
                <div className="role-title">
                  <i className="bi bi-person-badge role-icon"></i>
                  <h3 className="role-name">Manager</h3>
                </div>
                <div className="role-count">
                  <span className="count-badge">
                    {groupedUsers.MANAGER.length} {groupedUsers.MANAGER.length === 1 ? 'utente' : 'utenti'}
                  </span>
                </div>
              </div>
              <div className="role-content">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nome Completo</th>
                        <th>Username</th>
                        <th>Animali</th>
                        <th>Gabbie</th>
                        {canEdit && <th className="text-center">Azioni</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {groupedUsers.MANAGER.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <span className="badge-id">#{user.id}</span>
                          </td>
                          <td>
                            <strong className="user-name">{user.name} {user.lastName}</strong>
                          </td>
                          <td>
                            <code className="username-code">{user.username}</code>
                          </td>
                          <td>
                            {getAnimalsCount(user.animals) > 0 ? (
                              <span className="badge-animals">{getAnimalsCount(user.animals)}</span>
                            ) : (
                              <span className="text-muted">0</span>
                            )}
                          </td>
                          <td>
                            {getEnclosuresCount(user.enclosures) > 0 ? (
                              <span className="badge-enclosures">{getEnclosuresCount(user.enclosures)}</span>
                            ) : (
                              <span className="text-muted">0</span>
                            )}
                          </td>
                          {canEdit && (
                            <td className="text-center">
                              <div className="action-buttons">
                                {onEditUser && (
                                  <button
                                    className="btn-action btn-edit"
                                    onClick={() => onEditUser(user)}
                                    title="Modifica utente"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                )}
                                {canDelete && (
                                  <button
                                    className="btn-action btn-delete"
                                    onClick={() => setDeleteConfirm(user)}
                                    title="Elimina utente"
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
          )}

          {/* Operatori - Suddivisi per tipo */}
          {Object.entries(groupedUsers.OPERATOR).map(([operatorType, operatorUsers]) => {
            if (operatorUsers.length === 0) return null;
            
            const roleInfo = getRoleInfo('OPERATOR', operatorType);
            
            return (
              <div key={operatorType} className={`role-card ${roleInfo.colorClass}`}>
                <div className="role-header">
                  <div className="role-title">
                    <i className={`bi ${roleInfo.icon} role-icon`}></i>
                    <h3 className="role-name">{roleInfo.label}</h3>
                  </div>
                  <div className="role-count">
                    <span className="count-badge">
                      {operatorUsers.length} {operatorUsers.length === 1 ? 'operatore' : 'operatori'}
                    </span>
                  </div>
                </div>
                <div className="role-content">
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nome Completo</th>
                          <th>Username</th>
                          <th>Animali</th>
                          <th>Gabbie</th>
                          {canEdit && <th className="text-center">Azioni</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {operatorUsers.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <span className="badge-id">#{user.id}</span>
                            </td>
                            <td>
                              <strong className="user-name">{user.name} {user.lastName}</strong>
                            </td>
                            <td>
                              <code className="username-code">{user.username}</code>
                            </td>
                            <td>
                              {getAnimalsCount(user.animals) > 0 ? (
                                <span className="badge-animals">{getAnimalsCount(user.animals)}</span>
                              ) : (
                                <span className="text-muted">0</span>
                              )}
                            </td>
                            <td>
                              {getEnclosuresCount(user.enclosures) > 0 ? (
                                <span className="badge-enclosures">{getEnclosuresCount(user.enclosures)}</span>
                              ) : (
                                <span className="text-muted">0</span>
                              )}
                            </td>
                            {canEdit && (
                              <td className="text-center">
                                <div className="action-buttons">
                                  {onEditUser && (
                                    <button
                                      className="btn-action btn-edit"
                                      onClick={() => onEditUser(user)}
                                      title="Modifica utente"
                                    >
                                      <i className="bi bi-pencil"></i>
                                    </button>
                                  )}
                                  {canDelete && (
                                    <button
                                      className="btn-action btn-delete"
                                      onClick={() => setDeleteConfirm(user)}
                                      title="Elimina utente"
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
        .users-container {
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

        .roles-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .role-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .role-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .role-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #f3f4f6;
        }

        .role-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .role-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: white;
        }

        .role-name {
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

        .role-content {
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

        .user-name {
          color: #1f2937;
          font-size: 16px;
          font-weight: 600;
        }

        .username-code {
          background-color: #f3f4f6;
          color: #059669;
          font-size: 13px;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-weight: 600;
        }

        .badge-animals {
          background-color: #dcfce7;
          color: #16a34a;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .badge-enclosures {
          background-color: #e0f2fe;
          color: #0369a1;
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

        /* Colori per ruoli */
        .admin .role-icon {
          background: linear-gradient(135deg, #dc2626, #ef4444);
        }

        .manager .role-icon {
          background: linear-gradient(135deg, #d97706, #f59e0b);
        }

        .zookeeper .role-icon {
          background: linear-gradient(135deg, #059669, #10b981);
        }

        .veterinarian .role-icon {
          background: linear-gradient(135deg, #0ea5e9, #38bdf8);
        }

        .security .role-icon {
          background: linear-gradient(135deg, #7c3aed, #a855f7);
        }

        .other .role-icon {
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

        .alert-warning {
          background-color: #fffbeb;
          border-color: #fed7aa;
          color: #d97706;
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


export default UserList;