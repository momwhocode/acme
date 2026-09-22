import { bindMenuOptionsInRoot } from "./menuOptions.js";
import { bindTabsInRoot } from "./tabs.js";
import { bindFilterChipsInRoot } from "./filterChips.js";
import { bindModalInRoot } from "./modal.js";
import { bindDatePickerInRoot } from "./datePicker.js";

/** Bind all April DOM interactions under `root`. Returns a cleanup function. */
export function bindAprilInteractions(root) {
  const cleanups = [
    bindMenuOptionsInRoot(root),
    bindTabsInRoot(root),
    bindFilterChipsInRoot(root),
    bindModalInRoot(root),
    bindDatePickerInRoot(root),
  ];
  return () => cleanups.forEach((fn) => fn?.());
}

export { bindMenuOptions } from "./menuOptions.js";
