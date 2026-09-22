/**
 * Canonical inline field error props for April inputs.
 * Red border + red description when invalid.
 */
export function fieldErrorProps(fieldErrors, key, { fallbackState = "default" } = {}) {
  const error = fieldErrors?.[key];
  if (error) {
    return {
      state: "error",
      showDescription: true,
      description: error,
    };
  }
  return {
    state: fallbackState,
    showDescription: false,
    description: undefined,
  };
}
