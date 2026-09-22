export const SPINNER_SIZES = ["12", "16", "20", "24", "32"];

/** Branded loader used in buttons, fields, and compact busy states. */
export function Spinner({ size = "20", decorative = true, className = "" }) {
  const resolvedSize = String(size);
  const classes = ["april-spinner", `april-spinner--${resolvedSize}`, className].filter(Boolean).join(" ");

  return (
    <span
      className={classes}
      aria-hidden={decorative ? "true" : undefined}
      role={decorative ? undefined : "status"}
      aria-label={decorative ? undefined : "Loading"}
    >
      <span className="app-loader-mark" />
    </span>
  );
}
