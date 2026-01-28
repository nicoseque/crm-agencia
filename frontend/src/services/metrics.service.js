import { apiFetch } from './api';

export const getDashboardKpis = async () => {
  return apiFetch('/metrics/kpis');
};

export const getSalesBySeller = async () => {
  return apiFetch('/metrics/sales-by-seller');
};

export const getSalesByMonth = async () => {
  return apiFetch('/metrics/sales-by-month');
};
