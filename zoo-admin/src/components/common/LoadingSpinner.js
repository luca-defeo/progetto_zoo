// src/components/common/LoadingSpinner.js

import React from 'react';

// Spinner generico per loading
export const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Caricamento...', 
  variant = 'primary',
  className = '' 
}) => {
  const sizeClasses = {
    small: 'spinner-border-sm',
    medium: '',
    large: 'spinner-grow'
  };

  const containerClasses = {
    small: 'text-center p-2',
    medium: 'text-center p-3',
    large: 'text-center p-5'
  };

  return (
    <div className={`${containerClasses[size]} ${className}`}>
      <div 
        className={`spinner-${size === 'large' ? 'grow' : 'border'} text-${variant} ${sizeClasses[size]}`} 
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && (
        <div className={`mt-2 text-${variant}`}>
          <small>{message}</small>
        </div>
      )}
    </div>
  );
};

// Spinner per tabelle
export const TableSpinner = ({ 
  rows = 3, 
  columns = 4,
  className = '' 
}) => {
  return (
    <div className={`${className}`}>
      <div className="card">
        <div className="card-header">
          <div className="placeholder-glow">
            <span className="placeholder col-4"></span>
            <span className="placeholder col-2 ms-auto"></span>
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <th key={colIndex}>
                      <div className="placeholder-glow">
                        <span className="placeholder col-8"></span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: rows }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {Array.from({ length: columns }).map((_, colIndex) => (
                      <td key={colIndex}>
                        <div className="placeholder-glow">
                          <span className="placeholder col-6"></span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Spinner per bottoni
export const ButtonSpinner = ({ text = 'Caricamento...', size = 'sm' }) => {
  return (
    <>
      <span className={`spinner-border spinner-border-${size} me-2`} role="status" aria-hidden="true"></span>
      {text}
    </>
  );
};

// Spinner a schermo intero
export const FullPageSpinner = ({ message = 'Caricamento...' }) => {
  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-light">
      <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted">{message}</p>
    </div>
  );
};

export default LoadingSpinner;