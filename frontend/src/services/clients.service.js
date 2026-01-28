import { apiFetch } from './api';

export const clientsService = {
  getAll: () => apiFetch('/clients'),

  getById: (id) => apiFetch(`/clients/${id}`),

  getByDni: (dni) => apiFetch(`/clients/by-dni/${dni}`),

  create: (data) =>
    apiFetch('/clients', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  update: (id, data) =>
    apiFetch(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deactivate: (id) =>
    apiFetch(`/clients/${id}`, {
      method: 'DELETE'
    })
};
