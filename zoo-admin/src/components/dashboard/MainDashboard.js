// MainDashboard.js
import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import ticketService from '../../services/ticketService';
import AnimalList from '../animals/AnimalList';
import AnimalForm from '../animals/AnimalForm';
import EnclosureList from '../enclosures/EnclosureList';
import EnclosureForm from '../enclosures/EnclosureForm';
import UserList from '../users/UserList';
import UserForm from '../users/UserForm';
import TicketForm from '../tickets/TicketForm';

const MainDashboard = ({ currentUser, onLogout }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [showAnimalForm, setShowAnimalForm] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [showEnclosureForm, setShowEnclosureForm] = useState(false);
  const [selectedEnclosure, setSelectedEnclosure] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [tickets, setTickets] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const userRole = currentUser?.role?.toUpperCase?.() || currentUser?.role || '';
  const isAdmin = userRole === 'ADMIN';
  const isManager = userRole === 'MANAGER';  
  const isOperator = userRole === 'OPERATOR';

  const canViewUsers = isAdmin || isManager;
  const canManageUsers = isAdmin;
  const canEditAnimals = isAdmin || isManager;
  const canAddAnimals = isAdmin;
  const canEditEnclosures = isAdmin || isManager;
  const canAddEnclosures = isAdmin;

  useEffect(() => {
    if (activeView === 'dashboard') {
      loadTickets();
    }
  }, [activeView]);

  const loadTickets = async () => {
    setTicketsLoading(true);
    setTicketsError(null);

    try {
      if (isAdmin || isManager) {
        const allTickets = await ticketService.getAllTickets();
        setTickets(allTickets || []);
      } else if (isOperator) {
        const dashboardTickets = await ticketService.getDashboardTickets();
        const operatorTickets = await ticketService.getMyTickets();
        setTickets(dashboardTickets || []);
        setMyTickets(operatorTickets || []);
      }
    } catch (error) {
      console.error('Errore nel caricamento ticket:', error);
      setTicketsError(error.message);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleAcceptTicket = async (ticketId) => {
    if (!isOperator) return;

    try {
      await ticketService.acceptTicket(ticketId);
      await loadTickets();
      alert('Ticket accettato con successo!');
    } catch (error) {
      console.error('Errore nell\'accettazione del ticket:', error);
      alert('Errore: ' + error.message);
    }
  };

  // NUOVO: Handler per concludere ticket
  const handleCompleteTicket = async (ticketId) => {
    if (!isOperator) return;

    if (window.confirm('Sei sicuro di voler concludere questo ticket? Verrà eliminato definitivamente.')) {
      try {
        await ticketService.completeTicket(ticketId);
        await loadTickets();
        alert('✅ Ticket concluso con successo!');
      } catch (error) {
        console.error('Errore nella conclusione del ticket:', error);
        alert('Errore: ' + error.message);
      }
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  const handleAddAnimal = () => {
    if (!canAddAnimals) return;
    setSelectedAnimal(null);
    setShowAnimalForm(true);
  };

  const handleEditAnimal = (animal) => {
    if (!canEditAnimals) return;
    setSelectedAnimal(animal);
    setShowAnimalForm(true);
  };

  const handleAnimalSaved = () => {
    setShowAnimalForm(false);
    setSelectedAnimal(null);
  };

  const handleAddEnclosure = () => {
    if (!canAddEnclosures) return;
    setSelectedEnclosure(null);
    setShowEnclosureForm(true);
  };

  const handleEditEnclosure = (enclosure) => {
    if (!canEditEnclosures) return;
    setSelectedEnclosure(enclosure);
    setShowEnclosureForm(true);
  };

  const handleEnclosureSaved = () => {
    setShowEnclosureForm(false);
    setSelectedEnclosure(null);
  };

  const handleAddUser = () => {
    if (!isAdmin) return;
    setSelectedUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user) => {
    if (!isAdmin) return;
    setSelectedUser(user);
    setShowUserForm(true);
  };

  const handleUserSaved = () => {
    setShowUserForm(false);
    setSelectedUser(null);
  };

  const handleAddTicket = () => {
    if (!(isAdmin || isManager)) return;
    setSelectedTicket(null);
    setShowTicketForm(true);
  };

  const handleEditTicket = (ticket) => {
    if (!(isAdmin || isManager)) return;
    setSelectedTicket(ticket);
    setShowTicketForm(true);
  };

  const handleTicketSaved = (savedTicket) => {
    setShowTicketForm(false);
    setSelectedTicket(null);
    loadTickets();
    
    if (savedTicket) {
      const action = selectedTicket ? 'aggiornato' : 'creato';
      alert(`✅ Ticket ${action} con successo!`);
    }
  };

  const handleTicketCancel = () => {
    setShowTicketForm(false);
    setSelectedTicket(null);
  };

  // Componente TicketCard AGGIORNATO con pulsante Concluso
  const TicketCard = ({ ticket, showAcceptButton = false, isMyTicket = false, showAllDetails = false, onEdit = null, canEdit = false }) => (
    <div className="ticket-card">
      <div className="ticket-header">
        <h4 className="ticket-title">{ticket.title}</h4>
        <span className={`urgency-badge urgency-${ticket.ticketUrgency?.toLowerCase()}`}>
          {ticket.ticketUrgency}
        </span>
      </div>
      
      <p className="ticket-description">{ticket.description}</p>
      
      <div className="ticket-meta">
        <span className="ticket-date">
          Creato: {ticketService.formatDate ? ticketService.formatDate(ticket.creationDate) : new Date(ticket.creationDate).toLocaleDateString()}
        </span>
        {ticket.recommendedRole && (
          <span className="recommended-role">
            Per: {ticket.recommendedRole}
          </span>
        )}
      </div>

      {showAllDetails && ticket.user && (
        <div className="ticket-assigned">
          <span className="assigned-label">Assegnato a: {ticket.user.username}</span>
        </div>
      )}

      <div className="ticket-actions">
        {showAcceptButton && isOperator && (
          <button 
            className="btn-accept-ticket"
            onClick={() => handleAcceptTicket(ticket.id)}
          >
            ✓ Accetta Ticket
          </button>
        )}

        {canEdit && onEdit && (
          <button 
            className="btn-edit-ticket"
            onClick={() => onEdit(ticket)}
          >
            ✏️ Modifica
          </button>
        )}

        {isMyTicket && (
          <>
            <div className="assigned-to">
              Assegnato a te
            </div>
            <button 
              className="btn-complete-ticket"
              onClick={() => handleCompleteTicket(ticket.id)}
            >
              ✅ Concluso
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderAdminManagerDashboard = () => (
    <div className="dashboard-overview">
      <h2>Dashboard Amministrativa - Tutti i Ticket</h2>
      
      <div className="tickets-section">
        <div className="tickets-header">
          <h3>Gestione Completa Ticket</h3>
          <div className="header-buttons">
            <button className="btn-create-ticket-modern" onClick={handleAddTicket}>
              <span className="btn-icon">📝</span>
              <span className="btn-text">Crea Nuovo Ticket</span>
            </button>
            <button 
              className="btn-refresh" 
              onClick={loadTickets}
              disabled={ticketsLoading}
            >
              {ticketsLoading ? '⏳ Caricamento...' : '🔄 Aggiorna'}
            </button>
          </div>
        </div>
        
        {ticketsLoading ? (
          <div className="loading-tickets">
            <div className="spinner"></div>
            <p>Caricamento ticket...</p>
          </div>
        ) : ticketsError ? (
          <div className="tickets-error">
            <p>Errore nel caricamento ticket: {ticketsError}</p>
            <button onClick={loadTickets} className="btn-retry">Riprova</button>
          </div>
        ) : (
          <div className="tickets-group">
            <h4>Tutti i Ticket nel Sistema ({tickets.length})</h4>
            {tickets.length === 0 ? (
              <div className="no-tickets">
                <i className="icon-inbox">📊</i>
                <p>Nessun ticket nel sistema</p>
                <button 
                  className="btn-create-first-ticket-modern"
                  onClick={handleAddTicket}
                >
                  📝 Crea il primo ticket
                </button>
              </div>
            ) : (
              <div className="tickets-grid">
                {tickets.map(ticket => (
                  <TicketCard 
                    key={ticket.id} 
                    ticket={ticket} 
                    showAllDetails={true}
                    onEdit={handleEditTicket}
                    canEdit={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{tickets.length}</div>
          <div className="stat-label">Totale Ticket</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{tickets.filter(t => !t.user).length}</div>
          <div className="stat-label">Non Assegnati</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{tickets.filter(t => t.user).length}</div>
          <div className="stat-label">Assegnati</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{currentUser?.role}</div>
          <div className="stat-label">Il Tuo Ruolo</div>
        </div>
      </div>
    </div>
  );

  const renderOperatorDashboard = () => (
    <div className="dashboard-overview">
      <h2>Dashboard Operatore - Gestione Ticket</h2>
      
      <div className="tickets-section">
        <div className="tickets-header">
          <h3>I Tuoi Ticket</h3>
          <button 
            className="btn-refresh" 
            onClick={loadTickets}
            disabled={ticketsLoading}
          >
            {ticketsLoading ? '⏳ Caricamento...' : '🔄 Aggiorna'}
          </button>
        </div>
        
        {ticketsLoading ? (
          <div className="loading-tickets">
            <div className="spinner"></div>
            <p>Caricamento ticket...</p>
          </div>
        ) : ticketsError ? (
          <div className="tickets-error">
            <p>Errore nel caricamento ticket: {ticketsError}</p>
            <button onClick={loadTickets} className="btn-retry">Riprova</button>
          </div>
        ) : (
          <>
            <div className="tickets-group">
              <h4>
                Ticket Disponibili ({tickets.length})
                <span className="operator-note"> - Clicca "Accetta" per prenderti carico del ticket</span>
              </h4>
              {tickets.length === 0 ? (
                <div className="no-tickets">
                  <i className="icon-inbox">📥</i>
                  <p>Nessun ticket disponibile al momento</p>
                </div>
              ) : (
                <div className="tickets-grid">
                  {tickets.map(ticket => (
                    <TicketCard 
                      key={ticket.id} 
                      ticket={ticket} 
                      showAcceptButton={true}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="tickets-group">
              <h4>I Miei Ticket Assegnati ({myTickets.length})</h4>
              {myTickets.length === 0 ? (
                <div className="no-tickets">
                  <i className="icon-clipboard">📋</i>
                  <p>Non hai ticket assegnati al momento</p>
                </div>
              ) : (
                <div className="tickets-grid">
                  {myTickets.map(ticket => (
                    <TicketCard 
                      key={ticket.id} 
                      ticket={ticket} 
                      isMyTicket={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{tickets.length}</div>
          <div className="stat-label">Ticket Disponibili</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{myTickets.length}</div>
          <div className="stat-label">I Miei Ticket</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{currentUser?.role}</div>
          <div className="stat-label">Il Tuo Ruolo</div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        if (isAdmin || isManager) {
          return renderAdminManagerDashboard();
        } else if (isOperator) {
          return renderOperatorDashboard();
        } else {
          return (
            <div className="dashboard-overview">
              <h2>Ruolo non riconosciuto: {currentUser?.role}</h2>
              <p>Contatta l'amministratore per risolvere il problema.</p>
            </div>
          );
        }
      
      case 'users':
        if (!canViewUsers) {
          return (
            <div className="access-denied">
              <h2>Accesso Negato</h2>
              <p>Solo amministratori e manager possono vedere gli utenti</p>
            </div>
          );
        }
        return (
          <UserList 
            onAddUser={canManageUsers ? handleAddUser : null}
            onEditUser={canManageUsers ? handleEditUser : null}
          />
        );
      
      case 'animals':
        return (
          <AnimalList 
            onAddAnimal={canAddAnimals ? handleAddAnimal : null}
            onEditAnimal={canEditAnimals ? handleEditAnimal : null}
          />
        );
      
      case 'enclosures':
        return (
          <EnclosureList 
            onAddEnclosure={canAddEnclosures ? handleAddEnclosure : null}
            onEditEnclosure={canEditEnclosures ? handleEditEnclosure : null}
          />
        );
      
      default:
        if (isAdmin || isManager) {
          return renderAdminManagerDashboard();
        } else if (isOperator) {
          return renderOperatorDashboard();
        } else {
          return (
            <div className="dashboard-overview">
              <h2>Benvenuto nel Zoo Manager</h2>
              <p>Ruolo utente: {currentUser?.role}</p>
            </div>
          );
        }
    }
  };

  const renderNavigation = () => (
    <nav className="dashboard-nav">
      <div className="nav-content">
        <button 
          className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveView('dashboard')}
        >
          Dashboard
        </button>

        {(isAdmin || isManager) && (
          <>
            <button 
              className={`nav-item ${activeView === 'users' ? 'active' : ''}`}
              onClick={() => setActiveView('users')}
            >
              Utenti
            </button>
            <button 
              className={`nav-item ${activeView === 'animals' ? 'active' : ''}`}
              onClick={() => setActiveView('animals')}
            >
              Animali
            </button>
            <button 
              className={`nav-item ${activeView === 'enclosures' ? 'active' : ''}`}
              onClick={() => setActiveView('enclosures')}
            >
              Gabbie
            </button>
          </>
        )}

        {isOperator && (
          <>
            <button 
              className={`nav-item ${activeView === 'animals' ? 'active' : ''}`}
              onClick={() => setActiveView('animals')}
            >
              Animali
            </button>
            <button 
              className={`nav-item ${activeView === 'enclosures' ? 'active' : ''}`}
              onClick={() => setActiveView('enclosures')}
            >
              Gabbie
            </button>
          </>
        )}
      </div>
    </nav>
  );

  return (
    <div className="main-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">
            <h1>Zoo Management System</h1>
          </div>
          <div className="user-info">
            <span className="welcome">
              Benvenuto, <strong>{currentUser?.firstName || currentUser?.name} {currentUser?.lastName}</strong>
            </span>
            <span className={`role-badge role-${currentUser?.role?.toLowerCase()}`}>
              {currentUser?.role}
            </span>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {renderNavigation()}

      {showTicketForm && (
        <TicketForm
          ticket={selectedTicket}
          onSave={handleTicketSaved}
          onCancel={handleTicketCancel}
        />
      )}

      <main className="dashboard-content">
        {renderContent()}
      </main>

      {showAnimalForm && (
        <AnimalForm
          animal={selectedAnimal}
          onSave={handleAnimalSaved}
          onCancel={() => setShowAnimalForm(false)}
        />
      )}

      {showEnclosureForm && (
        <EnclosureForm
          enclosure={selectedEnclosure}
          onSave={handleEnclosureSaved}
          onCancel={() => setShowEnclosureForm(false)}
        />
      )}

      {showUserForm && (
        <UserForm
          user={selectedUser}
          onSave={handleUserSaved}
          onCancel={() => setShowUserForm(false)}
        />
      )}

      <style>
        {`
        .main-dashboard {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .dashboard-header {
          background: linear-gradient(135deg, #2c3e50, #34495e);
          color: white;
          padding: 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 15px 20px;
        }

        .logo h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .welcome {
          font-size: 14px;
        }

        .role-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .role-admin {
          background: #e74c3c;
          color: white;
        }

        .role-manager {
          background: #f39c12;
          color: white;
        }

        .role-operator {
          background: #27ae60;
          color: white;
        }

        .btn-logout {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background-color 0.3s;
        }

        .btn-logout:hover {
          background: #c0392b;
        }

        .dashboard-nav {
          background: white;
          border-bottom: 1px solid #e0e0e0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .nav-content {
          display: flex;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .nav-item {
          background: none;
          border: none;
          padding: 15px 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #7f8c8d;
          transition: all 0.3s ease;
          border-bottom: 3px solid transparent;
        }

        .nav-item:hover {
          color: #2c3e50;
          background: #f8f9fa;
        }

        .nav-item.active {
          color: #3498db;
          border-bottom-color: #3498db;
          background: #f8f9fa;
        }

        .dashboard-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          min-height: calc(100vh - 140px);
        }

        .dashboard-overview {
          padding: 20px 0;
        }

        .dashboard-overview h2 {
          color: #2c3e50;
          margin-bottom: 30px;
          font-size: 28px;
          text-align: center;
        }

        .tickets-section {
          background: white;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .tickets-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .header-buttons {
          display: flex;
          gap: 10px;
        }

        /* NUOVO STILE MODERNO PER CREA TICKET */
       .btn-create-ticket-modern {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-create-ticket-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

.btn-create-ticket-modern:active {
  transform: translateY(0);
}

/* Pulsante Crea Primo Ticket */
.btn-create-first-ticket-modern {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  margin-top: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-create-first-ticket-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

/* Pulsante Aggiorna - Blu Chiaro */
.btn-refresh {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.btn-refresh:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
  background: linear-gradient(135deg, #2980b9 0%, #21618c 100%);
}

.btn-refresh:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Pulsante Accetta Ticket - Verde */
.btn-accept-ticket {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(46, 204, 113, 0.3);
}

.btn-accept-ticket:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.4);
  background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
}

/* Pulsante Modifica - Arancione */
.btn-edit-ticket {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(243, 156, 18, 0.3);
}

.btn-edit-ticket:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(243, 156, 18, 0.4);
  background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
}

/* Pulsante Concluso - Verde Scuro */
.btn-complete-ticket {
  background: linear-gradient(135deg, #16a085 0%, #138d75 100%);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(22, 160, 133, 0.3);
  margin-top: 8px;
}

.btn-complete-ticket:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(22, 160, 133, 0.4);
  background: linear-gradient(135deg, #138d75 0%, #0e6655 100%);
}

.btn-complete-ticket:active {
  transform: translateY(0);
}

/* Pulsante Riprova */
.btn-retry {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
}
        .tickets-group {
          margin-bottom: 30px;
        }

        .tickets-group h4 {
          color: #34495e;
          margin-bottom: 15px;
          font-size: 18px;
          border-bottom: 2px solid #ecf0f1;
          padding-bottom: 10px;
        }

        .operator-note {
          font-size: 14px;
          color: #7f8c8d;
          font-weight: normal;
        }

        .tickets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .ticket-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.3s ease;
        }

        .ticket-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .ticket-title {
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
          margin: 0;
          flex: 1;
          margin-right: 10px;
        }

        .urgency-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .urgency-alto {
          background: #e74c3c;
          color: white;
        }

        .urgency-medio {
          background: #f39c12;
          color: white;
        }

        .urgency-basso {
          background: #27ae60;
          color: white;
        }

        .ticket-description {
          color: #7f8c8d;
          margin-bottom: 15px;
          font-size: 14px;
          line-height: 1.4;
        }

        .ticket-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: #95a5a6;
          margin-bottom: 15px;
        }

        .recommended-role {
          background: #ecf0f1;
          color: #2c3e50;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .ticket-assigned {
          margin-bottom: 15px;
        }

        .assigned-label {
          background: #d5f4e6;
          color: #27ae60;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .btn-accept-ticket {
          background: #27ae60;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s ease;
        }
        .btn-accept-ticket:hover {
          background: #229954;
        }

        .btn-edit-ticket {
          background: #f39c12;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .btn-edit-ticket:hover {
          background: #e67e22;
        }

        .ticket-actions {
          display: flex;
          gap: 8px;
          flex-direction: column;
        }

        .ticket-actions button {
          width: 100%;
        }

        .assigned-to {
          color: #27ae60;
          font-size: 12px;
          font-weight: 600;
          text-align: center;
          padding: 8px;
          background: #d5f4e6;
          border-radius: 4px;
        }

        .loading-tickets {
          text-align: center;
          padding: 40px;
          color: #7f8c8d;
        }

        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .tickets-error {
          text-align: center;
          padding: 20px;
          background: #f8d7da;
          color: #721c24;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .btn-retry {
          background: #3498db;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 10px;
        }

        .no-tickets {
          text-align: center;
          color: #7f8c8d;
          padding: 40px 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px dashed #dee2e6;
        }

        .no-tickets .icon-inbox,
        .no-tickets .icon-clipboard {
          font-size: 48px;
          display: block;
          margin-bottom: 15px;
        }

        .no-tickets p {
          margin: 0;
          font-size: 16px;
        }

        /* Statistiche dashboard */
        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .stat-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          text-align: center;
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-3px);
        }

        .stat-number {
          font-size: 32px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .stat-label {
          color: #7f8c8d;
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .access-denied {
          text-align: center;
          padding: 80px 20px;
          color: #e74c3c;
        }

        .access-denied h2 {
          font-size: 24px;
          margin-bottom: 10px;
        }

        .access-denied p {
          font-size: 16px;
          color: #7f8c8d;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .user-info {
            flex-wrap: wrap;
            justify-content: center;
          }

          .nav-content {
            flex-wrap: wrap;
            justify-content: center;
          }

          .nav-item {
            padding: 12px 16px;
            font-size: 13px;
          }

          .dashboard-content {
            padding: 15px;
          }

          .tickets-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-stats {
            grid-template-columns: 1fr;
          }

          .logo h1 {
            font-size: 20px;
          }

          .tickets-section {
            padding: 20px;
          }

          .tickets-header {
            flex-direction: column;
            gap: 10px;
            align-items: stretch;
          }
        }
        `}
        </style>
      </div>
    
  );
};

export default MainDashboard;