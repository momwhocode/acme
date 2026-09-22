import { AnchoredMenuDropdown } from "./AnchoredMenuDropdown.jsx";

/** Icon button with anchored action menu — Figma 1928:25039.
 * Default `ghost` (transparent idle). */
export function IconMenuDropdown({
  id = "icon-menu-dropdown",
  icon = "more_vert",
  ariaLabel = "Open menu",
  variant = "ghost",
  size = "md",
  items = [],
  align = "end",
  portal,
  className = "",
}) {
  return (
    <AnchoredMenuDropdown
      trigger="icon"
      id={id}
      icon={icon}
      ariaLabel={ariaLabel}
      variant={variant}
      size={size}
      items={items}
      align={align}
      portal={portal}
      className={className}
    />
  );
}
