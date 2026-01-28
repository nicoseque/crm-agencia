import { apiFetch } from './api';

export async function getPipeline() {
  const response = await apiFetch('/pipeline', {
    cache: 'no-store',           // 🚫 no cache del navegador
    headers: {
      'Cache-Control': 'no-cache'
    }
  });

  return response.data ?? response;
}
