import { apiFetch } from './api';

export const getProducts = () =>
  apiFetch('/products');

export const createProduct = (data) =>
  apiFetch('/products', {
    method: 'POST',
    body: JSON.stringify(data)
  });

export const updateProduct = (id, data) =>
  apiFetch(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
