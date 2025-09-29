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

  const handleCompleteTicket = async (ticketId) => {
  if (!isOperator) return;

  try {
    await ticketService.completeTicket(ticketId);
    await loadTickets();
    alert('Ticket concluso con successo!');
  } catch (error) {
    console.error('Errore nella conclusione del ticket:', error);
    alert('Errore: ' + error.message);
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
            <h1>Zoo Tropolis</h1>
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
/* ===== ZOO DASHBOARD - TEMA NATURALE ===== */

* {
  box-sizing: border-box;
}

.main-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 50%, #fff3e0 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* ===== HEADER ===== */
.dashboard-header {
  background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
  box-shadow: 0 4px 20px rgba(46, 125, 50, 0.3);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo::before {
  content: '🐾';
  font-size: 36px;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.logo h1 {
  margin: 0;
  color: white;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.welcome {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.welcome strong {
  font-weight: 600;
  font-size: 16px;
}

.role-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.role-admin {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
}

.role-manager {
  background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%);
  color: white;
}

.role-operator {
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
  color: white;
}

.btn-logout {
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

/* ===== NAVIGATION ===== */
.dashboard-nav {
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 88px;
  z-index: 90;
}

.nav-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px;
  display: flex;
  gap: 5px;
}

.nav-item {
  background: none;
  border: none;
  padding: 18px 24px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: #546e7a;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
}

.nav-item:hover {
  color: #2e7d32;
  background: rgba(46, 125, 50, 0.05);
}

.nav-item.active {
  color: #2e7d32;
  border-bottom-color: #2e7d32;
  background: rgba(46, 125, 50, 0.08);
  font-weight: 600;
}

/* ===== MAIN CONTENT ===== */
.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px;
  min-height: calc(100vh - 140px);
}

.dashboard-overview {
  padding: 0;
}

.dashboard-overview h2 {
  color: #2e7d32;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 10px;
  text-align: center;
}

/* ===== TICKETS SECTION ===== */
.tickets-section {
  background: white;
  border-radius: 16px;
  padding: 35px;
  margin-bottom: 30px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.08);
  border: 2px solid rgba(46, 125, 50, 0.1);
}

.tickets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e8f5e9;
}

.tickets-header h3 {
  color: #2e7d32;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.header-buttons {
  display: flex;
  gap: 12px;
}

/* ===== BUTTONS ===== */
.btn-create-ticket-modern,
.btn-create-first-ticket-modern {
  background: #2e7d32;
  color: white;
  border: 2px solid #2e7d32;
  padding: 12px 28px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2);
}

.btn-create-ticket-modern:hover,
.btn-create-first-ticket-modern:hover {
  background: #1b5e20;
  border-color: #1b5e20;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
}

.btn-create-first-ticket-modern {
  padding: 14px 32px;
  font-size: 16px;
  margin-top: 20px;
}

.btn-refresh {
  background: white;
  color: #546e7a;
  border: 2px solid #e0e0e0;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.btn-refresh:hover {
  background: #f5f5f5;
  border-color: #bdbdbd;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-refresh:disabled {
  background: #f5f5f5;
  color: #bdbdbd;
  border-color: #e0e0e0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-accept-ticket {
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 187, 106, 0.3);
}

.btn-accept-ticket:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 187, 106, 0.5);
  background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
}

.btn-edit-ticket {
  background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 167, 38, 0.3);
}

.btn-edit-ticket:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 167, 38, 0.5);
  background: linear-gradient(135deg, #fb8c00 0%, #ef6c00 100%);
}

.btn-complete-ticket {
  background: linear-gradient(135deg, #26a69a 0%, #00897b 100%);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(38, 166, 154, 0.3);
  margin-top: 8px;
}

.btn-complete-ticket:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(38, 166, 154, 0.5);
  background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
}

.btn-retry {
  background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(79, 195, 247, 0.3);
}

.btn-retry:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 195, 247, 0.5);
}

/* ===== TICKETS GRID ===== */
.tickets-group {
  margin-bottom: 40px;
}

.tickets-group h4 {
  color: #37474f;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e0f2f1;
}

.operator-note {
  font-size: 14px;
  color: #78909c;
  font-weight: 400;
  margin-left: 10px;
}

.tickets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

