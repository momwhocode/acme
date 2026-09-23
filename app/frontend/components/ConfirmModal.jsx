/** Shared sm confirmation — delete, leave, and other destructive Home/directory actions. */

import { Modal } from "../april/components/Modal"

export default function ConfirmModal({
  title,
  description,
  confirm = "Confirm",
  confirmVariant = "destructive",
  confirmLoading = false,
  onCancel,
  onConfirm
}) {
  return (
    <Modal
      backdrop
      size="sm"
      icon="warning"
      title={title}
      description={description}
      showDescription={Boolean(description)}
      showConfirmInput={false}
      showReset={false}
      cancel="Cancel"
      confirm={confirm}
      confirmVariant={confirmVariant}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  )
}
