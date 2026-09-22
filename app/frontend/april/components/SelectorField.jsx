import { SELECTOR_STATES, SELECTOR_TYPES, normalizeState } from "../renderers/selector/control.js";
import { SelectorControl } from "./SelectorControl.jsx";

/** Selector field — control + label + secondary text (Figma 243:1017) */
export function SelectorField({
  type = "checkbox",
  state = "default",
  checked = false,
  indeterminate = false,
  label = "Field Label",
  secondaryText = "Secondary Text",
  showText = true,
  showSecondaryText = true,
  decorative = true,
  name = "selector-field",
  id = "selector-field",
  className = "",
  onChange,
  ariaLabel,
}) {
  const resolvedType = SELECTOR_TYPES.includes(type) ? type : "checkbox";
  const resolvedState = normalizeState(SELECTOR_STATES.includes(state) ? state : "default");
  const showLabel = showText;
  const showSecondary = showLabel && showSecondaryText;

  const fieldClasses = [
    "april-selector-field",
    `april-selector-field--${resolvedType}`,
    `april-selector-field--${resolvedState}`,
    checked || (resolvedType === "checkbox" && indeterminate) ? "april-selector-field--checked" : "",
    indeterminate ? "april-selector-field--indeterminate" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (decorative) {
    return (
      <label className={fieldClasses} id={id}>
        <span className="april-selector-field__control" aria-hidden="true">
          <SelectorControl
            type={resolvedType}
            state={resolvedState}
            checked={checked}
            indeterminate={indeterminate}
            decorative
          />
        </span>
        {showLabel ? (
          <span className="april-selector-field__text">
            <span className="april-selector-field__label">{label}</span>
            {showSecondary ? <span className="april-selector-field__secondary">{secondaryText}</span> : null}
          </span>
        ) : null}
      </label>
    );
  }

  const inputType = resolvedType === "radio" ? "radio" : "checkbox";
  const isChecked = checked || (resolvedType === "checkbox" && indeterminate);
  const disabled = resolvedState === "disabled";

  return (
    <label className={fieldClasses} id={id} htmlFor={`${id}-input`}>
      <input
        className="april-selector-field__input"
        id={`${id}-input`}
        type={inputType}
        name={name}
        checked={isChecked}
        disabled={disabled}
        data-indeterminate={indeterminate || undefined}
        role={resolvedType === "switch" ? "switch" : undefined}
        aria-label={!showLabel ? ariaLabel || label : undefined}
        onChange={onChange}
      />
      <span className="april-selector-field__control" aria-hidden="true">
        <SelectorControl
          type={resolvedType}
          state={resolvedState}
          checked={checked}
          indeterminate={indeterminate}
          decorative
        />
      </span>
      {showLabel ? (
        <span className="april-selector-field__text">
          <span className="april-selector-field__label">{label}</span>
          {showSecondary ? <span className="april-selector-field__secondary">{secondaryText}</span> : null}
        </span>
      ) : null}
    </label>
  );
}
