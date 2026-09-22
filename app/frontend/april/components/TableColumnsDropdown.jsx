import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { measureAnchoredPortalStyle } from "../utils/domAnchors.js";
import { IconButton } from "./IconButton.jsx";
import { SelectDropdown } from "./SelectDropdown.jsx";

const MENU_WIDTH = 256;

/** Icon button with multiselect column visibility menu — Figma select dropdown 2906:34417 */
export function TableColumnsDropdown({
  id = "table-columns-dropdown",
  icon = "add_column_right",
  ariaLabel = "Show or hide columns",
  variant = "outlined",
  size = "md",
  groupLabel = "Columns",
  options = [],
  visibleColumnIds = [],
  onToggle,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const visibleSet = useMemo(() => new Set(visibleColumnIds), [visibleColumnIds]);
  const allSelected = options.length > 0 && options.every((option) => visibleSet.has(option.id));
  const someSelected = !allSelected && options.some((option) => visibleSet.has(option.id));
  const groups = useMemo(
    () => [
      {
        label: groupLabel,
        items: [
          {
            label: "All",
            value: "all",
            selected: allSelected,
            indeterminate: someSelected,
          },
          ...options.map((option) => ({
            label: option.label,
            value: option.id,
            selected: visibleSet.has(option.id),
          })),
        ],
      },
    ],
    [allSelected, groupLabel, options, someSelected, visibleSet]
  );

  useLayoutEffect(() => {
    if (!open || !rootRef.current) {
      setMenuStyle(null);
      return;
    }

    const updatePosition = () => {
      if (!rootRef.current) return;
      const estimatedHeight = menuRef.current?.offsetHeight || Math.min(options.length * 40 + 56, 320);
      setMenuStyle(
        measureAnchoredPortalStyle(rootRef.current, {
          estimatedHeight,
          align: "end",
          minWidth: MENU_WIDTH,
          width: MENU_WIDTH,
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
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsideClick = (event) => {
      if (rootRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
      setOpen(false);
    };

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const menu =
    open && menuStyle
      ? createPortal(
          <div
            ref={menuRef}
            className="april-menu-button-dropdown__menu april-menu-button-dropdown__menu--portal april-table-columns-dropdown__menu"
            style={menuStyle}
            role="presentation"
          >
            <SelectDropdown
              id={`${id}-menu`}
              variant="multiselect"
              groups={groups}
              onOptionSelect={(item) => {
                onToggle?.(item.value);
              }}
            />
          </div>,
          document.body
        )
      : null;

  return (
    <div
      ref={rootRef}
      className={["april-menu-button-dropdown", "april-table-columns-dropdown", className]
        .filter(Boolean)
        .join(" ")}
      id={id}
    >
      <IconButton
        variant={variant}
        size={size}
        icon={icon}
        ariaLabel={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      />
      {menu}
    </div>
  );
}
