import { SELECTOR_STATES, SELECTOR_TYPES, normalizeState } from "../renderers/selector/control.js";

function CheckboxCheckIcon() {
  return (
    <svg
      className="april-selector__check-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="9"
      height="7"
      viewBox="0 0 9 7"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0.75 3.25L3.25 5.75L8.25 0.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckboxIndeterminateIcon() {
  return (
    <svg
      className="april-selector__indeterminate-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="9"
      height="7"
      viewBox="0 0 9 7"
      fill="none"
      aria-hidden="true"
    >
      <path d="M1 3.5H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ControlMarkup({ type, checked, indeterminate }) {
  if (type === "switch") {
    return (
      <span className="april-selector__track">
        <span className="april-selector__thumb" />
      </span>
    );
  }

  if (type === "radio") {
    return (
      <span className="april-selector__radio">
        {checked ? <span className="april-selector__radio-dot" /> : null}
      </span>
    );
  }

  return (
    <span className="april-selector__box">
      {indeterminate ? <CheckboxIndeterminateIcon /> : checked ? <CheckboxCheckIcon /> : null}
    </span>
  );
}

/** Checkbox / radio / switch control — tables, menus, forms */
export function SelectorControl({
  type = "checkbox",
  state = "default",
  checked = false,
  indeterminate = false,
  decorative = true,
  name = "selector",
  id = "selector-control",
  className = "",
  onChange,
}) {
  const resolvedType = SELECTOR_TYPES.includes(type) ? type : "checkbox";
  const resolvedState = normalizeState(SELECTOR_STATES.includes(state) ? state : "default");
  const isChecked = checked || (resolvedType === "checkbox" && indeterminate);
  const disabled = resolvedState === "disabled";

  const classes = [
    "april-selector",
    `april-selector--${resolvedType}`,
    `april-selector--${resolvedState}`,
    "april-selector--control-only",
    !decorative ? "april-selector--interactive" : "",
    isChecked ? "april-selector--checked" : "",
    indeterminate ? "april-selector--indeterminate" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (decorative) {
    return (
      <span className={classes} id={id} role="presentation" aria-hidden="true">
        <ControlMarkup type={resolvedType} checked={checked} indeterminate={indeterminate} />
      </span>
    );
  }

  const emitChange = (nextChecked) => {
    onChange?.({
      target: { checked: nextChecked, name, type: resolvedType === "radio" ? "radio" : "checkbox" },
      currentTarget: { checked: nextChecked, name },
    });
  };

  // Button hit-target avoids label/input + pointer-events:none quirks in tables.
  if (resolvedType === "checkbox" || resolvedType === "radio") {
    return (
      <button
        type="button"
        className={classes}
        id={id}
        name={name}
        disabled={disabled}
        aria-checked={indeterminate ? "mixed" : isChecked ? "true" : "false"}
        role={resolvedType === "radio" ? "radio" : "checkbox"}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (disabled) return;
          if (resolvedType === "checkbox" && indeterminate) {
            emitChange(true);
            return;
          }
          emitChange(!checked);
        }}
      >
        <ControlMarkup type={resolvedType} checked={checked} indeterminate={indeterminate} />
      </button>
    );
  }

  const inputType = "checkbox";

  return (
    <label className={classes} id={id} htmlFor={`${id}-input`}>
      <input
        className="april-selector__input"
        id={`${id}-input`}
        type={inputType}
        name={name}
        checked={isChecked}
        disabled={disabled}
        data-indeterminate={indeterminate || undefined}
        role="switch"
        onChange={onChange}
      />
      <ControlMarkup type={resolvedType} checked={checked} indeterminate={indeterminate} />
    </label>
  );
}

export { SELECTOR_TYPES, SELECTOR_STATES };
