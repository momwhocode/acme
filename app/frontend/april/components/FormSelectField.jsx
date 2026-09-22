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

/** Form select — SelectInput trigger with single-select dropdown menu */
export function FormSelectField({
  id = "form-select",
  value,
  onChange,
  options = [],
  placeholder = "Select",
  state = "default",
  leadingIcon = false,
  description,
  showDescription = false,
  fullWidth = true,
}) {
  const [open, setOpen] = useState(false);
  const [portalStyle, setPortalStyle] = useState(null);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const selected = options.find((option) => option.value === value);
  const isDisabled = state === "disabled";

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

  const menu = open ? (
    <div
      ref={menuRef}
      className="april-form-select-field__menu april-form-select-field__menu--portal"
      style={portalStyle || HIDDEN_MEASURE_STYLE}
    >
      <SelectDropdown
        id={`${id}-menu`}
        variant="single"
        items={options.map((option) => ({
          label: option.label,
          value: option.value,
          selected: value === option.value,
          state: value === option.value ? "active" : "default",
        }))}
        onOptionSelect={(item) => {
          onChange?.(item.value);
          setOpen(false);
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
        fullWidth={fullWidth}
        valueEntered={Boolean(selected)}
        value={selected?.label ?? ""}
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
