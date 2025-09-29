// src/services/apiService.js

import authService from './authService';

class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:8081/api';
  }

  // Crea l'header Authorization con Basic Auth
  getAuthHeaders() {
    // Recupera le credenziali salvate
    const credentials = localStorage.getItem('userCredentials');
    if (credentials) {
      const { username, password } = JSON.parse(credentials);
      const encodedCredentials = btoa(`${username}:${password}`);
      console.log('🔐 Invio credenziali per:', username); // Debug
      return {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedCredentials}`
      };
    }
    
    console.log('❌ Nessuna credenziale trovata nel localStorage');
    return {
      'Content-Type': 'application/json'
    };
  }

  // Metodo generico per chiamate HTTP
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
      console.log(`🔄 ${method} ${endpoint}`);
      const response = await fetch(url, config);

      if (!response.ok) {
        console.error(`❌ ${method} ${endpoint} - ${response.status}: ${response.statusText}`);
        throw new Error(`Request failed with status code ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ ${method} ${endpoint}:`, result);
      return result;

    } catch (error) {
      console.error(`❌ ${method} ${endpoint}:`, error.message);
      throw error;
    }
  }

  // Test connection (restituisce testo, non JSON)
  async testConnection() {
    const url = `${this.baseURL}/auth/test`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Test failed with status code ${response.status}`);
    }
    
    return response.text(); // Usa .text() invece di .json()
  }

  // Metodi per animali
  async getAnimals() {
    return this.makeRequest('GET', '/animal/list');
  }

  async getAnimal(id) {
    return this.makeRequest('GET', `/animal/${id}`);
  }

  async createAnimal(animalData) {
    return this.makeRequest('POST', '/animal/add', animalData);
  }

  async updateAnimal(id, animalData) {
    return this.makeRequest('PUT', `/animal/update/${id}`, animalData);
  }

  async deleteAnimal(id) {
    return this.makeRequest('DELETE', `/animal/delete/${id}`);
  }

  // Metodi per recinti
  async getEnclosures() {
    return this.makeRequest('GET', '/enclosure/list');
  }

  async getEnclosure(id) {
    return this.makeRequest('GET', `/enclosure/${id}`);
  }

  async createEnclosure(enclosureData) {
    return this.makeRequest('POST', '/enclosure/add', enclosureData);
  }

  async updateEnclosure(id, enclosureData) {
    return this.makeRequest('PUT', `/enclosure/${id}`, enclosureData);
  }

  async deleteEnclosure(id) {
    return this.makeRequest('DELETE', `/enclosure/${id}`);
  }

  // Metodi per utenti
  async getUsers() {
    return this.makeRequest('GET', '/user/list');
  }

  async getUser(id) {
    return this.makeRequest('GET', `/user/${id}`);
  }

  async createUser(userData) {
    return this.makeRequest('POST', '/user/add', userData);
  }

  async updateUser(id, userData) {
    return this.makeRequest('PUT', `/user/update/${id}`, userData);
  }

  async deleteUser(id) {
    return this.makeRequest('DELETE', `/user/delete/${id}`);
  }
}

// Istanza singleton
const apiService = new ApiService();
export default apiService;