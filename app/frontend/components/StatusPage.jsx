/** Shared empty/error page used by 404 and session-expired states. */

import { Button } from "../april/components/Button"

const COPY = {
  not_found: {
    icon: "search_off",
    title: "Page not found",
    description: "This page isn't available. Head back home or open the directory."
  },
  server_error: {
    icon: "error",
    title: "Something went wrong",
    description: "Reload the page to continue."
  },
  rejected: {
    icon: "block",
    title: "Change rejected",
    description: "That request could not be completed."
  }
}

export default function StatusPage({
  variant = "not_found",
  inset = false,
  title,
  description,
  primaryLabel,
  secondaryLabel = "Back to home",
  showPrimary = false,
  showSecondary = true,
  onPrimary,
  onSecondary
}) {
  const copy = COPY[variant] || COPY.not_found

  return (
    <div
      className={["acme-status-page", inset ? "acme-status-page--inset" : ""].filter(Boolean).join(" ")}
      role={inset ? undefined : "main"}
    >
      <div className="acme-status-page__card">
        <span className="acme-status-page__icon material-symbols-outlined" aria-hidden="true">
          {copy.icon}
        </span>
        <div className="acme-status-page__copy">
          {inset ? (
            <h2 className="april-text-style april-text-style--display-sm-semibold">{title || copy.title}</h2>
          ) : (
            <h1 className="april-text-style april-text-style--display-sm-semibold">{title || copy.title}</h1>
          )}
          <p className="april-text-style april-text-style--text-md-regular">{description ?? copy.description}</p>
        </div>
        <div className="acme-status-page__actions">
          {showSecondary ? (
            <Button
              type="button"
              label={secondaryLabel}
              variant="outlined"
              size="md"
              leadingIcon={false}
              trailingIcon={false}
              onClick={onSecondary}
            />
          ) : null}
          {showPrimary ? (
            <Button
              type="button"
              label={primaryLabel}
              variant="primary"
              size="md"
              leadingIcon={false}
              trailingIcon={false}
              onClick={onPrimary}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
