export const MODAL_SIZES = ["sm", "md", "lg"];

/** Content modals use `md` (400px) or `lg` (600px); `sm` is the compact confirmation pattern. */
export const MODAL_CONTENT_SIZES = ["md", "lg"];

function isContentModalSize(size) {
  return MODAL_CONTENT_SIZES.includes(size);
}

export function resolveModalSize(size) {
  return MODAL_SIZES.includes(size) ? size : "sm";
}

const DEFAULT_TITLES = {
  sm: "Modal Title?",
  md: "Modal Title",
  lg: "Modal Title",
};

const DEFAULT_ICONS = {
  sm: "delete",
  md: "apps",
  lg: "apps",
};

const DEFAULT_CONFIRM = {
  sm: "Delete",
  md: "Continue",
  lg: "Continue",
};

export function resolveModalPlaygroundArgs({
  size = "sm",
  showConfirmInput = true,
  title = null,
  description = "",
  icon = null,
  showDescription = true,
  cancel = "Cancel",
  confirm = null,
  resetLabel = null,
  showReset = null,
  confirmPlaceholder = "Confirm",
  backdrop = false,
} = {}) {
  const resolvedSize = resolveModalSize(size);
  const contentModal = isContentModalSize(resolvedSize);

  return {
    size: resolvedSize,
    showConfirmInput: resolvedSize === "sm" && showConfirmInput,
    title: title ?? DEFAULT_TITLES[resolvedSize],
    description,
    icon: icon ?? DEFAULT_ICONS[resolvedSize],
    showDescription,
    cancel,
    confirm: confirm ?? DEFAULT_CONFIRM[resolvedSize],
    resetLabel: resetLabel ?? "Reset All",
    showReset: showReset ?? contentModal,
    confirmPlaceholder,
    backdrop,
  };
}
