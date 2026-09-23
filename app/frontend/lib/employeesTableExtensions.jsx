/** Directory row cells — lead, country, pay, and row actions. */

import { employeeRowMenuItems } from "./employeesTable.js"
import { renderCountryCell, renderTableActions, renderTableLead } from "./tableCellRenderers.jsx"

export function createEmployeesTableExtensions({ onDetails, onOffboard, onRehire, onDelete }) {
  return {
    renderBodyContent(column, row) {
      if (column.id === "country") return renderCountryCell(row.country)

      if (column.kind === "lead") {
        return renderTableLead({
          name: row.name,
          user: row,
          onClick: () => onDetails?.(row)
        })
      }

      if (column.kind !== "actions") return undefined

      return renderTableActions({
        id: `employee-row-${row.id}`,
        name: row.name,
        items: employeeRowMenuItems(row, { onDetails, onOffboard, onRehire, onDelete })
      })
    }
  }
}
