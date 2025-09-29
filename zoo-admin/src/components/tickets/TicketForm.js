// TicketForm.js - VERSIONE CORRETTA
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

  const urgencyOptions = [
    { value: 'BASSO', label: 'Bassa Priorità' },
    { value: 'MEDIO', label: 'Media Priorità' },
    { value: 'ALTO', label: 'Alta Priorità' }
  ];

  // ✅ VALORI CORRETTI: OperatorType enum (VETERINARIAN, SECURITY_GUARD, ZOOKEEPER)
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

    // 🔍 DEBUG AVANZATO: Mostra esattamente cosa stai inviando
    console.log('📤 Dati inviati al backend:', JSON.stringify(ticketData, null, 2));
    console.log('🔍 Tipo di ticketUrgency:', typeof ticketData.ticketUrgency, '→', ticketData.ticketUrgency);
    console.log('🔍 Tipo di recommendedRole:', typeof ticketData.recommendedRole, '→', ticketData.recommendedRole);

    try {
      let savedTicket;
      if (ticket && ticket.id) {
        savedTicket = await ticketService.updateTicket(ticket.id, ticketData);
      } else {
        savedTicket = await ticketService.createTicket(ticketData);
      }
      onSave(savedTicket);
    } catch (error) {
      console.error('❌ Errore dettagliato:', error);
      
      // 🔍 DEBUG: Mostra la risposta esatta del backend
      if (error.message.includes('400')) {
        console.error('🔧 Verifica che il backend accetti questi valori:');
        console.error('  - ticketUrgency:', ticketData.ticketUrgency);
        console.error('  - recommendedRole:', ticketData.recommendedRole);
      }
      
      setSubmitError(error.message || 'Errore durante il salvataggio del ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Sei sicuro di voler annullare? Le modifiche non verranno salvate.')) {
      onCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{ticket ? '✏️ Modifica Ticket' : '📝 Crea Nuovo Ticket'}</h3>
          <button className="modal-close" onClick={handleCancel} type="button">×</button>
        </div>

        {submitError && <div className="submit-error">⚠️ {submitError}</div>}

        <form onSubmit={handleSubmit} className="ticket-form">
          <div className="form-group">
            <label>Titolo *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Inserisci titolo"
              disabled={loading}
            />
            {errors.title && <div className="error">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label>Descrizione *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Inserisci descrizione"
              rows="3"
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
            <button type="button" onClick={handleCancel} disabled={loading}>Annulla</button>
            <button type="submit" disabled={loading}>{loading ? '⏳ Invio in corso...' : '✅ Salva Ticket'}</button>
          </div>
        </form>
      </div>

      <style>
        {`
        .modal-overlay {
          position: fixed;
          top:0; left:0; width:100%; height:100%;
          background: rgba(0,0,0,0.5);
          display: flex; justify-content: center; align-items: center; z-index:1000;
        }
        .modal-content {
          background:white; padding:20px; border-radius:10px;
          width:90%; max-width:500px; max-height:80vh; overflow-y:auto;
        }
        .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
        .modal-close { background:none; border:none; font-size:24px; cursor:pointer; }
        .form-group { margin-bottom:15px; }
        label { display:block; margin-bottom:5px; font-weight:bold; }
        input, textarea, select { width:100%; padding:8px; border:1px solid #ddd; border-radius:4px; }
        .error { color:red; font-size:12px; }
        .submit-error { background:#ffebee; color:#c62828; padding:10px; border-radius:4px; margin-bottom:15px; }
        .form-actions { display:flex; gap:10px; justify-content:flex-end; }
        button { padding:10px 20px; border:none; border-radius:4px; cursor:pointer; }
        button:disabled { opacity:0.6; cursor:not-allowed; }
        `}
      </style>
    </div>
  );
};

export default TicketForm;