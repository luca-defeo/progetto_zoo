// TicketDashboardViews.js - PARTE 2
import React from 'react';
import ticketService from '../../services/ticketService';

const TicketDashboardViews = ({
  currentUser,
  tickets,
  myTickets,
  ticketsLoading,
  ticketsError,
  isAdmin,
  isManager,
  isOperator,
  onAddTicket,
  onEditTicket,
  onAcceptTicket,
  onRefreshTickets
}) => {

  // Componente per singolo ticket card
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
            onClick={() => onAcceptTicket(ticket.id)}
          >
            Accetta Ticket
          </button>
        )}

        {canEdit && onEdit && (
          <button 
            className="btn-edit-ticket"
            onClick={() => onEdit(ticket)}
          >
            Modifica
          </button>
        )}

        {isMyTicket && (
          <div className="assigned-to">
            Assegnato a te
          </div>
        )}
      </div>
    </div>
  );

  // Dashboard per ADMIN e MANAGER
  const renderAdminManagerDashboard = () => (
    <div className="dashboard-overview">
      <h2>Dashboard Amministrativa - Tutti i Ticket</h2>
      
      <div className="tickets-section">
        <div className="tickets-header">
          <h3>Gestione Completa Ticket</h3>
          <div className="header-buttons">
            <button 
              className="btn-create-ticket"
              onClick={onAddTicket}  // IMPORTANTE: onClick collegato!
            >
              Crea Nuovo Ticket
            </button>
            <button 
              className="btn-refresh" 
              onClick={onRefreshTickets}
              disabled={ticketsLoading}
            >
              {ticketsLoading ? 'Caricamento...' : 'Aggiorna'}
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
            <button onClick={onRefreshTickets} className="btn-retry">Riprova</button>
          </div>
        ) : (
          <div className="tickets-group">
            <h4>Tutti i Ticket nel Sistema ({tickets.length})</h4>
            {tickets.length === 0 ? (
              <div className="no-tickets">
                <i className="icon-inbox">📊</i>
                <p>Nessun ticket nel sistema</p>
                <button 
                  className="btn-create-first-ticket"
                  onClick={onAddTicket}  // IMPORTANTE: onClick collegato!
                >
                  Crea il primo ticket
                </button>
              </div>
            ) : (
              <div className="tickets-grid">
                {tickets.map(ticket => (
                  <TicketCard 
                    key={ticket.id} 
                    ticket={ticket} 
                    showAllDetails={true}
                    onEdit={onEditTicket}
                    canEdit={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Statistiche per Admin/Manager */}
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

  // Dashboard per OPERATORI
  const renderOperatorDashboard = () => (
    <div className="dashboard-overview">
      <h2>Dashboard Operatore - Gestione Ticket</h2>
      
      <div className="tickets-section">
        <div className="tickets-header">
          <h3>I Tuoi Ticket</h3>
          <button 
            className="btn-refresh" 
            onClick={onRefreshTickets}
            disabled={ticketsLoading}
          >
            {ticketsLoading ? 'Caricamento...' : 'Aggiorna'}
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
            <button onClick={onRefreshTickets} className="btn-retry">Riprova</button>
          </div>
        ) : (
          <>
            {/* Ticket disponibili da accettare */}
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

            {/* I miei ticket assegnati */}
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

      {/* Statistiche per Operatori */}
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

  // Determina quale dashboard renderizzare
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
};

export default TicketDashboardViews;