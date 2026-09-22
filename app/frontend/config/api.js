/**
 * Rails API base URL.
 * - Empty string: same-origin `/api/...` (Vite dev proxy or nginx `API_UPSTREAM`).
 * - Set `VITE_API_URL` when the API is on another host (cross-origin; API must allow CORS).
 */
export function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return "";
}
