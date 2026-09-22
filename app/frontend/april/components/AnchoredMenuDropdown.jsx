import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { measureAnchoredPortalStyle } from "../utils/domAnchors.js";
import { mapActionMenuItems } from "../renderers/menu-dropdown.js";
import { IconButton } from "./IconButton.jsx";
import { MenuButton } from "./MenuButton.jsx";
import { MenuDropdown } from "./MenuDropdown.jsx";

function useDismissMenu({ open, onClose, rootRef, triggerRef, menuRef, usePortal }) {
  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsideClick = (event) => {
      if (usePortal) {
        if (triggerRef.current?.contains(event.target)) return;
        if (menuRef.current?.contains(event.target)) return;
      } else if (rootRef.current?.contains(event.target)) {
        return;
      }
      onClose();
    };

    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, onClose, rootRef, triggerRef, menuRef, usePortal]);
}

/** Trigger + anchored menu — composes MenuDropdown + base MenuOption rows */
export function AnchoredMenuDropdown({
  trigger = "icon",
  id = "anchored-menu-dropdown",
  items = [],
  className = "",
  align = "end",
  placement = "bottom",
  portal,
  icon = "more_vert",
  ariaLabel = "Open menu",
  variant = "ghost",
  size = "md",
  label = "Button Label",
  buttonVariant = "primary",
  leadingIconName = "add",
  showLeadingIcon = true,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  // Portal by default so menus can flip above near the viewport edge.
  const usePortal = portal ?? true;

  const close = () => setOpen(false);
  const menuItems = mapActionMenuItems(items, { idPrefix: id, onClose: close });

  useLayoutEffect(() => {
    if (!usePortal || !open || !triggerRef.current) {
      setMenuStyle(null);
      return;
    }

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const estimatedHeight = menuRef.current?.offsetHeight || Math.min(items.length * 40 + 16, 320);
      setMenuStyle(
        measureAnchoredPortalStyle(triggerRef.current, {
          estimatedHeight,
          align,
          minWidth: 200,
          preferAbove: placement === "top",
        })
      );
    };

    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, align, placement, items.length, usePortal]);

  useDismissMenu({ open, onClose: close, rootRef, triggerRef, menuRef, usePortal });

  const menuPanel = open ? <MenuDropdown id={`${id}-menu`} items={menuItems} /> : null;

  const menu =
    usePortal && open && menuStyle ? (
      createPortal(
        <div
          ref={menuRef}
          className="april-icon-menu-dropdown__menu april-menu-button-dropdown__menu--portal"
          style={menuStyle}
        >
          {menuPanel}
        </div>,
        document.body
      )
    ) : open ? (
      <div
        className={[
          "april-menu-button-dropdown__menu",
          placement === "top" ? "april-menu-button-dropdown__menu--above" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        role="presentation"
      >
        {menuPanel}
      </div>
    ) : null;

  const rootClassName = [
    trigger === "icon" ? "april-icon-menu-dropdown" : "april-menu-button-dropdown",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={rootRef} className={rootClassName} id={id}>
      {trigger === "icon" ? (
        <span ref={triggerRef} className="april-icon-menu-dropdown__trigger">
          <IconButton
            variant={variant}
            size={size}
            icon={icon}
            ariaLabel={ariaLabel}
            aria-expanded={open}
            aria-haspopup="menu"
            onClick={() => setOpen((wasOpen) => !wasOpen)}
          />
        </span>
      ) : (
        <span ref={triggerRef} className="april-menu-button-dropdown__trigger">
          <MenuButton
            label={label}
            variant={buttonVariant}
            size={size}
            icon={showLeadingIcon}
            leadingIconName={leadingIconName}
            disabled={disabled}
            aria-expanded={open}
            onClick={() => {
              if (disabled) return;
              setOpen((wasOpen) => !wasOpen);
            }}
          />
        </span>
      )}
      {menu}
    </div>
  );
}
