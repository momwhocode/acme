import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  dateFilterDisplayLabel,
  dateRangeFilterGroups,
  DEFAULT_DATE_RANGE_FILTER,
  isDateRangeFilterActive,
} from "../../lib/dateFilter.js";
import { measureAnchoredPortalStyle } from "../utils/domAnchors.js";
import { BaseFilterChip } from "./BaseFilterChip.jsx";
import { DateRangePicker } from "./DateRangePicker.jsx";
import { SelectDropdown } from "./SelectDropdown.jsx";

/** Presets column (~200) + two-month range calendar — used to keep the portal on-screen. */
const CUSTOM_MENU_ESTIMATED_WIDTH = 680;
const CUSTOM_MENU_ESTIMATED_HEIGHT = 420;
const PRESET_MENU_ESTIMATED_HEIGHT = 280;

/** Filter chip with date-range preset dropdown. */
export function FilterChipDateRange({
  id = "filter-chip-date-range",
  filterLabel = "Created On",
  value = DEFAULT_DATE_RANGE_FILTER,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const active = isDateRangeFilterActive(value);
  const displayLabel = dateFilterDisplayLabel(filterLabel, value);
  const groups = useMemo(() => dateRangeFilterGroups(value), [value]);
  const showCustomCalendar = open && value?.preset === "custom";

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setMenuStyle(null);
      return;
    }

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const measuredHeight = menuRef.current?.offsetHeight;
      const measuredWidth = menuRef.current?.offsetWidth;
      const next = measureAnchoredPortalStyle(triggerRef.current, {
        estimatedHeight:
          measuredHeight ||
          (showCustomCalendar ? CUSTOM_MENU_ESTIMATED_HEIGHT : PRESET_MENU_ESTIMATED_HEIGHT),
        estimatedWidth: measuredWidth || (showCustomCalendar ? CUSTOM_MENU_ESTIMATED_WIDTH : undefined),
        minWidth: showCustomCalendar ? null : Math.max(rect.width, 200),
      });

      setMenuStyle((prev) => {
        if (
          prev &&
          prev.top === next.top &&
          prev.bottom === next.bottom &&
          prev.left === next.left &&
          prev.minWidth === next.minWidth
        ) {
          return prev;
        }
        return next;
      });
    };

    updatePosition();
    // Remeasure after the portal mounts so custom calendar width can clamp left.
    const frame = window.requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, displayLabel, showCustomCalendar]);

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

  const handleOptionSelect = (item) => {
    const optionValue = item.value ?? item.label?.toLowerCase().replace(/\s+/g, "_");
    if (optionValue === "custom") {
      onChange?.({
        preset: "custom",
        from: value?.from ?? "",
        to: value?.to ?? "",
      });
      return;
    }

    onChange?.({ preset: optionValue });
    setOpen(false);
  };

  const handleRangeChange = ({ from, to }) => {
    onChange?.({
      preset: "custom",
      from: from ?? "",
      to: to ?? "",
    });
  };

  const presetsDropdown = (
    <SelectDropdown id={`${id}-menu`} variant="single" groups={groups} onOptionSelect={handleOptionSelect} />
  );

  const menu =
    open && menuStyle
      ? createPortal(
          <div
            ref={menuRef}
            className={[
              "april-filter-chip-dropdown__menu",
              "april-filter-chip-dropdown__menu--portal",
              showCustomCalendar ? "april-filter-chip-date-range__menu" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={menuStyle}
          >
            {showCustomCalendar ? (
              <>
                <div className="april-filter-chip-date-range__presets">{presetsDropdown}</div>
                <DateRangePicker
                  id={`${id}-calendar`}
                  from={value?.from ?? ""}
                  to={value?.to ?? ""}
                  onChange={handleRangeChange}
                  onReset={() => handleRangeChange({ from: "", to: "" })}
                  onDone={() => setOpen(false)}
                />
              </>
            ) : (
              presetsDropdown
            )}
          </div>,
          document.body
        )
      : null;

  return (
    <div className="april-filter-chip-dropdown april-filter-chip-date-range" id={id}>
      <span ref={triggerRef} className="april-filter-chip-dropdown__trigger">
        <BaseFilterChip
          id={`${id}-trigger`}
          filterLabel={displayLabel}
          active={open || active}
          badgeValue={active ? "1" : null}
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => setOpen((wasOpen) => !wasOpen)}
        />
      </span>
      {menu}
    </div>
  );
}
