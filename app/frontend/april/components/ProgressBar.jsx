import { Spinner } from "./Spinner.jsx";

const PROGRESS_LABEL_VARIANTS = ["default", "none", "inline"];

function ProgressTrack({ value }) {
  return (
    <div
      className="april-progress-bar__track"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="april-progress-bar__fill" style={{ width: `${value}%` }} />
    </div>
  );
}

function ProgressLabelRow({ label, showInfoIcon = true }) {
  return (
    <div className="april-progress-bar__label-row">
      <span className="april-progress-bar__label">{label}</span>
      {showInfoIcon ? (
        <span className="april-progress-bar__info material-symbols-outlined" aria-hidden="true">
          info
        </span>
      ) : null}
    </div>
  );
}

function ProgressIndicator({ value, showSpinner = true }) {
  return (
    <div className="april-progress-bar__indicator">
      <span className="april-progress-bar__indicator-text">{value}%</span>
      {showSpinner ? <Spinner size="16" /> : null}
    </div>
  );
}

/** Progress bar — Figma feedback */
export function ProgressBar({
  labels = "default",
  value = 50,
  label = "Label",
  helperText = "Helper text",
  showLabel = true,
  showHelperText = true,
  showIndicator = true,
  showSpinner = true,
  className = "",
}) {
  const resolvedLabels = labels === "none" ? "none" : labels === "inline" ? "inline" : "default";

  if (resolvedLabels === "none") {
    return (
      <div
        className={["april-progress-bar", "april-progress-bar--none", className].filter(Boolean).join(" ")}
      >
        <ProgressTrack value={value} />
        {showHelperText ? <p className="april-progress-bar__helper">{helperText}</p> : null}
      </div>
    );
  }

  if (resolvedLabels === "inline") {
    return (
      <div
        className={["april-progress-bar", "april-progress-bar--inline", className].filter(Boolean).join(" ")}
      >
        {showLabel ? <ProgressLabelRow label={label} /> : null}
        <ProgressTrack value={value} />
        {showIndicator ? <ProgressIndicator value={value} showSpinner={showSpinner} /> : null}
      </div>
    );
  }

  return (
    <div
      className={["april-progress-bar", "april-progress-bar--default", className].filter(Boolean).join(" ")}
    >
      {showLabel ? (
        <div className="april-progress-bar__header">
          <ProgressLabelRow label={label} />
          {showIndicator ? <ProgressIndicator value={value} showSpinner={showSpinner} /> : null}
        </div>
      ) : null}
      <ProgressTrack value={value} />
      {showHelperText ? <p className="april-progress-bar__helper">{helperText}</p> : null}
    </div>
  );
}

export function ProgressBarGallery() {
  return (
    <div style={{ display: "grid", gap: 32, padding: 24, maxWidth: 400 }}>
      {PROGRESS_LABEL_VARIANTS.map((variant) => (
        <section key={variant}>
          <h3
            style={{
              margin: "0 0 12px",
              font: "600 12px/1.4 Inter,sans-serif",
              color: "#6a7282",
              textTransform: "capitalize",
            }}
          >
            {variant}
          </h3>
          <ProgressBar labels={variant} />
        </section>
      ))}
    </div>
  );
}
