// src/components/common/ErrorMessage.js

import React, { useState, useEffect } from 'react';

// Messaggio di errore generico
export const ErrorMessage = ({ 
  error, 
  title = 'Errore',
  variant = 'danger',
  dismissible = false,
  onDismiss,
  className = ''
}) => {
  if (!error) return null;

  return (
    <div className={`alert alert-${variant} ${dismissible ? 'alert-dismissible' : ''} ${className}`} role="alert">
      <div className="d-flex align-items-center">
        <i className={`bi bi-${variant === 'danger' ? 'exclamation-triangle' : 'info-circle'}-fill me-2`}></i>
        <div className="flex-grow-1">
          {title && <strong>{title}: </strong>}
          {error}
        </div>
        {dismissible && (
          <button
            type="button"
            className="btn-close"
            onClick={onDismiss}
            aria-label="Close"
          />
        )}
      </div>
    </div>
  );
};

// Stato vuoto quando non ci sono dati
export const EmptyState = ({ 
  message = 'Nessun elemento trovato',
  description = '',
  icon = null,
  actionButton = null,
  className = ''
}) => {
  return (
    <div className={`text-center py-5 ${className}`}>
      {icon && (
        <div className="mb-3">
          {icon}
        </div>
      )}
      <h5 className="text-muted mb-2">{message}</h5>
      {description && (
        <p className="text-muted mb-3">{description}</p>
      )}
      {actionButton && (
        <div>
          {actionButton}
        </div>
      )}
    </div>
  );
};

// Hook per gestire toast/notifiche
export const useToast = () => {
  const [toast, setToast] = useState({
    show: false,
    message: '',
    variant: 'success',
    title: ''
  });

  const showSuccess = (message, title = 'Successo') => {
    setToast({
      show: true,
      message,
      variant: 'success',
      title
    });
  };

  const showError = (message, title = 'Errore') => {
    setToast({
      show: true,
      message,
      variant: 'danger',
      title
    });
  };

  const showWarning = (message, title = 'Attenzione') => {
    setToast({
      show: true,
      message,
      variant: 'warning',
      title
    });
  };

  const showInfo = (message, title = 'Info') => {
    setToast({
      show: true,
      message,
      variant: 'info',
      title
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  return {
    toast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast
  };
};

// Componente Toast per le notifiche
export const Toast = ({ 
  message, 
  variant = 'success', 
  show = false, 
  onClose, 
  title = '',
  autoHide = true,
  delay = 4000 
}) => {
  useEffect(() => {
    if (show && autoHide) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [show, autoHide, delay, onClose]);

  if (!show) return null;

  const toastClasses = {
    success: 'text-bg-success',
    danger: 'text-bg-danger',
    warning: 'text-bg-warning',
    info: 'text-bg-info'
  };

  const icons = {
    success: 'check-circle-fill',
    danger: 'exclamation-triangle-fill',
    warning: 'exclamation-triangle-fill',
    info: 'info-circle-fill'
  };

  return (
    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1055 }}>
      <div 
        className={`toast show ${toastClasses[variant]}`} 
        role="alert"
      >
        <div className="toast-header">
          <i className={`bi bi-${icons[variant]} me-2`}></i>
          <strong className="me-auto">{title}</strong>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onClose}
            aria-label="Close"
          />
        </div>
        {message && (
          <div className="toast-body">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

// Errore inline per i form
export const InlineError = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <div className={`invalid-feedback d-block ${className}`}>
      <i className="bi bi-exclamation-circle me-1"></i>
      {error}
    </div>
  );
};

// Componente di conferma per azioni pericolose
export const ConfirmDialog = ({ 
  show, 
  title = 'Conferma',
  message,
  onConfirm,
  onCancel,
  confirmText = 'Conferma',
  cancelText = 'Annulla',
  variant = 'danger'
}) => {
  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {title}
            </h5>
          </div>
          <div className="modal-body">
            {message}
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button 
              type="button" 
              className={`btn btn-${variant}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;