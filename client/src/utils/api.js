// Utility to get the API base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function apiUrl(path) {
  // Ensure no double slashes
  return `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
} 