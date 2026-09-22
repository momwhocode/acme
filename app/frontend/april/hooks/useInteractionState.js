import { useCallback, useState } from "react";

const PRIORITY = ["focused", "active", "hover"];

/**
 * Tracks hover / press / focus for April visual state modifiers (--focused, etc.).
 * @param {{ keyboardFocusOnly?: boolean }} options
 *   When true, focus styling applies only for keyboard focus (`:focus-visible`), not mouse clicks.
 */
export function useInteractionState({ keyboardFocusOnly = false } = {}) {
  const [flags, setFlags] = useState({ hover: false, active: false, focused: false });

  const setFlag = useCallback((key, value) => {
    setFlags((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
  }, []);

  const interaction = PRIORITY.find((key) => flags[key]) || null;

  const mouseBind = {
    onMouseEnter: () => setFlag("hover", true),
    onMouseLeave: () => {
      setFlags((prev) => ({ ...prev, hover: false, active: false }));
    },
    onMouseDown: () => setFlag("active", true),
    onMouseUp: () => setFlag("active", false),
  };

  const focusBind = {
    onFocus: (event) => {
      if (!keyboardFocusOnly || event.currentTarget.matches(":focus-visible")) {
        setFlag("focused", true);
      }
    },
    onBlur: () => setFlag("focused", false),
  };

  return { interaction, mouseBind, focusBind };
}

/** Maps pointer interaction flags to April `data-state` attribute values. */
export function aprilButtonDataState(interaction, isDisabled) {
  if (isDisabled || !interaction) return undefined;
  return interaction === "active" ? "active-pressed" : interaction;
}

/** Blur after mouse click so buttons do not keep :focus; keyboard activation (detail 0) keeps focus. */
export function blurOnMouseClick(onClick) {
  return (event) => {
    onClick?.(event);
    if (event.detail > 0) {
      event.currentTarget.blur();
    }
  };
}

/** Semantic state wins over pointer/focus interaction. */
export function resolveAprilVisualState(semanticState, interaction) {
  if (semanticState === "error" || semanticState === "disabled" || semanticState === "loading") {
    return semanticState;
  }
  if (interaction === "focused" || interaction === "active" || interaction === "hover") {
    return interaction;
  }
  return "default";
}
