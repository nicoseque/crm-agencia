import { apiFetch } from './api';

export const getCommercialVendors = () =>
  apiFetch('/metrics/commercial/vendors');

export const getStaleQuotesBySeller = (sellerId) =>
  apiFetch(`/metrics/commercial/vendors/${sellerId}/stale-quotes`);
