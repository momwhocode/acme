import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { measureSelectPortalStyle } from "../utils/domAnchors.js";
import { SelectDropdown } from "./SelectDropdown.jsx";
import { SelectInput } from "./SelectInput.jsx";

const HIDDEN_MEASURE_STYLE = {
  position: "fixed",
  left: 0,
  top: 0,
  visibility: "hidden",
  pointerEvents: "none",
};

/** Form multi-select — SelectInput trigger with checkbox dropdown menu */
export function FormMultiSelectField({
  id = "form-multi-select",
  values = [],
  onChange,
  options = [],
  placeholder = "Select",
  state = "default",
  leadingIcon = false,
  description,
  showDescription = false,
}) {
  const [open, setOpen] = useState(false);
  const [portalStyle, setPortalStyle] = useState(null);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const selectedValues = Array.isArray(values) ? values : [];
  const selectedLabels = options
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => option.label);
  const isDisabled = state === "disabled";
  const summary =
    selectedLabels.length === 0
      ? ""
      : selectedLabels.length <= 2
        ? selectedLabels.join(", ")
        : `${selectedLabels.slice(0, 2).join(", ")} +${selectedLabels.length - 2}`;

  useLayoutEffect(() => {
    if (!open || !rootRef.current) {
      setPortalStyle(null);
      return undefined;
    }

    const updatePosition = () => {
      const measuredHeight = menuRef.current?.offsetHeight;
      setPortalStyle(measureSelectPortalStyle(rootRef.current, measuredHeight || undefined));
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, options.length, selectedValues.length]);

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

  const menu = open ? (
    <div
      ref={menuRef}
      className="april-form-select-field__menu april-form-select-field__menu--portal"
      style={portalStyle || HIDDEN_MEASURE_STYLE}
    >
      <SelectDropdown
        id={`${id}-menu`}
        variant="multiselect"
        items={options.map((option) => ({
          label: option.label,
          value: option.value,
          selected: selectedValues.includes(option.value),
        }))}
        onOptionSelect={(item) => {
          const next = selectedValues.includes(item.value)
            ? selectedValues.filter((value) => value !== item.value)
            : [...selectedValues, item.value];
          onChange?.(next);
        }}
      />
    </div>
  ) : null;

  return (
    <div ref={rootRef} className="april-form-select-field" id={id}>
      <SelectInput
        id={`${id}-input`}
        showLabel={false}
        showDescription={showDescription}
        description={description}
        leadingIcon={leadingIcon}
        valueEntered={selectedLabels.length > 0}
        value={summary}
        placeholder={placeholder}
        state={state}
        onClick={() => {
          if (!isDisabled) setOpen((wasOpen) => !wasOpen);
        }}
      />
      {menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
