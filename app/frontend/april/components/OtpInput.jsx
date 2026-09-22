import { useId, useRef, useState } from "react";
import { resolveAprilVisualState, useInteractionState } from "../hooks/useInteractionState.js";

const SEMANTIC_STATES = ["default", "error", "disabled"];

/**
 * Editable OTP input (Figma 182:3642) — 4 cells, auto-advance, April interaction states.
 */
export function OtpInput({
  id: idProp,
  length = 4,
  label = "Enter OTP",
  showLabel = true,
  value,
  onChange,
  state = "default",
  disabled = false,
  description,
  showDescription = false,
  className = "",
  autoFocus = false,
}) {
  const uid = useId();
  const id = idProp || `otp-input-${uid}`;
  const refs = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(autoFocus ? 0 : -1);
  const { interaction, mouseBind } = useInteractionState();

  const digits = value.padEnd(length, "").slice(0, length).split("");
  const semanticState = disabled ? "disabled" : SEMANTIC_STATES.includes(state) ? state : "default";
  const cellInteraction = focusedIndex >= 0 ? "focused" : interaction;
  const visualState = resolveAprilVisualState(semanticState, cellInteraction);
  const valueEntered = Boolean(value.replace(/\s/g, ""));

  const classes = [
    "april-otp-input",
    visualState !== "default" ? `april-otp-input--${visualState}` : "",
    valueEntered ? "april-otp-input--entered" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const setDigit = (index, char) => {
    const next = digits.slice();
    next[index] = char.replace(/\D/g, "").slice(-1);
    onChange(next.join("").trimEnd());
  };

  const onInput = (index, event) => {
    const char = event.target.value.replace(/\D/g, "").slice(-1);
    setDigit(index, char);
    if (char && index < length - 1) refs.current[index + 1]?.focus();
  };

  const onKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const onPaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, length - 1);
    refs.current[focusIndex]?.focus();
    setFocusedIndex(focusIndex);
  };

  const onCellsFocus = (event) => {
    const index = refs.current.indexOf(event.target);
    if (index >= 0) setFocusedIndex(index);
  };

  const onCellsBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setFocusedIndex(-1);
    }
  };

  return (
    <div className={classes} id={id} {...mouseBind}>
      {showLabel ? (
        <label className="april-otp-input__label" htmlFor={`${id}-0`}>
          {label}
        </label>
      ) : null}
      <div
        className="april-otp-input__cells"
        role="group"
        aria-label={label}
        onPaste={onPaste}
        onFocus={onCellsFocus}
        onBlur={onCellsBlur}
      >
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className={[
              "april-otp-input__cell",
              focusedIndex === index ? "april-otp-input__cell--current" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            value={digits[index] || ""}
            onChange={(e) => onInput(index, e)}
            onKeyDown={(e) => onKeyDown(index, e)}
            id={`${id}-${index}`}
            aria-label={`Digit ${index + 1}`}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            autoFocus={autoFocus && index === 0}
            disabled={semanticState === "disabled"}
            aria-invalid={semanticState === "error" || undefined}
          />
        ))}
      </div>
      {showDescription && description ? <p className="april-otp-input__description">{description}</p> : null}
    </div>
  );
}
