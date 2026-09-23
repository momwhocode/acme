import { IconMenuDropdown } from "./IconMenuDropdown.jsx";

/** Table row three-dot overflow menu */
export function TableRowActionsMenu({ id, ariaLabel, items = [] }) {
  if (!items.length) return null;

  return (
    <div className="april-table__actions">
      <IconMenuDropdown id={id} ariaLabel={ariaLabel} items={items} variant="outlined" size="sm" />
    </div>
  );
}
