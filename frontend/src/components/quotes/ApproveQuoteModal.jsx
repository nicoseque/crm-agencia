import { useEffect, useState } from 'react';
import * as QuotesService from '../../services/quotes.service';

function ApproveQuoteModal({ open, quote, onClose, onApproved }) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [finalAmount, setFinalAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔒 IMPORTANTE: inicializamos cuando el modal SE ABRE
  useEffect(() => {
    if (!open) return;

    setPaymentMethod('');
    setFinalAmount(quote?.amount || quote?.total_amount || '');
    setError(null);
  }, [open, quote]);

  // ⛔ SOLO controlamos open, NO quote
  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!quote?.id) {
      setError('Presupuesto inválido');
      return;
    }

    if (!paymentMethod) {
      setError('Seleccioná la forma de pago');
      return;
    }

    if (!finalAmount || Number(finalAmount) <= 0) {
      setError('Ingresá un monto válido');
      return;
    }

    try {
      setLoading(true);

      await QuotesService.approveQuoteWithPayment(quote.id, {
        payment_method: paymentMethod,
        final_amount: Number(finalAmount)
      });

      onApproved();
    } catch (err) {
      setError(err.message || 'Error aprobando presupuesto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <h2 style={{ margin: 0 }}>Aprobar presupuesto</h2>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={form}>
          <div style={field}>
            <label>Forma de pago</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">Seleccionar</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="TARJETA">Tarjeta</option>
            </select>
          </div>

          <div style={field}>
            <label>Monto final cobrado</label>
            <input
              type="number"
              value={finalAmount}
              onChange={(e) => setFinalAmount(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ color: '#dc2626', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={actions}>
            <button type="button" onClick={onClose} style={cancelBtn}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={approveBtn}>
              {loading ? 'Aprobando…' : 'Confirmar aprobación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ApproveQuoteModal;

/* ===== STYLES ===== */

const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000
};

const modal = {
  background: '#fff',
  borderRadius: 16,
  width: 420,
  padding: 24
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 20
};

const closeBtn = {
  border: 'none',
  background: 'transparent',
  fontSize: 20,
  cursor: 'pointer'
};

const form = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16
};

const field = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 13,
  fontWeight: 600
};

const actions = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 12
};

const cancelBtn = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #e5e7eb',
  background: '#fff'
};

const approveBtn = {
  padding: '10px 16px',
  borderRadius: 10,
  border: 'none',
  background: '#16a34a',
  color: '#fff',
  fontWeight: 700
};
