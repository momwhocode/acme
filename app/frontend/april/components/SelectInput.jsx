import { useId } from "react";
import { resolveAprilVisualState, useInteractionState } from "../hooks/useInteractionState.js";
import { SELECT_INPUT_SIZES, resolveSelectInputPlaygroundArgs } from "../renderers/select-input.js";
import { Spinner } from "./Spinner.jsx";

const ICON_SIZES = { md: 20, lg: 24, xl: 32 };

function SelectIcon({ name, size }) {
  const px = ICON_SIZES[size] || 20;
  return (
    <span
      className="material-symbols-outlined april-icon"
      style={{ fontSize: `var(--icon-size-icon-${px})` }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

/** Select input trigger — Figma 39:5749 */
export function SelectInput({
  size = "md",
  state = "default",
  valueEntered = false,
  label = "Input Label",
  requiredText = "*",
  showRequired = false,
  showLabel = true,
  placeholder = "Placeholder text",
  value = "Selected value",
  description = "Help / Error Description.",
  showDescription = true,
  leadingIcon = true,
  caretIcon = true,
  leadingIconName = "add",
  caretIconName = "keyboard_arrow_down",
  fullWidth = false,
  id: idProp,
  className = "",
  onClick,
}) {
  const uid = useId();
  const id = idProp || `select-input-${uid}`;
  const resolvedSize = SELECT_INPUT_SIZES.includes(size) ? size : "md";
  const { interaction, mouseBind, focusBind } = useInteractionState();
  const visualState = resolveAprilVisualState(state, interaction);
  const isLoading = state === "loading";
  const disabled = state === "disabled" || isLoading;
  const displayText = valueEntered ? value : placeholder;
  const showCaret = caretIcon && !isLoading;

  const classes = [
    "april-select-input",
    `april-select-input--${resolvedSize}`,
    visualState !== "default" ? `april-select-input--${visualState}` : "",
    valueEntered ? "april-select-input--entered" : "",
    fullWidth ? "april-select-input--full-width" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} id={id}>
      {showLabel ? (
        <div className="april-select-input__label-row">
          <label className="april-select-input__label" htmlFor={`${id}-trigger`}>
            {label}
          </label>
          {showRequired ? <span className="april-select-input__required">{requiredText}</span> : null}
        </div>
      ) : null}
      <div className="april-select-input__control">
        {leadingIcon ? (
          <span className="april-select-input__icon">
            <SelectIcon name={leadingIconName} size={resolvedSize} />
          </span>
        ) : null}
        <button
          type="button"
          className="april-select-input__trigger"
          id={`${id}-trigger`}
          disabled={disabled}
          aria-busy={isLoading || undefined}
          aria-haspopup="listbox"
          onClick={onClick}
          {...mouseBind}
          {...focusBind}
        >
          <span className="april-select-input__value" title={displayText || undefined}>
            {displayText}
          </span>
        </button>
        {isLoading ? (
          <span className="april-select-input__spinner">
            <Spinner size={String(ICON_SIZES[resolvedSize] || 20)} decorative />
          </span>
        ) : null}
        {showCaret ? (
          <span className="april-select-input__caret">
            <SelectIcon name={caretIconName} size={resolvedSize} />
          </span>
        ) : null}
      </div>
      {showDescription ? <p className="april-select-input__description">{description}</p> : null}
    </div>
  );
}

export function SelectInputPlayground(args) {
  const props = resolveSelectInputPlaygroundArgs(args);
  return (
    <div className="april-select-input-playground">
      <div className="april-select-input-playground__frame">
        <SelectInput {...props} />
      </div>
    </div>
  );
}
