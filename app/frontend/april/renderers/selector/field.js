export function resolveSelectorPlaygroundArgs({
  type = "checkbox",
  state = "default",
  checked = false,
  indeterminate = false,
  label = "Field Label",
  secondaryText = "Secondary Text",
  showText = true,
  showSecondaryText = true,
} = {}) {
  return {
    type,
    state,
    checked,
    indeterminate: type === "checkbox" ? indeterminate : false,
    label,
    secondaryText,
    showText,
    showSecondaryText: showText ? showSecondaryText : false,
    decorative: true,
  };
}
