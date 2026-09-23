import { renderTableActions, renderTableLead } from "./tableCellRenderers.jsx"

export function createEmployeesTableExtensions({ onDetails }) {
  return {
    renderBodyContent(column, row) {
      if (column.kind === "lead") {
        return renderTableLead({
          name: row.name,
          user: {
            id: row.id,
            name: row.name,
            initials: `${row.first_name?.[0] || ""}${row.last_name?.[0] || ""}`.toUpperCase()
          },
          onClick: () => onDetails?.(row)
        })
      }

      if (column.kind !== "actions") return undefined

      return renderTableActions({
        id: `employee-row-${row.id}`,
        name: row.name,
        onDetails: () => onDetails?.(row)
      })
    }
  }
}
