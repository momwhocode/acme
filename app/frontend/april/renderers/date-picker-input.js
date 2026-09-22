export const DATE_PICKER_STATES = [
  "default",
  "hover",
  "focused",
  "calendar-opened",
  "error",
  "disabled",
  "loading",
];

export function resolveDatePickerInputPlaygroundArgs({
  state = "default",
  valueEntered = false,
  label = "Input Label",
  requiredText = "*",
  showRequired = false,
  showLabel = true,
  placeholder = "MM/DD/YYYY",
  value = "03/13/2045",
  description = "Help / Error Description.",
  showDescription = true,
} = {}) {
  return {
    state: DATE_PICKER_STATES.includes(state) ? state : "default",
    valueEntered,
    label,
    requiredText,
    showRequired,
    showLabel,
    placeholder,
    value,
    description,
    showDescription,
  };
}
