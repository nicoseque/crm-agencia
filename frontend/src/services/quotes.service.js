import { apiFetch } from './api';

/**
 * CREAR PRESUPUESTO
 * ✅ AHORA RESUELVE LA PROMESA
 */
export const createQuote = async (data) => {
  const response = await apiFetch('/quotes', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  return response;
};

/**
 * Cambiar estado simple
 */
export const updateQuoteStatus = async (id, status) => {
  return await apiFetch(`/quotes/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
};

/**
 * Aprobar presupuesto (flujo de negocio)
 */
export const approveQuote = async (id, data) => {
  if (!data.amount || data.amount <= 0) {
    throw new Error('El monto del anticipo es obligatorio');
  }

  return await apiFetch(`/quotes/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({
      amount: Number(data.amount),
      payment_method: data.payment_method,
      notes: data.notes || null
    })
  });
};

/**
 * Historial del presupuesto
 */
export const getQuoteHistory = async (id) => {
  return await apiFetch(`/quotes/${id}/history`);
};

/**
 * Anticipo
 */
export const getAdvancePayment = async (quoteId) => {
  return await apiFetch(`/quotes/${quoteId}/advance-payment`);
};

/**
 * GENERAR PDF
 * (no se usa con await en el modal)
 */
export const generateQuotePdf = (id) => {
  return apiFetch(`/quotes/${id}/pdf`, {
    method: 'GET'
  });
};
