export const MENU_OPTION_SIZES = ["md", "lg", "xl"];

export const MENU_OPTION_STATES = [
  "default",
  "hover",
  "pressed/active",
  "active",
  "focused",
  "disabled",
  "loading",
];

export function resolveMenuOptionPlaygroundArgs({
  multiselect = false,
  state = "default",
  size = "md",
  destructive = false,
  trailingAddOns = true,
  optionLabel = "Option Label",
  showLeadingIcon = false,
  showBadge = false,
  showLeadingSelector = true,
  showLeadingCheckbox,
  showAvatar = false,
  showTrailingShortcut = true,
  showTrailingTag = false,
  showTrailingSelector = false,
  showTrailingIcon = false,
  selected = false,
} = {}) {
  const leadingSelector = multiselect && showLeadingSelector;
  const resolvedShowLeadingCheckbox =
    typeof showLeadingCheckbox === "boolean" ? showLeadingCheckbox : leadingSelector;

  return {
    state,
    size,
    destructive,
    trailingAddOns,
    label: optionLabel,
    showLeadingIcon,
    showBadge,
    showLeadingSelector: leadingSelector,
    showLeadingCheckbox: resolvedShowLeadingCheckbox,
    showAvatar,
    showTrailingShortcut,
    showTrailingTag,
    showTrailingSelector,
    showTrailingIcon,
    selectorType: multiselect ? "checkbox" : "radio",
    selected: multiselect ? selected : false,
  };
}
