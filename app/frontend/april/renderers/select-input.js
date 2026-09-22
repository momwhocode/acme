export const SELECT_INPUT_SIZES = ["md", "lg", "xl"];

export const SELECT_INPUT_STATES = ["default", "hover", "active", "focused", "error", "disabled", "loading"];

export const SELECT_INPUT_PLAYGROUND_STATES = ["interactive", ...SELECT_INPUT_STATES];

export function resolveSelectInputPlaygroundArgs({
  state = "interactive",
  size = "md",
  valueEntered = false,
  label = "Input Label",
  requiredText = "*",
  showRequired = false,
  showLabel = true,
  placeholder = "Placeholder text",
  value = "Selected value",
  description = "Help / Error Description.",
  showDescription = true,
  leadingIcon = true,
  caretIcon = true,
  leadingIconName = "add",
  caretIconName = "keyboard_arrow_down",
} = {}) {
  const interactive = state === "interactive";
  const visualState = interactive ? "default" : state;

  return {
    size,
    state: visualState,
    valueEntered,
    label,
    requiredText,
    showRequired,
    showLabel,
    placeholder,
    value,
    description,
    showDescription,
    leadingIcon,
    caretIcon,
    leadingIconName,
    caretIconName,
    interactive,
  };
}
