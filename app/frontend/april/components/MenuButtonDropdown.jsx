import { AnchoredMenuDropdown } from "./AnchoredMenuDropdown.jsx";

/** Menu button with anchored action menu — composes MenuButton + MenuDropdown */
export function MenuButtonDropdown({
  id = "menu-button-dropdown",
  label = "Button Label",
  variant = "primary",
  size = "md",
  leadingIconName = "add",
  showLeadingIcon = true,
  items = [],
  disabled = false,
  className = "",
  align = "end",
  placement = "bottom",
  portal,
}) {
  return (
    <AnchoredMenuDropdown
      trigger="button"
      id={id}
      label={label}
      buttonVariant={variant}
      size={size}
      leadingIconName={leadingIconName}
      showLeadingIcon={showLeadingIcon}
      items={items}
      disabled={disabled}
      className={className}
      align={align}
      placement={placement}
      portal={portal}
    />
  );
}
