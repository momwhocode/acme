import { useEffect, useRef, useState } from "react";
import { MODAL_CONTENT_SIZES, resolveModalPlaygroundArgs } from "../renderers/modal.js";
import { Button } from "./Button.jsx";
import { IconButton } from "./IconButton.jsx";
import { TextInput } from "./TextInput.jsx";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isContentModalSize(size) {
  return MODAL_CONTENT_SIZES.includes(size);
}

function ModalCloseButton({ onClick }) {
  return (
    <div className="april-modal__close">
      <IconButton variant="ghost" size="md" icon="close" ariaLabel="Close" onClick={onClick} />
    </div>
  );
}

function ModalHeader({ title, icon, leading, onClose }) {
  return (
    <header className="april-modal__header">
      <div className="april-modal__title-group">
        {leading ? (
          <span className="april-modal__leading">{leading}</span>
        ) : icon ? (
          <span className="april-modal__icon material-symbols-outlined" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <h2
          className="april-modal__title april-text-style april-text-style--text-lg-semibold"
          id="april-modal-title"
        >
          {title}
        </h2>
      </div>
      <ModalCloseButton onClick={onClose} />
    </header>
  );
}

function ModalEmptyContainer() {
  return (
    <div className="april-modal__container april-modal__container--empty" data-april-modal-container>
      <div className="april-modal__container-placeholder" aria-hidden="true" />
    </div>
  );
}

function ModalFooter({
  size,
  cancel,
  confirm,
  resetLabel,
  showReset,
  onCancel,
  onConfirm,
  onReset,
  confirmDisabled = false,
  confirmLoading = false,
  confirmVariant,
}) {
  const contentModal = isContentModalSize(size);
  const resolvedConfirmVariant = confirmVariant ?? (contentModal ? "primary" : "destructive");

  return (
    <footer
      className={["april-modal__footer", contentModal && showReset ? "april-modal__footer--split" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      {contentModal && showReset ? (
        <Button
          label={resetLabel}
          variant="ghost"
          size="md"
          leadingIcon={false}
          trailingIcon={false}
          onClick={onReset}
        />
      ) : null}
      <div className="april-modal__actions">
        <Button
          label={cancel}
          variant="outlined"
          size="md"
          leadingIcon={false}
          trailingIcon={false}
          onClick={onCancel}
        />
        <Button
          label={confirm}
          variant={resolvedConfirmVariant}
          size="md"
          leadingIcon={false}
          trailingIcon={false}
          onClick={onConfirm}
          disabled={confirmDisabled}
          loading={confirmLoading}
        />
      </div>
    </footer>
  );
}

/** Modal shell — confirmation (`sm`) or content (`md`/`lg`) with optional children. */
export function Modal({
  size = "sm",
  showConfirmInput = true,
  title,
  description = "",
  icon,
  leading = null,
  showDescription = true,
  cancel = "Cancel",
  confirm,
  resetLabel,
  showReset,
  confirmPlaceholder = "Confirm",
  backdrop = true,
  className = "",
  onCancel,
  onConfirm,
  onReset,
  confirmDisabled = false,
  confirmLoading = false,
  confirmVariant,
  showFooter = true,
  subheader = null,
  footer = null,
  children = null,
}) {
  const [confirmText, setConfirmText] = useState("");
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const props = resolveModalPlaygroundArgs({
    size,
    showConfirmInput,
    title,
    description,
    icon,
    showDescription,
    cancel,
    confirm,
    resetLabel,
    showReset,
    confirmPlaceholder,
    backdrop,
  });

  const contentContainer = isContentModalSize(props.size) ? (children ?? <ModalEmptyContainer />) : children;
  const contentClass = isContentModalSize(props.size) ? " april-modal--content" : "";
  const requiresConfirmText = props.showConfirmInput;
  const isConfirmDisabled =
    confirmDisabled || (requiresConfirmText && confirmText !== props.confirmPlaceholder);

  useEffect(() => {
    if (!props.backdrop) return undefined;

    previouslyFocusedRef.current = typeof document !== "undefined" ? document.activeElement : null;

    const focusables = () =>
      Array.from(dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) || []).filter(
        (node) => node.offsetParent !== null || node === document.activeElement
      );

    requestAnimationFrame(() => {
      const nodes = focusables();
      const autofocus = dialogRef.current?.querySelector("[autofocus], [data-autofocus]");
      (autofocus || nodes[0])?.focus?.();
    });

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel?.();
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = focusables();
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      const previous = previouslyFocusedRef.current;
      if (previous && typeof previous.focus === "function") {
        previous.focus();
      }
    };
  }, [props.backdrop, onCancel]);

  const handleBackdropClick = (event) => {
    if (event.target !== event.currentTarget) return;
    onCancel?.();
  };

  const dialog = (
    <div
      ref={dialogRef}
      className={[
        "april-modal",
        `april-modal--${props.size}`,
        contentClass,
        !showFooter ? "april-modal--no-footer" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="april-modal-title"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="april-modal__inner">
        <ModalHeader title={props.title} icon={props.icon} leading={leading} onClose={onCancel} />
        {subheader}
        <div className="april-modal__body">
          {props.showDescription && props.description ? (
            <p className="april-modal__description april-text-style april-text-style--text-sm-regular">
              {props.description}
            </p>
          ) : null}
          {props.showConfirmInput ? (
            <div className="april-modal__confirm-input">
              <TextInput
                showLabel={false}
                showDescription={false}
                placeholder={props.confirmPlaceholder}
                id="modal-confirm-input"
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
              />
            </div>
          ) : null}
          {contentContainer}
        </div>
        {showFooter ? (
          footer ? (
            <footer className="april-modal__footer">{footer}</footer>
          ) : (
            <ModalFooter
              size={props.size}
              cancel={props.cancel}
              confirm={props.confirm}
              resetLabel={props.resetLabel}
              showReset={props.showReset}
              onCancel={onCancel}
              onConfirm={onConfirm}
              onReset={onReset}
              confirmDisabled={isConfirmDisabled}
              confirmLoading={confirmLoading}
              confirmVariant={confirmVariant}
            />
          )
        ) : null}
      </div>
    </div>
  );

  if (!props.backdrop) {
    return <div className="april-modal-playground__frame">{dialog}</div>;
  }

  return (
    <div
      className="april-modal-backdrop april-modal-backdrop--fixed"
      data-controller="april-modal"
      onClick={handleBackdropClick}
    >
      {dialog}
    </div>
  );
}

export function ModalPlayground({ children, ...args }) {
  const props = resolveModalPlaygroundArgs({ ...args, backdrop: false });
  return (
    <div className="april-modal-playground">
      <Modal {...props}>{children}</Modal>
    </div>
  );
}