/* ===== TICKET CARD ===== */
.ticket-card {
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  border: 2px solid #e8f5e9;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.ticket-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(46, 125, 50, 0.15);
  border-color: #81c784;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  gap: 12px;
}

.ticket-title {
  font-size: 17px;
  font-weight: 600;
  color: #2e7d32;
  margin: 0;
  flex: 1;
  line-height: 1.4;
}

.urgency-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.urgency-alto {
  background: linear-gradient(135deg, #ef5350 0%, #e53935 100%);
  color: white;
}

.urgency-medio {
  background: linear-gradient(135deg, #ffca28 0%, #ffa000 100%);
  color: white;
}

.urgency-basso {
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
  color: white;
}

.ticket-description {
  color: #546e7a;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.6;
}

.ticket-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #78909c;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.recommended-role {
  background: #e0f2f1;
  color: #00695c;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
}

.ticket-assigned {
  margin-bottom: 16px;
}

.assigned-label {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  display: inline-block;
}

.ticket-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.assigned-to {
  color: #2e7d32;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  padding: 10px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 8px;
  border: 2px solid #81c784;
}

/* ===== LOADING & ERROR STATES ===== */
.loading-tickets {
  text-align: center;
  padding: 60px 20px;
  color: #78909c;
}

.loading-tickets p {
  margin-top: 20px;
  font-size: 16px;
  font-weight: 500;
}

.spinner {
  border: 4px solid #e8f5e9;
  border-top: 4px solid #2e7d32;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.tickets-error {
  text-align: center;
  padding: 30px;
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  color: #c62828;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 2px solid #ef9a9a;
}

.no-tickets {
  text-align: center;
  color: #78909c;
  padding: 60px 20px;
  background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
  border-radius: 12px;
  border: 3px dashed #bdbdbd;
}

.no-tickets .icon-inbox,
.no-tickets .icon-clipboard {
  font-size: 64px;
  display: block;
  margin-bottom: 20px;
  filter: grayscale(0.3);
}

.no-tickets p {
  margin: 10px 0 0 0;
  font-size: 16px;
  color: #90a4ae;
}

/* ===== DASHBOARD STATS ===== */
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-top: 30px;
}

.stat-card {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2e7d32 0%, #66bb6a 100%);
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 30px rgba(46, 125, 50, 0.2);
  border-color: #81c784;
}

.stat-number {
  font-size: 42px;
  font-weight: 700;
  color: #2e7d32;
  margin-bottom: 12px;
  line-height: 1;
}

.stat-label {
  color: #546e7a;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* ===== ACCESS DENIED ===== */
.access-denied {
  text-align: center;
  padding: 100px 20px;
  color: #d32f2f;
}

.access-denied h2 {
  font-size: 28px;
  margin-bottom: 12px;
  color: #d32f2f;
}

.access-denied p {
  font-size: 18px;
  color: #78909c;
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 1024px) {
  .dashboard-content {
    padding: 20px;
  }

  .tickets-section {
    padding: 25px;
  }

  .tickets-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
    padding: 15px 20px;
  }

  .logo h1 {
    font-size: 24px;
  }

  .user-info {
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-content {
    flex-wrap: wrap;
    justify-content: center;
    padding: 0 15px;
  }

  .nav-item {
    padding: 14px 18px;
    font-size: 14px;
  }

  .dashboard-content {
    padding: 15px;
  }

  .dashboard-overview h2 {
    font-size: 26px;
  }

  .tickets-section {
    padding: 20px;
  }

  .tickets-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .header-buttons {
    flex-direction: column;
  }

  .tickets-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-stats {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 25px;
  }

  .stat-number {
    font-size: 36px;
  }
}

@media (max-width: 480px) {
  .logo::before {
    font-size: 36px;
  }

  .logo h1 {
    font-size: 20px;
  }

  .role-badge {
    padding: 6px 12px;
    font-size: 11px;
  }

  .btn-logout {
    padding: 8px 16px;
    font-size: 13px;
  }

  .nav-item {
    padding: 12px 14px;
    font-size: 13px;
  }

  .ticket-card {
    padding: 20px;
  }

  .ticket-title {
    font-size: 16px;
  }
}
`}
</style>
      </div>
    
  );
};

export default MainDashboard;