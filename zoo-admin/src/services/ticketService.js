// src/services/ticketService.js

class TicketService {
  constructor() {
    this.baseURL = 'http://localhost:8081/api/ticket';
  }

  getAuthHeaders() {
    const authHeader = localStorage.getItem('authHeader');
    const credentials = localStorage.getItem('userCredentials');
    
    if (!authHeader && !credentials) {
      throw new Error('Utente non autenticato - effettua nuovamente il login');
    }
    
    if (authHeader) {
      return {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      };
    }
    
    if (credentials) {
      const { username, password } = JSON.parse(credentials);
      const encodedCredentials = btoa(`${username}:${password}`);
      const basicAuth = `Basic ${encodedCredentials}`;
      localStorage.setItem('authHeader', basicAuth);
      
      return {
        'Content-Type': 'application/json',
        'Authorization': basicAuth
      };
    }
    
    throw new Error('Impossibile creare l\'autenticazione');
  }

  async makeRequest(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      method,
      headers: this.getAuthHeaders(),
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      const respText = await response.text();
      let parsed = null;
      try { parsed = respText ? JSON.parse(respText) : null; } catch (e) { parsed = respText; }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sessione scaduta. Effettua nuovamente il login.');
        } else if (response.status === 403) {
          throw new Error('Non hai i permessi per questa operazione.');
        } else if (response.status === 404) {
          throw new Error('Risorsa non trovata.');
        } else {
          throw new Error(`Errore del server: ${response.status}`);
        }
      }

      return parsed;

    } catch (error) {
      throw error;
    }
  }

  async getDashboardTickets() {
    return this.makeRequest('GET', '/dashboard');
  }

  async getMyTickets() {
    return this.makeRequest('GET', '/my-tickets');
  }

  async getAllTickets() {
    return this.makeRequest('GET', '/all');
  }

  async getTicket(id) {
    return this.makeRequest('GET', `/${id}`);
  }

  async createTicket(ticketData) {
    return this.makeRequest('POST', '/add', ticketData);
  }

  async acceptTicket(ticketId) {
    return this.makeRequest('POST', `/${ticketId}/accept`);
  }

  async updateTicket(ticketId, ticketData) {
    return this.makeRequest('PUT', `/${ticketId}`, ticketData);
  }

  async deleteTicket(ticketId) {
    return this.makeRequest('DELETE', `/${ticketId}`);
  }

  // NUOVO: Concludi un ticket (solo operatori sui propri ticket)
  async completeTicket(ticketId) {
    return this.makeRequest('POST', `/${ticketId}/complete`);
  }

  getUrgencyColor(urgency) {
    switch (urgency?.toUpperCase()) {
      case 'ALTO':
        return 'danger';
      case 'MEDIO':
        return 'warning';
      case 'BASSO':
        return 'success';
      default:
        return 'secondary';
    }
  }

  getUrgencyIcon(urgency) {
    switch (urgency?.toUpperCase()) {
      case 'ALTO':
        return 'bi-exclamation-triangle-fill';
      case 'MEDIO':
        return 'bi-exclamation-circle-fill';
      case 'BASSO':
        return 'bi-info-circle-fill';
      default:
        return 'bi-question-circle';
    }
  }

  formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatDateTime(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

const ticketService = new TicketService();
export default ticketService;