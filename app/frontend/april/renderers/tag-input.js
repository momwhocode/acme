export const TAG_INPUT_STATES = ["default", "hover", "active", "focused", "error", "disabled", "loading"];

export const TAG_INPUT_SAMPLE_TAGS = ["JEE 2027", "High Income"];

export function resolveTagInputPlaygroundArgs({
  state = "default",
  valueEntered = false,
  label = "Input Label",
  requiredText = "*",
  showRequired = false,
  showLabel = true,
  placeholder = "Add multiple tags separated by comma (,)",
  tags = TAG_INPUT_SAMPLE_TAGS,
  description = "Help / Error Description.",
  showDescription = true,
  leadingIcon = true,
  leadingIconName = "add",
} = {}) {
  return {
    playgroundState: TAG_INPUT_STATES.includes(state) ? state : "default",
    valueEntered,
    label,
    requiredText,
    showRequired,
    showLabel,
    placeholder,
    tags: valueEntered ? tags : [],
    description,
    showDescription,
    leadingIcon,
    leadingIconName,
    disabled: state === "disabled",
    state: state === "error" ? "error" : state === "loading" ? "loading" : "default",
  };
}
