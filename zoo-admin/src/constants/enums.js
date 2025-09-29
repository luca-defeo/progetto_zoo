// src/constants/enums.js

// Enum per le categorie degli animali (sincronizzato con backend)
export const AnimalCategory = {
  MAMMAL: 'MAMMAL',
  BIRD: 'BIRD',
  REPTILE: 'REPTILE',
  AMPHIBIAN: 'AMPHIBIAN',
  FISH: 'FISH',
  INSECT: 'INSECT'
};

// Enum per i ruoli utente (sincronizzato con backend)
export const Role = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  OPERATOR: 'OPERATOR'
};

// Enum per i tipi di operatore (sincronizzato con backend)
export const OperatorType = {
  ZOOKEEPER: 'ZOOKEEPER',
  VETERINARIAN: 'VETERINARIAN',
  SECURITY_GUARD: 'SECURITY_GUARD'
};

// Labels in italiano per AnimalCategory
export const AnimalCategoryLabels = {
  [AnimalCategory.MAMMAL]: 'Mammifero',
  [AnimalCategory.BIRD]: 'Uccello',
  [AnimalCategory.REPTILE]: 'Rettile',
  [AnimalCategory.AMPHIBIAN]: 'Anfibio',
  [AnimalCategory.FISH]: 'Pesce',
  [AnimalCategory.INSECT]: 'Insetto'
};

// Labels in italiano per Role
export const RoleLabels = {
  [Role.ADMIN]: 'Amministratore',
  [Role.MANAGER]: 'Manager',
  [Role.OPERATOR]: 'Operatore'
};

// Labels in italiano per OperatorType
export const OperatorTypeLabels = {
  [OperatorType.ZOOKEEPER]: 'Custode Zoo',
  [OperatorType.VETERINARIAN]: 'Veterinario',
  [OperatorType.SECURITY_GUARD]: 'Guardia di Sicurezza'
};

// Classi Bootstrap per i badge delle categorie
export const CategoryBadgeClasses = {
  [AnimalCategory.MAMMAL]: 'bg-primary',
  [AnimalCategory.BIRD]: 'bg-info',
  [AnimalCategory.REPTILE]: 'bg-success',
  [AnimalCategory.AMPHIBIAN]: 'bg-secondary',
  [AnimalCategory.FISH]: 'bg-info',
  [AnimalCategory.INSECT]: 'bg-warning text-dark'
};

// Classi Bootstrap per i badge dei ruoli
export const RoleBadgeClasses = {
  [Role.ADMIN]: 'bg-danger',
  [Role.MANAGER]: 'bg-warning text-dark',
  [Role.OPERATOR]: 'bg-success'
};

// Configurazione API per il backend Spring Boot
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8081/api',
  TIMEOUT: 10000,
  ENDPOINTS: {
    ANIMALS: '/animal',
    ENCLOSURES: '/enclosure',
    USERS: '/user'
  }
};

// Configurazione app
export const APP_CONFIG = {
  APP_NAME: 'Zoo Management System',
  VERSION: '1.0.0'
};

export default {
  AnimalCategory,
  Role,
  OperatorType,
  AnimalCategoryLabels,
  RoleLabels,
  OperatorTypeLabels,
  CategoryBadgeClasses,
  RoleBadgeClasses,
  API_CONFIG,
  APP_CONFIG
};

export const getRoleOptions = () => Object.values(Role);
export const getOperatorTypeOptions = () => Object.values(OperatorType);