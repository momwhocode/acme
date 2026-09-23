/**
 * Rails API base URL.
 * - Empty string: same-origin `/api/...` (Vite proxy or nginx).
 * - Set `api.url` in Rails credentials when the API is on another host.
 */
import { runtimeConfig } from "./runtime.js";

export function getApiBaseUrl() {
  const configured = String(runtimeConfig().apiUrl || "").trim();
  if (configured) return configured.replace(/\/$/, "");
  return "";
}
