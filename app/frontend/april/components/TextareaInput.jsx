import { useId } from "react";
import { resolveAprilVisualState, useInteractionState } from "../hooks/useInteractionState.js";
import { CharacterCount, shouldShowCharacterCount } from "./CharacterCount.jsx";

export function TextareaInput({
  id: idProp,
  state = "default",
  label,
  required = false,
  requiredText = "*",
  showLabel = true,
  placeholder = "",
  value = "",
  onChange,
  onBlur,
  onSelect,
  rows = 4,
  maxLength,
  description,
  showDescription = false,
  fullWidth = false,
  disabled = false,
  readOnly = false,
  className = "",
}) {
  const uid = useId();
  const id = idProp || `textarea-input-${uid}`;
  const semanticState = disabled ? "disabled" : state === "error" ? "error" : "default";
  const { interaction, mouseBind, focusBind } = useInteractionState();
  const visualState = resolveAprilVisualState(semanticState, interaction);
  const valueEntered = Boolean(value);
  const isDisabled = semanticState === "disabled";
  const isError = semanticState === "error";
  const countVisible = shouldShowCharacterCount(maxLength);
  const describedBy =
    [showDescription && description ? `${id}-desc` : null, countVisible ? `${id}-count` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const classes = [
    "april-textarea-input",
    `april-textarea-input--${visualState}`,
    valueEntered ? "april-textarea-input--entered" : "",
    fullWidth ? "april-textarea-input--full-width" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleBlur = (event) => {
    focusBind.onBlur(event);
    onBlur?.(event);
  };

  return (
    <div className={classes} {...mouseBind}>
      {showLabel && label ? (
        <div className="april-textarea-input__label-row">
          <label className="april-textarea-input__label" htmlFor={id}>
            {label}
            {required ? (
              <span className="april-textarea-input__required" aria-hidden="true">
                {requiredText}
              </span>
            ) : null}
          </label>
        </div>
      ) : null}
      <div className="april-textarea-input__control">
        <textarea
          className="april-textarea-input__field"
          id={id}
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onSelect={onSelect}
          maxLength={maxLength}
          disabled={isDisabled}
          readOnly={readOnly}
          aria-invalid={isError || undefined}
          aria-required={required || undefined}
          aria-describedby={describedBy}
          onFocus={focusBind.onFocus}
          onBlur={handleBlur}
        />
      </div>
      {(showDescription && description) || countVisible ? (
        <div className="april-textarea-input__meta">
          {showDescription && description ? (
            <p className="april-textarea-input__description" id={`${id}-desc`}>
              {description}
            </p>
          ) : null}
          <CharacterCount id={`${id}-count`} value={value} maxLength={maxLength} />
        </div>
      ) : null}
    </div>
  );
}
