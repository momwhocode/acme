import { useEffect, useEffectEvent } from "react";
import { Alert } from "./Alert.jsx";

/** Default auto-dismiss window for page toasts (success/error). */
export const PAGE_TOAST_AUTO_DISMISS_MS = 4000;

/** Fixed bottom-center toast — composes `Alert` with `toast` variant */
export function PageToast({
  color = "green",
  title,
  description = null,
  showDescription = description != null && description !== "",
  action = null,
  onAction,
  onDismiss,
  autoDismiss = true,
  autoDismissMs = PAGE_TOAST_AUTO_DISMISS_MS,
}) {
  const dismiss = useEffectEvent(() => {
    onDismiss?.();
  });

  useEffect(() => {
    if (!title || !autoDismiss) return undefined;

    const timer = window.setTimeout(() => {
      dismiss();
    }, autoDismissMs);

    return () => window.clearTimeout(timer);
  }, [title, description, color, autoDismiss, autoDismissMs, dismiss]);

  if (!title) return null;

  return (
    <div className="april-page-toast">
      <Alert
        color={color}
        title={title}
        description={description}
        toast
        dismissible
        showButtons={Boolean(action)}
        showSecondaryButton={false}
        action={action}
        showDescription={showDescription}
        onPrimaryAction={onAction}
        onDismiss={onDismiss}
      />
    </div>
  );
}
