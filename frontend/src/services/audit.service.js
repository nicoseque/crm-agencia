import { apiFetch } from './api';

export const getUsersAudit = () => {
  return apiFetch('/audit/users');
};
