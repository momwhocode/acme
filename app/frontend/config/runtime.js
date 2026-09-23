/** Browser config injected by Rails from credentials (`window.ACME_CONFIG`). */

export function runtimeConfig() {
  if (typeof window === "undefined") return {};
  const config = window.ACME_CONFIG;
  return config && typeof config === "object" ? config : {};
}
