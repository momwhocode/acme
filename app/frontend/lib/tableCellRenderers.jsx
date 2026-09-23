/** Shared April table cells: lead + avatar, link, actions, country flag. */

import { Button } from "../april/components/Button.jsx"
import { TableRowActionsMenu } from "../april/components/TableRowActionsMenu.jsx"
import { UserAvatar } from "../april/components/UserAvatar.jsx"
import { countryFlag, countryLabel } from "./employeesTable.js"

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

export function renderTableActions({ id, name, items = [] }) {
  return (
    <TableRowActionsMenu id={id} ariaLabel={`Actions for ${name}`} items={items} />
  )
}

export function renderCountryCell(code) {
  const flag = countryFlag(code)
  return (
    <span className="acme-country">
      {flag ? (
        <span className="acme-country__flag" aria-hidden="true">
          {flag}
        </span>
      ) : null}
      <span className="acme-country__label">{countryLabel(code)}</span>
    </span>
  )
}
