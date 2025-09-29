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

.text-muted {
  color: #78909c;
}

.text-center {
  text-align: center;
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
}
`}
</style>
    </div>
  );
};


export default UserList;