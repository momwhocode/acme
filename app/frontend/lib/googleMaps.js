/** Optional Places lookup for April address fields. No key → loader rejects. */

import { getApiBaseUrl } from "../config/api.js";

let mapsPromise = null;
let resolvedKeyPromise = null;

function googleMapsApiKey() {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || "";
}

async function resolveGoogleMapsApiKey() {
  const fromEnv = googleMapsApiKey();
  if (fromEnv) return fromEnv;
  if (!resolvedKeyPromise) {
    resolvedKeyPromise = fetch(`${getApiBaseUrl()}/api/v1/public/maps`, {
      headers: { Accept: "application/json" },
    })
      .then((response) => (response.ok ? response.json() : {}))
      .then((body) => String(body?.browserKey || "").trim())
      .catch(() => "");
  }
  return resolvedKeyPromise;
}

export function placeToAddress(place) {
  return String(place?.formatted_address || place?.formattedAddress || place?.name || "").trim();
}

export function loadGoogleMapsPlaces() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps is unavailable"));
  }
  if (window.google?.maps?.places) return Promise.resolve(window.google);
  if (mapsPromise) return mapsPromise;

  mapsPromise = resolveGoogleMapsApiKey().then((apiKey) => {
    if (!apiKey) {
      mapsPromise = null;
      throw new Error("Google Maps is unavailable");
    }
    if (window.google?.maps?.places) return window.google;

    return new Promise((resolve, reject) => {
      const finish = async () => {
        try {
          if (window.google?.maps?.importLibrary) {
            await window.google.maps.importLibrary("places");
          }
          if (window.google?.maps?.places) {
            resolve(window.google);
            return;
          }
        } catch {
          // Script loaded without Places — fall through to reject.
        }
        mapsPromise = null;
        reject(new Error("Google Maps is unavailable"));
      };

      const existing = document.querySelector("script[data-google-maps-places]");
      if (existing) {
        if (window.google?.maps?.places) {
          resolve(window.google);
          return;
        }
        existing.addEventListener("load", finish, { once: true });
        existing.addEventListener(
          "error",
          () => {
            mapsPromise = null;
            reject(new Error("Couldn't load maps"));
          },
          { once: true }
        );
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&loading=async&v=weekly`;
      script.async = true;
      script.defer = true;
      script.dataset.googleMapsPlaces = "true";
      script.addEventListener("load", finish, { once: true });
      script.addEventListener(
        "error",
        () => {
          mapsPromise = null;
          reject(new Error("Couldn't load maps"));
        },
        { once: true }
      );
      document.head.appendChild(script);
    });
  });

  return mapsPromise;
}
