// TicketForm.js - VERSIONE COMPLETA con Modal Conferma
import React, { useState, useEffect } from 'react';
import ticketService from '../../services/ticketService';

const TicketForm = ({ ticket = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ticketUrgency: 'MEDIO',
    recommendedRole: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const urgencyOptions = [
    { value: 'BASSO', label: 'Bassa Priorità' },
    { value: 'MEDIO', label: 'Media Priorità' },
    { value: 'ALTO', label: 'Alta Priorità' }
  ];

  const roleOptions = [
    { value: '', label: 'Nessun ruolo specifico' },
    { value: 'VETERINARIAN', label: 'Veterinario' },
    { value: 'SECURITY_GUARD', label: 'Guardia Sicurezza' },
    { value: 'ZOOKEEPER', label: 'Custode Zoo' }
  ];

  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title || '',
        description: ticket.description || '',
        ticketUrgency: ticket.ticketUrgency || 'MEDIO',
        recommendedRole: ticket.recommendedRole || ''
      });
    }
  }, [ticket]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Il titolo è obbligatorio';
    if (!formData.description.trim()) newErrors.description = 'La descrizione è obbligatoria';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setSubmitError('');

    const ticketData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      ticketUrgency: formData.ticketUrgency,
      recommendedRole: formData.recommendedRole || null,
    };

    try {
      let savedTicket;
      if (ticket && ticket.id) {
        savedTicket = await ticketService.updateTicket(ticket.id, ticketData);
      } else {
        savedTicket = await ticketService.createTicket(ticketData);
      }
      onSave(savedTicket);
    } catch (error) {
      console.error('Errore dettagliato:', error);
      setSubmitError(error.message || 'Errore durante il salvataggio del ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    onCancel();
  };

  return (
    <>
      <div className="modal-overlay" onClick={(e) => {
  if (e.target === e.currentTarget) {
    e.stopPropagation();
    handleCancelClick();
  }
}}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{ticket ? 'Modifica Ticket' : 'Crea Nuovo Ticket'}</h3>
            <button className="modal-close" onClick={handleCancelClick} type="button">×</button>
          </div>

          {submitError && <div className="submit-error">{submitError}</div>}

          <form onSubmit={handleSubmit} className="ticket-form">
            <div className="form-group">
              <label>Titolo <span className="required">*</span></label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Inserisci titolo del ticket"
                disabled={loading}
              />
              {errors.title && <div className="error">{errors.title}</div>}
            </div>

            <div className="form-group">
              <label>Descrizione <span className="required">*</span></label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descrivi il problema o la richiesta"
                rows="4"
                disabled={loading}
              />
              {errors.description && <div className="error">{errors.description}</div>}
            </div>

            <div className="form-group">
              <label>Priorità</label>
              <select
                name="ticketUrgency"
                value={formData.ticketUrgency}
                onChange={handleInputChange}
                disabled={loading}
              >
                {urgencyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Ruolo Raccomandato</label>
              <select
                name="recommendedRole"
                value={formData.recommendedRole}
                onChange={handleInputChange}
                disabled={loading}
              >
                {roleOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleCancelClick} disabled={loading}>
                Annulla
              </button>
              <button type="submit" disabled={loading}>
                {loading ? 'Salvataggio...' : 'Salva Ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal di Conferma Annullamento */}
      {showCancelConfirm && (
        <div className="confirm-overlay" onClick={() => setShowCancelConfirm(false)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="confirm-header">
              <h4>Conferma Annullamento</h4>
            </div>
            <div className="confirm-body">
              <p>Sei sicuro di voler annullare? Tutte le modifiche non salvate verranno perse.</p>
            </div>
            <div className="confirm-actions">
              <button 
                type="button" 
                className="btn-confirm-no"
                onClick={() => setShowCancelConfirm(false)}
              >
                Continua Modifica
              </button>
              <button 
                type="button" 
                className="btn-confirm-yes"
                onClick={confirmCancel}
              >
                Annulla Tutto
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
        /* Modal Principale */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 90%;
          max-width: 550px;
          max-height: 85vh;
          overflow-y: auto;
        }

        .modal-header {
          padding: 24px 32px;
          border-bottom: 2px solid #e8f5e9;
          background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
        }

        .modal-close {
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 4px 12px;
          border-radius: 8px;
          transition: all 0.3s ease;
          line-height: 1;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        /* Form */
        .ticket-form {
          padding: 32px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2e7d32;
          font-size: 14px;
        }

        .required {
          color: #e53935;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #81c784;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          border-color: #2e7d32;
          outline: none;
          box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
        }

        .form-group input:disabled,
        .form-group textarea:disabled,
        .form-group select:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
        }

        .error {
          color: #e53935;
          font-size: 13px;
          margin-top: 6px;
          font-weight: 500;
        }

        .submit-error {
          background: #ffebee;
          color: #c62828;
          padding: 14px 18px;
          border-radius: 10px;
          margin: 0 32px 20px 32px;
          border: 2px solid #ef9a9a;
          font-weight: 500;
          font-size: 14px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 2px solid #e8f5e9;
        }

        .form-actions button {
          padding: 10px 24px;
          border: 2px solid;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .form-actions button[type="button"] {
          background: white;
          color: #546e7a;
          border-color: #e0e0e0;
        }

        .form-actions button[type="button"]:hover {
          background: #f5f5f5;
          border-color: #bdbdbd;
        }

        .form-actions button[type="submit"] {
          background: #2e7d32;
          color: white;
          border-color: #2e7d32;
        }

        .form-actions button[type="submit"]:hover {
          background: #1b5e20;
          border-color: #1b5e20;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);
        }

        .form-actions button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Modal di Conferma */
        .confirm-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1060;
          padding: 20px;
        }

        .confirm-dialog {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 420px;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.4);
          animation: confirmSlideIn 0.3s ease;
        }

        @keyframes confirmSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .confirm-header {
          padding: 24px 28px;
          border-bottom: 2px solid #e8f5e9;
          background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
          border-radius: 16px 16px 0 0;
        }

        .confirm-header h4 {
          margin: 0;
          color: white;
          font-size: 18px;
          font-weight: 600;
        }

        .confirm-body {
          padding: 28px;
        }

        .confirm-body p {
          margin: 0;
          color: #546e7a;
          line-height: 1.6;
          font-size: 15px;
        }

        .confirm-actions {
          padding: 20px 28px;
          border-top: 2px solid #e8f5e9;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          background: #fafafa;
          border-radius: 0 0 16px 16px;
        }

        .btn-confirm-no {
          background: white;
          color: #546e7a;
          border: 2px solid #e0e0e0;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-confirm-no:hover {
          background: #f5f5f5;
          border-color: #bdbdbd;
        }

        .btn-confirm-yes {
          background: #e53935;
          color: white;
          border: 2px solid #e53935;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-confirm-yes:hover {
          background: #c62828;
          border-color: #c62828;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(229, 57, 53, 0.3);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .modal-overlay {
            padding: 10px;
          }

          .modal-content {
            max-height: 90vh;
          }

          .modal-header {
            padding: 20px 24px;
          }

          .modal-header h3 {
            font-size: 18px;
          }

          .ticket-form {
            padding: 24px;
          }

          .form-group {
            margin-bottom: 20px;
          }

          .submit-error {
            margin: 0 24px 16px 24px;
          }

          .confirm-header {
            padding: 20px 24px;
          }

          .confirm-body {
            padding: 24px;
          }

          .confirm-actions {
            padding: 16px 24px;
          }
        }

        @media (max-width: 480px) {
          .modal-header {
            padding: 16px 20px;
          }

          .ticket-form {
            padding: 20px;
          }

          .form-actions button {
            padding: 8px 16px;
            font-size: 13px;
          }

          .submit-error {
            margin: 0 20px 16px 20px;
          }

          .confirm-dialog {
            max-width: 95%;
          }

          .btn-confirm-no,
          .btn-confirm-yes {
            padding: 8px 16px;
            font-size: 13px;
          }
        }
        `}
      </style>
    </>
  );
};

export default TicketForm;