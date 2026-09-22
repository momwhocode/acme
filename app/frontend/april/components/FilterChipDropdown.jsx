import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  filterOptionsToSelectGroups,
  filterSelectionBadgeCount,
  toggleFilterSelection,
  withAllFilterOption,
} from "../../lib/filterValues.js";
import { measureAnchoredPortalStyle } from "../utils/domAnchors.js";
import { BaseFilterChip } from "./BaseFilterChip.jsx";
import { SelectDropdown } from "./SelectDropdown.jsx";

function normalizeOptions(options) {
  return options.map((option) => (typeof option === "string" ? { value: option, label: option } : option));
}

/** Filter chip with multiselect checkbox dropdown. */
export function FilterChipDropdown({
  id = "filter-chip-dropdown",
  filterLabel = "Filter",
  options = [],
  value = [],
  onChange,
  clearGeneration = 0,
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const dropdownOptions = useMemo(() => withAllFilterOption(normalizeOptions(options)), [options]);
  const badgeCount = filterSelectionBadgeCount(value, dropdownOptions);
  const groups = useMemo(() => filterOptionsToSelectGroups(options, value), [options, value]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setMenuStyle(null);
      return;
    }

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const estimatedHeight = menuRef.current?.offsetHeight || Math.min(options.length * 40 + 56, 320);
      setMenuStyle(
        measureAnchoredPortalStyle(triggerRef.current, {
          estimatedHeight,
          minWidth: Math.max(triggerRef.current.getBoundingClientRect().width, 200),
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
      if (triggerRef.current?.contains(event.target)) return;
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

  useEffect(() => {
    setOpen(false);
  }, [clearGeneration]);

  const menu =
    open && menuStyle
      ? createPortal(
          <div
            ref={menuRef}
            className="april-filter-chip-dropdown__menu april-filter-chip-dropdown__menu--portal"
            style={menuStyle}
          >
            <SelectDropdown
              id={`${id}-menu`}
              variant="multiselect"
              groups={groups}
              onOptionSelect={(item) => {
                onChange?.(toggleFilterSelection(value, item.value, dropdownOptions));
              }}
            />
          </div>,
          document.body
        )
      : null;

  return (
    <div className="april-filter-chip-dropdown" id={id}>
      <span ref={triggerRef} className="april-filter-chip-dropdown__trigger">
        <BaseFilterChip
          id={`${id}-trigger`}
          filterLabel={filterLabel}
          active={open || badgeCount > 0}
          badgeValue={badgeCount > 0 ? String(badgeCount) : null}
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen((wasOpen) => !wasOpen)}
        />
      </span>
      {menu}
    </div>
  );
}
