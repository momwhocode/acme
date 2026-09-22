import { Modal } from "./Modal.jsx";
import { buildDeleteConfirmCopy } from "../../lib/deleteConfirmCopy.js";

export { buildDeleteConfirmCopy };

/** Destructive delete/archive confirmation — sm modal pattern (title + description). */
export function ConfirmDeleteModal({
  open = true,
  title,
  description,
  entity,
  count,
  itemName,
  consequence,
  confirmLabel,
  confirm,
  icon,
  cancelLabel = "Cancel",
  onCancel,
  onConfirm,
  confirmLoading = false,
}) {
  if (!open) return null;

  const built =
    title != null && description != null
      ? null
      : entity
        ? buildDeleteConfirmCopy({ entity, count, itemName, consequence })
        : null;

  const resolvedTitle = title ?? built?.title;
  const resolvedDescription = description ?? built?.description ?? "";
  const resolvedConfirm = confirm ?? confirmLabel ?? built?.confirmLabel ?? "Delete";
  const resolvedIcon = icon ?? built?.icon ?? "delete";

  return (
    <Modal
      backdrop
      size="sm"
      icon={resolvedIcon}
      title={resolvedTitle}
      description={resolvedDescription}
      showConfirmInput={false}
      showReset={false}
      cancel={cancelLabel}
      confirm={resolvedConfirm}
      onCancel={onCancel}
      onConfirm={onConfirm}
      confirmLoading={confirmLoading}
    />
  );
}
