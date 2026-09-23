/** Shared empty page used by the 404 route. */

import { Button } from "../april/components/Button"
import { t } from "../lib/messages"

const COPY = {
  icon: "search_off",
  title: t("errors.pageNotFound"),
  description: t("errors.pageNotFoundDescription")
}

export default function StatusPage({
  inset = false,
  title,
  description,
  primaryLabel,
  secondaryLabel = t("labels.backToHome"),
  showPrimary = false,
  showSecondary = true,
  onPrimary,
  onSecondary
}) {
  return (
    <div
      className="acme-status-page"
      role={inset ? undefined : "main"}
    >
      <div className="acme-status-page__card">
        <span className="acme-status-page__icon material-symbols-outlined" aria-hidden="true">
          {COPY.icon}
        </span>
        <div className="acme-status-page__copy">
          {inset ? (
            <h2 className="april-text-style april-text-style--display-sm-semibold">{title || COPY.title}</h2>
          ) : (
            <h1 className="april-text-style april-text-style--display-sm-semibold">{title || COPY.title}</h1>
          )}
          <p className="april-text-style april-text-style--text-md-regular">{description ?? COPY.description}</p>
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
