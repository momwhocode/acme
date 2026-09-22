import { BUTTON_VARIANTS, BUTTON_SIZES, BUTTON_STATES } from "./button.js";

export const MENU_BUTTON_VARIANTS = BUTTON_VARIANTS;
export const MENU_BUTTON_SIZES = BUTTON_SIZES;
export const MENU_BUTTON_STATES = BUTTON_STATES;

export function resolveMenuButtonPlaygroundArgs({
  state = "interactive",
  variant = "primary",
  size = "md",
  label = "Button Label",
  icon = true,
  leadingIconName = "add",
  trailingIconName = "keyboard_arrow_down",
  href = null,
} = {}) {
  const props = {
    variant,
    size,
    label,
    icon,
    leadingIconName,
    trailingIconName,
    href,
    state: null,
    disabled: false,
    loading: false,
  };

  switch (state) {
    case "hover":
      props.state = "hover";
      break;
    case "active/pressed":
      props.state = "active-pressed";
      break;
    case "focused":
      props.state = "focused";
      break;
    case "disabled":
      props.disabled = true;
      break;
    case "loading":
      props.loading = true;
      break;
    default:
      break;
  }

  return props;
}
