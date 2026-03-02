import { apiFetch } from './api';

/**
 * 📊 Gestión Comercial – Resumen por vendedor
 * - Sin parámetro → mes actual
 * - Con month (YYYY-MM) → mes histórico
 */
export const getCommercialVendors = (month) => {
  return apiFetch(
    month
      ? `/metrics/commercial/vendors?month=${month}`
      : '/metrics/commercial/vendors'
  );
};

/**
 * ⏰ Presupuestos vencidos por vendedor
 * (no depende del mes seleccionado)
 */
export const getStaleQuotesBySeller = (sellerId) =>
  apiFetch(`/metrics/commercial/vendors/${sellerId}/stale-quotes`);
