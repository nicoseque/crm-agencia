import { apiFetch } from './api';

/**
 * CREAR PRESUPUESTO
 */
export const createQuote = async (data) => {
  return await apiFetch('/quotes', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

/**
 * CAMBIO DE ESTADO SIMPLE
 */
export const updateQuoteStatus = async (id, status) => {
  return await apiFetch(`/quotes/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
};

/**
 * ✅ APROBACIÓN CON COBRO REAL
 */
export const approveQuoteWithPayment = async (id, data) => {
  const { payment_method, final_amount } = data;

  if (!payment_method) {
    throw new Error('La forma de pago es obligatoria');
  }

  if (!final_amount || Number(final_amount) <= 0) {
    throw new Error('El monto final es obligatorio');
  }

  return await apiFetch(`/quotes/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({
      payment_method,
      final_amount: Number(final_amount)
    })
  });
};

/**
 * HISTORIAL
 */
export const getQuoteHistory = async (id) => {
  return await apiFetch(`/quotes/${id}/history`);
};

/**
 * 📄 PDF — IMPLEMENTACIÓN CORRECTA
 * (NO usar apiFetch)
 */
export const openQuotePdf = async (id) => {
  const token = localStorage.getItem('token');

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/quotes/${id}/pdf`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!res.ok) {
    throw new Error('Error generando PDF');
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  window.open(url, '_blank');

  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

/**
 * LISTAR PRESUPUESTOS
 */
export const getAllQuotes = async (search = '') => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return await apiFetch(`/quotes${query}`);
};