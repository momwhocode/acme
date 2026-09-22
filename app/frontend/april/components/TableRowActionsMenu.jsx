import { Button } from "./Button.jsx";
import { IconMenuDropdown } from "./IconMenuDropdown.jsx";

/** Table row actions — optional Details button + three-dot overflow menu */
export function TableRowActionsMenu({ id, ariaLabel, items = [], onDetails, detailsLabel = "Details" }) {
  if (!items.length && !onDetails) return null;

  return (
    <div className="april-table__actions">
      {onDetails ? (
        <Button
          label={detailsLabel}
          variant="outlined"
          size="sm"
          leadingIcon={false}
          trailingIcon={false}
          onClick={onDetails}
        />
      ) : null}
      {items.length > 0 ? <IconMenuDropdown id={id} ariaLabel={ariaLabel} items={items} /> : null}
    </div>
  );
}
