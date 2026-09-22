import { Alert } from "./Alert.jsx";

/** Shared load-error panel — April Alert + Retry. */
export function PageLoadError({ title, onRetry, retryLabel = "Retry", className = "" }) {
  return (
    <div className={["april-page-load-error", className].filter(Boolean).join(" ")}>
      <Alert
        color="red"
        inline
        title={title}
        showDescription={false}
        dismissible={false}
        showButtons={Boolean(onRetry)}
        showSecondaryButton={false}
        primaryAction={retryLabel}
        onPrimaryAction={onRetry}
      />
    </div>
  );
}
