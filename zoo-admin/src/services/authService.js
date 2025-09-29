// src/services/authService.js

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticatedFlag = false;
    this.baseURL = 'http://localhost:8081/api';
    
    this.initializeFromStorage();
  }

  initializeFromStorage() {
    try {
      const savedUser = localStorage.getItem('currentUser');
      const savedCredentials = localStorage.getItem('userCredentials');
      
      if (savedUser && savedCredentials) {
        this.currentUser = JSON.parse(savedUser);
        this.isAuthenticatedFlag = true;
        console.log('Utente caricato dal localStorage:', this.currentUser.username, 'Ruolo:', this.currentUser.role);
        
        const credentials = JSON.parse(savedCredentials);
        if (!localStorage.getItem('authHeader')) {
          const authHeader = `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;
          localStorage.setItem('authHeader', authHeader);
          console.log('AuthHeader ricreato dal localStorage');
        }
      }
    } catch (error) {
      console.error('Errore nell\'inizializzazione:', error);
      this.logout();
    }
  }

  async login(username, password) {
    try {
      console.log('Tentativo login per:', username);
      
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) {
        console.error('Login failed:', response.status, response.statusText);
        throw new Error('Username o password non corretti');
      }
      
      const data = await response.json();
      console.log('Login response completa dal backend:', data);
      
      const userData = data.user || data;
      console.log('User data estratto:', userData);
      console.log('Role:', userData.role);
      console.log('OperatorType:', userData.operatorType);
      
      const authHeader = `Basic ${btoa(`${username}:${password}`)}`;
      
      this.currentUser = {
        id: userData.id,
        username: userData.username,
        firstName: userData.name || username,
        lastName: userData.lastName || '',
        role: userData.role,
        operatorType: userData.operatorType || null
      };
      
      this.isAuthenticatedFlag = true;
      
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      localStorage.setItem('userCredentials', JSON.stringify({
        username: username,
        password: password
      }));
      localStorage.setItem('authHeader', authHeader);
      
      console.log('Login completato!');
      console.log('Utente:', this.currentUser.username);
      console.log('Ruolo:', this.currentUser.role);
      console.log('OperatorType:', this.currentUser.operatorType);
      console.log('AuthHeader salvato');
      
      return { success: true, user: this.currentUser };
      
    } catch (error) {
      console.error('Errore durante il login:', error);
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      const authHeader = localStorage.getItem('authHeader');
      if (authHeader) {
        await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': authHeader
          }
        });
      }
    } catch (error) {
      console.error('Errore durante il logout:', error);
    } finally {
      this.currentUser = null;
      this.isAuthenticatedFlag = false;
      
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userCredentials');
      localStorage.removeItem('authHeader');
      
      console.log('Logout completato');
    }
    return { success: true };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.isAuthenticatedFlag && this.currentUser !== null;
  }

  isAdmin() {
    return this.currentUser?.role === 'ADMIN';
  }

  isManager() {
    return this.currentUser?.role === 'MANAGER';
  }

  isOperator() {
    return this.currentUser?.role === 'OPERATOR';
  }

  canEdit() {
    return this.isAdmin() || this.isManager();
  }

  canDelete() {
    return this.isAdmin();
  }

  canManageUsers() {
    return this.isAdmin() || this.isManager();
  }

  canCreateTickets() {
    return this.isAdmin() || this.isManager();
  }

  canAcceptTickets() {
    return this.isOperator();
  }

  updateCurrentUser(updatedUser) {
    this.currentUser = updatedUser;
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  }

  getAuthHeader() {
    return localStorage.getItem('authHeader') || '';
  }
}

const authService = new AuthService();
export default authService;