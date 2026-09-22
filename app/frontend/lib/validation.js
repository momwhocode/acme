const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9]{10}$/;

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value).trim());
}

/** Normalize phone to digits; strip leading 91 country code when 12 digits. */
export function digitsOnlyPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits;
}

export function isValidPhone(value) {
  return PHONE_PATTERN.test(digitsOnlyPhone(value));
}

/** House-style max-length message when trimmed value exceeds max. */
export function maxLengthError(value, max, label) {
  const length = String(value ?? "").trim().length;
  if (length > max) return `${label} must be ${max} characters or fewer.`;
  return null;
}

export const USERNAME_PATTERN = /^[a-z][a-z0-9_]{2,29}$/;

export function normalizeUsername(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
}

export function isValidUsername(value) {
  return USERNAME_PATTERN.test(normalizeUsername(value));
}

export function usernameError(value) {
  const username = normalizeUsername(value);
  if (!username) return "Username is required.";
  if (!isValidUsername(username)) {
    return "Use 3–30 characters: lowercase letters, numbers, and underscores.";
  }
  return null;
}

const PROFILE_URL_MAX_LENGTH = 500;

function normalizeHttpUrl(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (/^[a-z][a-z0-9+\-.]*:/i.test(raw)) return raw;
  return `https://${raw}`;
}

function hostHasPublicDomain(host) {
  const labels = String(host || "")
    .toLowerCase()
    .replace(/\.$/, "")
    .split(".");
  if (labels.length < 2) return false;
  if (!/^[a-z]{2,}$/.test(labels[labels.length - 1])) return false;
  return labels.every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label));
}

function parseHttpUrl(value) {
  const normalized = normalizeHttpUrl(value);
  if (!normalized) return null;
  try {
    const url = new URL(normalized);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    if (!hostHasPublicDomain(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

function isLinkedInHost(host) {
  const name = String(host || "")
    .toLowerCase()
    .replace(/\.$/, "");
  return name === "linkedin.com" || name.endsWith(".linkedin.com");
}

export function websiteUrlError(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;
  const lengthError = maxLengthError(normalizeHttpUrl(trimmed), PROFILE_URL_MAX_LENGTH, "Website");
  if (lengthError) return lengthError;
  if (!parseHttpUrl(trimmed)) return "Enter a valid website URL.";
  return null;
}

export function linkedinUrlError(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;
  const lengthError = maxLengthError(normalizeHttpUrl(trimmed), PROFILE_URL_MAX_LENGTH, "LinkedIn URL");
  if (lengthError) return lengthError;
  const url = parseHttpUrl(trimmed);
  if (!url || !isLinkedInHost(url.hostname)) return "Enter a valid LinkedIn URL.";
  return null;
}
