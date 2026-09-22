import { useId } from "react";
import { resolveAprilVisualState, useInteractionState } from "../hooks/useInteractionState.js";
import { CharacterCount, shouldShowCharacterCount } from "./CharacterCount.jsx";

const SIZES = ["md", "lg", "xl"];
const SEMANTIC_STATES = ["default", "error", "disabled", "loading"];

/**
 * Editable text input using April form-text-input styles (Figma 39:5447).
 */
export function TextInput({
  id: idProp,
  size = "md",
  state = "default",
  label,
  required = false,
  requiredText = "*",
  showLabel = true,
  placeholder = "",
  value = "",
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  type = "text",
  inputMode,
  name,
  autoComplete,
  autoFocus = false,
  maxLength,
  pattern,
  description,
  showDescription = false,
  leadingIcon = false,
  trailingIcon = false,
  leadingIconName = "mail",
  trailingIconName = "add",
  clearable = false,
  clearLabel = "Clear",
  onClear,
  fullWidth = false,
  disabled = false,
  readOnly = false,
  list,
  className = "",
  inputRef,
}) {
  const uid = useId();
  const id = idProp || `text-input-${uid}`;
  const resolvedSize = SIZES.includes(size) ? size : "md";
  const semanticState = disabled ? "disabled" : SEMANTIC_STATES.includes(state) ? state : "default";
  const { interaction, mouseBind, focusBind } = useInteractionState();
  const visualState = resolveAprilVisualState(semanticState, interaction);
  const valueEntered = Boolean(value);
  const isDisabled = semanticState === "disabled" || semanticState === "loading";
  const isError = semanticState === "error";
  const countVisible = shouldShowCharacterCount(maxLength, type);
  const describedBy =
    [showDescription && description ? `${id}-desc` : null, countVisible ? `${id}-count` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const classes = [
    "april-text-input",
    `april-text-input--${resolvedSize}`,
    visualState !== "default" ? `april-text-input--${visualState}` : "",
    valueEntered ? "april-text-input--entered" : "",
    fullWidth ? "april-text-input--full-width" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleFocus = (event) => {
    focusBind.onFocus(event);
    onFocus?.(event);
  };

  const handleBlur = (event) => {
    focusBind.onBlur(event);
    onBlur?.(event);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
      return;
    }

    onChange?.({ target: { value: "" } });
  };

  const showClearButton = clearable && value && !isDisabled && !readOnly;

  return (
    <div className={classes} {...mouseBind}>
      {showLabel && label ? (
        <div className="april-text-input__label-row">
          <label className="april-text-input__label" htmlFor={id}>
            {label}
            {required ? (
              <span className="april-text-input__required" aria-hidden="true">
                {requiredText}
              </span>
            ) : null}
          </label>
        </div>
      ) : null}
      <div className="april-text-input__control">
        {leadingIcon ? (
          <span className="april-text-input__icon" aria-hidden="true">
            <span
              className={`material-symbols-outlined april-icon april-icon--${resolvedSize === "md" ? 20 : resolvedSize === "lg" ? 24 : 32}`}
            >
              {leadingIconName}
            </span>
          </span>
        ) : null}
        <input
          ref={inputRef}
          className="april-text-input__field"
          type={type}
          inputMode={inputMode}
          id={id}
          name={name || id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          maxLength={maxLength}
          pattern={pattern}
          list={list}
          disabled={isDisabled}
          readOnly={readOnly || semanticState === "loading"}
          aria-invalid={isError || undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy}
          aria-busy={semanticState === "loading" || undefined}
        />
        {showClearButton ? (
          <button
            type="button"
            className="april-text-input__clear"
            aria-label={clearLabel}
            onClick={handleClear}
          >
            <span
              className={`material-symbols-outlined april-icon april-icon--${resolvedSize === "md" ? 20 : resolvedSize === "lg" ? 24 : 32}`}
              aria-hidden="true"
            >
              close
            </span>
          </button>
        ) : trailingIcon ? (
          <span className="april-text-input__icon" aria-hidden="true">
            <span
              className={`material-symbols-outlined april-icon april-icon--${resolvedSize === "md" ? 20 : resolvedSize === "lg" ? 24 : 32}`}
            >
              {trailingIconName}
            </span>
          </span>
        ) : null}
      </div>
      {(showDescription && description) || countVisible ? (
        <div className="april-text-input__meta">
          {showDescription && description ? (
            <p className="april-text-input__description" id={`${id}-desc`}>
              {description}
            </p>
          ) : null}
          <CharacterCount id={`${id}-count`} value={value} maxLength={maxLength} type={type} />
        </div>
      ) : null}
    </div>
  );
}
