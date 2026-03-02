import { apiFetch } from './api';

/**
 * KPIs del dashboard
 * 👉 SOLO MES ACTUAL
 */
export const getDashboardKpis = async () => {
  return apiFetch('/metrics/kpis');
};

/**
 * Ranking de vendedores
 */
export const getSalesBySeller = async (month = null) => {
  const query = month ? `?month=${month}` : '';
  return apiFetch(`/metrics/sales-by-seller${query}`);
};
/**
 * Ventas por mes (histórico)
 */
export const getSalesByMonth = async () => {
  return apiFetch('/metrics/sales-by-month');
};