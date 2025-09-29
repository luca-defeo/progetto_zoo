// src/hooks/useZooData.js

import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';

const useZooData = () => {
  // Stati per i dati
  const [animals, setAnimals] = useState([]);
  const [enclosures, setEnclosures] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Stati per il loading
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Stati per loading individuali
  const [loadingStates, setLoadingStates] = useState({
    animals: false,
    enclosures: false,
    users: false
  });

  // Helper per aggiornare loading states
  const updateLoadingState = useCallback((resource, isLoading) => {
    setLoadingStates(prev => ({ ...prev, [resource]: isLoading }));
  }, []);

  // Carica tutti gli animali
  const loadAnimals = useCallback(async () => {
    updateLoadingState('animals', true);
    try {
      const data = await apiService.animals.getAll();
      setAnimals(Array.isArray(data) ? data : []);
      return { success: true, data };
    } catch (err) {
      console.error('Errore caricamento animali:', err);
      const errorMsg = err.message || 'Errore di connessione';
      setError(`Errore nel caricamento degli animali: ${errorMsg}`);
      return { success: false, error: errorMsg };
    } finally {
      updateLoadingState('animals', false);
    }
  }, [updateLoadingState]);

  // Carica tutti i recinti
  const loadEnclosures = useCallback(async () => {
    updateLoadingState('enclosures', true);
    try {
      const data = await apiService.enclosures.getAll();
      setEnclosures(Array.isArray(data) ? data : []);
      return { success: true, data };
    } catch (err) {
      console.error('Errore caricamento recinti:', err);
      const errorMsg = err.message || 'Errore di connessione';
      setError(`Errore nel caricamento dei recinti: ${errorMsg}`);
      return { success: false, error: errorMsg };
    } finally {
      updateLoadingState('enclosures', false);
    }
  }, [updateLoadingState]);

  // Carica tutti gli utenti
  const loadUsers = useCallback(async () => {
    updateLoadingState('users', true);
    try {
      const data = await apiService.users.getAll();
      setUsers(Array.isArray(data) ? data : []);
      return { success: true, data };
    } catch (err) {
      console.error('Errore caricamento utenti:', err);
      const errorMsg = err.message || 'Errore di connessione';
      setError(`Errore nel caricamento degli utenti: ${errorMsg}`);
      return { success: false, error: errorMsg };
    } finally {
      updateLoadingState('users', false);
    }
  }, [updateLoadingState]);

  // Carica tutti i dati
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const [animalsResult, enclosuresResult, usersResult] = await Promise.allSettled([
        loadAnimals(),
        loadEnclosures(),
        loadUsers()
      ]);

      const errors = [];
      if (animalsResult.status === 'rejected') errors.push('animali');
      if (enclosuresResult.status === 'rejected') errors.push('recinti');
      if (usersResult.status === 'rejected') errors.push('utenti');

      if (errors.length > 0) {
        setError(`Errore nel caricamento di: ${errors.join(', ')}`);
        return { success: false, errors };
      }

      return { success: true };
    } catch (err) {
      console.error('Errore caricamento generale:', err);
      setError(`Errore generale: ${err.message}`);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadAnimals, loadEnclosures, loadUsers]);

  // Operazioni CRUD per animali
  const animalOperations = {
    create: async (animalData) => {
      try {
        const result = await apiService.animals.create(animalData);
        await loadAnimals(); // Ricarica la lista
        return { success: true, data: result };
      } catch (err) {
        const errorMsg = err.message || 'Errore di connessione';
        setError(`Errore creazione animale: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }
    },
    
    update: async (id, animalData) => {
      try {
        const result = await apiService.animals.update(id, animalData);
        await loadAnimals();
        return { success: true, data: result };
      } catch (err) {
        const errorMsg = err.message || 'Errore di connessione';
        setError(`Errore aggiornamento animale: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }
    },
    
    delete: async (id) => {
      try {
        const result = await apiService.animals.delete(id);
        await loadAnimals();
        return { success: true, data: result };
      } catch (err) {
        const errorMsg = err.message || 'Errore di connessione';
        setError(`Errore eliminazione animale: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }
    }
  };

  // Operazioni CRUD per recinti
  const enclosureOperations = {
    create: async (enclosureData) => {
      try {
        const result = await apiService.enclosures.create(enclosureData);
        await Promise.all([loadEnclosures(), loadAnimals()]); // Ricarica entrambi
        return { success: true, data: result };
      } catch (err) {
        const errorMsg = err.message || 'Errore di connessione';
        setError(`Errore creazione recinto: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }
    },
    
    update: async (id, enclosureData) => {
      try {
        const result = await apiService.enclosures.update(id, enclosureData);
        await Promise.all([loadEnclosures(), loadAnimals()]);
        return { success: true, data: result };
      } catch (err) {
        const errorMsg = err.message || 'Errore di connessione';
        setError(`Errore aggiornamento recinto: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }
    },
    
    delete: async (id) => {
      try {
        const result = await apiService.enclosures.delete(id);
        await Promise.all([loadEnclosures(), loadAnimals()]);
        return { success: true, data: result };
      } catch (err) {
        const errorMsg = err.message || 'Errore di connessione';
        setError(`Errore eliminazione recinto: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }
    }
  };

  // Operazioni CRUD per utenti
  const userOperations = {
    create: async (userData) => {
      try {
        const result = await apiService.users.create(userData);
        await loadUsers();
        return { success: true, data: result };
      } catch (err) {
        const errorMsg = err.message || 'Errore di connessione';
        setError(`Errore creazione utente: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }
    },
    
    update: async (id, userData) => {
      try {
        const result = await apiService.users.update(id, userData);
        await loadUsers();
        return { success: true, data: result };
      } catch (err) {
        const errorMsg = err.message || 'Errore di connessione';
        setError(`Errore aggiornamento utente: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }
    },
    
    delete: async (id) => {
      try {
        const result = await apiService.users.delete(id);
        await loadUsers();
        return { success: true, data: result };
      } catch (err) {
        const errorMsg = err.message || 'Errore di connessione';
        setError(`Errore eliminazione utente: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }
    }
  };

  // Statistiche calcolate
  const stats = {
    totalAnimals: animals.length,
    totalEnclosures: enclosures.length,
    totalUsers: users.length,
    animalsByCategory: animals.reduce((acc, animal) => {
      acc[animal.category] = (acc[animal.category] || 0) + 1;
      return acc;
    }, {}),
    totalArea: enclosures.reduce((sum, enclosure) => sum + (enclosure.area || 0), 0)
  };

  // Pulisci errori
  const clearError = useCallback(() => {
    setError('');
  }, []);

  // Caricamento iniziale
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    // Dati
    animals,
    enclosures,
    users,
    stats,
    
    // Stati
    loading,
    loadingStates,
    error,
    
    // Funzioni di caricamento
    loadAllData,
    loadAnimals,
    loadEnclosures,
    loadUsers,
    
    // Operazioni CRUD
    animalOperations,
    enclosureOperations,
    userOperations,
    
    // Utility
    clearError
  };
};

export default useZooData;