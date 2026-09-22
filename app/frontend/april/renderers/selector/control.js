export const SELECTOR_TYPES = ["checkbox", "radio", "switch"];
export const SELECTOR_STATES = ["default", "hover", "active", "focused", "disabled"];

export function normalizeState(state) {
  if (state === "pressed/active") return "active";
  return state;
}
