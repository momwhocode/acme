import { Button } from "../april/components/Button.jsx"
import { TableRowActionsMenu } from "../april/components/TableRowActionsMenu.jsx"
import { UserAvatar } from "../april/components/UserAvatar.jsx"

export function renderTableLink(label, onClick) {
  return (
    <Button
      label={label}
      variant="link"
      size="md"
      leadingIcon={false}
      trailingIcon={false}
      onClick={onClick}
    />
  )
}

export function renderTableLead({ name, user, onClick }) {
  const link = renderTableLink(name, onClick)
  if (!user) return link
  return (
    <div className="april-table__lead">
      <UserAvatar user={user} size="md" />
      {link}
    </div>
  )
}

export function renderTableActions({ id, name, onDetails, items = [] }) {
  return (
    <TableRowActionsMenu id={id} ariaLabel={`Actions for ${name}`} onDetails={onDetails} items={items} />
  )
}
