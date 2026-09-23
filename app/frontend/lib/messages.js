/** Look up FE copy from locales/en.js. Interpolate `%{name}` the same way Rails I18n does. */

import { en } from "../locales/en.js"

export { en }

export function t(path, vars = {}) {
  const value = path.split(".").reduce((node, key) => node?.[key], en)
  if (typeof value !== "string") return path
  return value.replace(/%\{(\w+)\}/g, (_, key) => (vars[key] == null ? "" : String(vars[key])))
}
