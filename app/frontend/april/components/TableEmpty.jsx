import { Button } from "./Button.jsx";

const DEFAULT_EMPTY = {
  title: "No items yet",
  description: "There's nothing here yet. Add your first entry to get started.",
  action: "Add new",
  icon: "table_rows",
  regionLabel: "Empty list",
};

/** Table empty state — framed panel with optional action. */
export function TableEmpty({
  title,
  description,
  actionLabel,
  icon,
  showAction = true,
  onAction,
  regionLabel,
  className = "",
}) {
  const resolvedTitle = title ?? DEFAULT_EMPTY.title;
  const resolvedDescription = description ?? DEFAULT_EMPTY.description;
  const resolvedAction = actionLabel ?? DEFAULT_EMPTY.action;
  const resolvedIcon = icon ?? DEFAULT_EMPTY.icon;
  const resolvedRegion = regionLabel ?? DEFAULT_EMPTY.regionLabel;

  return (
    <div className={["april-table-shell", "april-table-shell--empty", className].filter(Boolean).join(" ")}>
      <div className="april-table-empty-area" role="region" aria-label={resolvedRegion}>
        <div className="april-table-empty april-table-empty--framed">
          <div className="april-table-empty__icon" aria-hidden="true">
            <span
              className="material-symbols-outlined april-icon"
              style={{ fontSize: "var(--icon-size-icon-24)" }}
            >
              {resolvedIcon}
            </span>
          </div>
          <div className="april-table-empty__copy">
            <h3 className="april-text-style april-text-style--text-md-semibold april-table-empty__title">
              {resolvedTitle}
            </h3>
            <p className="april-text-style april-text-style--text-xs-regular april-table-empty__description">
              {resolvedDescription}
            </p>
          </div>
          {showAction ? (
            <Button
              label={resolvedAction}
              variant="primary"
              size="md"
              leadingIcon
              trailingIcon={false}
              icon="add"
              onClick={onAction}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
