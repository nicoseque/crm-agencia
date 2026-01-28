import { apiFetch } from './api';

// Obtener vendedores (ADMIN / SUPERVISOR) - legacy / pipeline
export const getVendors = () => {
  return apiFetch('/users/vendors');
};

// 🆕 Obtener usuarios asignables a presupuestos
// VENDEDOR + SUPERVISOR (ADMIN EXCLUIDO)
export const getAssignableUsers = () => {
  return apiFetch('/users/assignable');
};

// Obtener todos los usuarios (solo ADMIN)
export const getUsers = () => {
  return apiFetch('/users');
};

// Crear usuario (solo ADMIN)
export const createUser = (data) => {
  return apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// 🔴 Desactivar usuario (soft delete)
export const deactivateUser = (id) => {
  return apiFetch(`/users/${id}/deactivate`, {
    method: 'PATCH',
  });
};

// 🟢 Activar usuario
export const activateUser = (id) => {
  return apiFetch(`/users/${id}/activate`, {
    method: 'PATCH',
  });
};
