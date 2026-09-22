import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { measureSelectPortalStyle } from "../utils/domAnchors.js";
import { SelectDropdown } from "./SelectDropdown.jsx";
import { TextInput } from "./TextInput.jsx";

const HIDDEN_MEASURE_STYLE = {
  position: "fixed",
  left: 0,
  top: 0,
  visibility: "hidden",
  pointerEvents: "none",
};

function optionLabel(options, value) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "";
  return options.find((option) => option.value === normalized)?.label ?? normalized;
}

/** Searchable form select — text input with filtered single-select dropdown. */
export function FormSearchSelectField({
  id = "form-search-select",
  value = "",
  onChange,
  options = [],
  placeholder = "Search",
  state = "default",
  description,
  showDescription = false,
}) {
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [portalStyle, setPortalStyle] = useState(null);
  const [query, setQuery] = useState(() => optionLabel(options, value));
  // Only filter after the user types — opening with a selected value must show the full list.
  const [filtering, setFiltering] = useState(false);
  const isDisabled = state === "disabled";

  useEffect(() => {
    if (!open) {
      setQuery(optionLabel(options, value));
      setFiltering(false);
    }
  }, [open, options, value]);

  const filteredOptions = useMemo(() => {
    if (!filtering) return options;
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [filtering, options, query]);

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
  }, [open, filteredOptions.length]);

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

  const selectOption = (nextValue) => {
    onChange?.(nextValue);
    setQuery(optionLabel(options, nextValue));
    setFiltering(false);
    setOpen(false);
  };

  const commitExactMatch = () => {
    const exact = options.find((option) => option.label.toLowerCase() === query.trim().toLowerCase());
    if (exact) {
      selectOption(exact.value);
      return;
    }
    setQuery(optionLabel(options, value));
    setFiltering(false);
    setOpen(false);
  };

  const menu =
    open && !isDisabled && filteredOptions.length > 0 ? (
      <div
        ref={menuRef}
        className="april-form-select-field__menu april-form-select-field__menu--portal"
        style={portalStyle || HIDDEN_MEASURE_STYLE}
        onMouseDown={(event) => {
          // Keep focus in the search input until the option click selects a value.
          event.preventDefault();
        }}
      >
        <SelectDropdown
          id={`${id}-menu`}
          variant="single"
          items={filteredOptions.map((option) => ({
            label: option.label,
            value: option.value,
            selected: value === option.value,
            state: value === option.value ? "active" : "default",
          }))}
          onOptionSelect={(item) => selectOption(item.value)}
        />
      </div>
    ) : null;

  return (
    <div ref={rootRef} className="april-form-select-field" id={id}>
      <TextInput
        id={`${id}-input`}
        showLabel={false}
        fullWidth
        leadingIcon
        leadingIconName="search"
        autoComplete="off"
        placeholder={placeholder}
        value={query}
        state={state}
        showDescription={showDescription}
        description={description}
        onFocus={() => {
          if (isDisabled) return;
          setFiltering(false);
          setOpen(true);
        }}
        onBlur={(event) => {
          if (rootRef.current?.contains(event.relatedTarget)) return;
          if (menuRef.current?.contains(event.relatedTarget)) return;
          commitExactMatch();
        }}
        onChange={(event) => {
          if (isDisabled) return;
          const nextQuery = event.target.value;
          setQuery(nextQuery);
          setFiltering(true);
          setOpen(true);
          if (!nextQuery.trim()) onChange?.("");
        }}
      />
      {menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
