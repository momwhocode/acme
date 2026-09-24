/** Shared pick lists for onboard and edit so country, level, and department stay aligned. */

import { COUNTRIES, DEPARTMENTS, EMPLOYMENT_TYPES, FORM_LEVELS } from "./employees.js"
import { countryLabel, displayLevel, titleCase } from "./employeesTable.js"

function withCurrentOption(options, value, labelFor = (entry) => entry) {
  const current = String(value || "").trim()
  if (!current || options.some((option) => option.value === current)) return options
  return [ ...options, { value: current, label: labelFor(current) } ]
}

const COUNTRY_SELECT_OPTIONS = COUNTRIES.map((value) => ({ value, label: countryLabel(value) }))
const DEPARTMENT_SELECT_OPTIONS = DEPARTMENTS.map((value) => ({ value, label: titleCase(value) }))
const LEVEL_SELECT_OPTIONS = FORM_LEVELS.map((value) => ({ value, label: value }))
export const TYPE_SELECT_OPTIONS = EMPLOYMENT_TYPES.map((value) => ({ value, label: titleCase(value) }))

/** Map seed IC/M codes onto the L1–L5+ pick list used by onboard and edit. */
export function formLevelValue(level) {
  return displayLevel(level) || String(level || "").trim()
}

export function countrySelectOptions(current) {
  return withCurrentOption(COUNTRY_SELECT_OPTIONS, current, countryLabel)
}

export function departmentSelectOptions(current) {
  return withCurrentOption(DEPARTMENT_SELECT_OPTIONS, current, titleCase)
}

export function levelSelectOptions(current) {
  return withCurrentOption(LEVEL_SELECT_OPTIONS, formLevelValue(current))
}
