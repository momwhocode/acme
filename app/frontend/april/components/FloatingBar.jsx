import { Button } from "./Button.jsx";
import { IconButton } from "./IconButton.jsx";
import { MenuButtonDropdown } from "./MenuButtonDropdown.jsx";

const DEFAULT_ACTIONS = [
  { id: "change-plan", label: "Change Plan", leadingIcon: "add" },
  { id: "download", label: "Download", leadingIcon: "add" },
];

function FloatingBarDivider() {
  return <span className="april-floating-bar__divider" aria-hidden="true" />;
}

function FloatingBarSlot({ children, icon = false }) {
  return (
    <div
      className={["april-floating-bar__slot", icon ? "april-floating-bar__slot--icon" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

function FloatingBarAction({ action, onActionClick }) {
  if (Array.isArray(action.items) && action.items.length > 0) {
    return (
      <MenuButtonDropdown
        id={`floating-bar-action-${action.id ?? action.label}`}
        label={action.label}
        variant="ghost"
        size="sm"
        leadingIconName={action.leadingIcon ?? "add"}
        showLeadingIcon={Boolean(action.leadingIcon)}
        items={action.items}
        align="start"
        placement="top"
        portal
        className="april-floating-bar__menu-action"
      />
    );
  }

  return (
    <Button
      label={action.label}
      variant="ghost"
      size="sm"
      type="button"
      leadingIcon={Boolean(action.leadingIcon)}
      icon={action.leadingIcon ?? "add"}
      trailingIcon={false}
      onClick={() => onActionClick?.(action)}
    />
  );
}

/** Bulk selection floating bar — Figma April System 925:2201 */
export function FloatingBar({
  selection = "3 of 8 Selected",
  selectionDismiss = true,
  actions = DEFAULT_ACTIONS,
  showDelete = true,
  deleteIcon = "delete",
  deleteAriaLabel = "Delete selected items",
  moreLabel = "More",
  showMore = true,
  message = null,
  className = "",
  onClearSelection,
  onActionClick,
  onDelete,
  onMore,
}) {
  const resolvedSelection = message ?? selection;

  return (
    <div
      className={["april-floating-bar", className].filter(Boolean).join(" ")}
      role="toolbar"
      aria-label="Bulk actions"
    >
      <FloatingBarSlot>
        <Button
          label={resolvedSelection}
          variant="ghost"
          size="sm"
          type="button"
          leadingIcon={false}
          trailingIcon={selectionDismiss}
          trailingIconName="close"
          state="active-pressed"
          className="april-floating-bar__selection-btn"
          onClick={selectionDismiss ? onClearSelection : undefined}
          aria-label={selectionDismiss ? "Clear selection" : resolvedSelection}
        />
      </FloatingBarSlot>

      {actions.map((action) => (
        <div key={action.id ?? action.label} className="april-floating-bar__group">
          <FloatingBarDivider />
          <FloatingBarSlot>
            <FloatingBarAction action={action} onActionClick={onActionClick} />
          </FloatingBarSlot>
        </div>
      ))}

      {showDelete ? (
        <div className="april-floating-bar__group">
          <FloatingBarDivider />
          <FloatingBarSlot icon>
            <IconButton
              variant="ghost"
              size="sm"
              icon={deleteIcon}
              ariaLabel={deleteAriaLabel}
              className="april-floating-bar__delete-btn"
              onClick={onDelete}
            />
          </FloatingBarSlot>
        </div>
      ) : null}

      {showMore ? (
        <div className="april-floating-bar__group">
          <FloatingBarDivider />
          <FloatingBarSlot>
            <Button
              label={moreLabel}
              variant="ghost"
              size="sm"
              type="button"
              leadingIcon={false}
              trailingIcon
              trailingIconName="more_horiz"
              onClick={onMore}
            />
          </FloatingBarSlot>
        </div>
      ) : null}
    </div>
  );
}
