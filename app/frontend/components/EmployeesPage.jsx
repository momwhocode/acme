import { useEffect, useMemo, useState } from "react"
import { Outlet, useNavigate, useSearchParams } from "react-router-dom"
import { FloatingBar } from "../april/components/FloatingBar"
import { ListingTableCard } from "../april/components/ListingTableCard"
import { PageLoadError } from "../april/components/PageLoadError"
import { PageTitleNavHeader } from "../april/components/PageTitleNavHeader"
import { PageToast } from "../april/components/PageToast"
import ImportEmployeesModal from "./ImportEmployeesModal"
import OffboardEmployeeModal from "./OffboardEmployeeModal"
import OnboardEmployeeModal from "./OnboardEmployeeModal"
import { importToastTitle } from "../lib/employees"
import { createEmployeesTableExtensions } from "../lib/employeesTableExtensions"
import {
  EMPLOYEES_TABLE_COLUMNS,
  downloadSelectedEmployees,
  employeeColumnOptions,
  visibleEmployeeColumns
} from "../lib/employeesTable"
import { createColumnToggleHandler } from "../lib/tableColumns"
import { useTableRowSelection } from "../lib/tableSelection"
import { useEmployeesDirectory } from "../lib/useEmployeesDirectory"

export default function EmployeesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const directory = useEmployeesDirectory()
  const [onboardOpen, setOnboardOpen] = useState(() => searchParams.get("onboard") === "1")
  const [importOpen, setImportOpen] = useState(false)
  const [offboardRow, setOffboardRow] = useState(null)
  const [toast, setToast] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const { selection, selectedCount } = useTableRowSelection(directory.rows, selectedIds, setSelectedIds)

  useEffect(() => {
    if (searchParams.get("onboard") !== "1") return
    const next = new URLSearchParams(searchParams)
    next.delete("onboard")
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const rowIdsKey = directory.rows.map((row) => row.id).join(",")
  useEffect(() => {
    setSelectedIds([])
  }, [rowIdsKey])

  const extensions = useMemo(
    () =>
      createEmployeesTableExtensions({
        onDetails: (row) => navigate(`/employees/${row.id}`),
        onOffboard: setOffboardRow
      }),
    [navigate]
  )
  const onColumnToggle = useMemo(
    () => createColumnToggleHandler(EMPLOYEES_TABLE_COLUMNS, directory.setVisibleColumnIds),
    [directory.setVisibleColumnIds]
  )
  const selectedRows = directory.rows.filter((row) => selectedIds.includes(row.id))

  return (
    <section className="superadmin-page superadmin-page--listing acme-listing">
      <PageTitleNavHeader
        pageTitle="Employees"
        id="employees-title"
        showSecondaryButton
        secondaryButtonLabel="Import"
        secondaryIcon="upload"
        onSecondary={() => setImportOpen(true)}
        showPrimaryButton
        primaryButtonLabel="Onboard Employee"
        primaryIcon="person_add"
        onPrimary={() => setOnboardOpen(true)}
      />
      {importOpen ? (
        <ImportEmployeesModal
          onCancel={() => setImportOpen(false)}
          onSuccess={(result) => {
            setImportOpen(false)
            setToast({ title: importToastTitle(result) })
            directory.retry()
          }}
        />
      ) : null}
      {onboardOpen ? (
        <OnboardEmployeeModal
          onCancel={() => setOnboardOpen(false)}
          onSuccess={() => {
            setOnboardOpen(false)
            setToast({ title: "Employee onboarded" })
            directory.retry()
          }}
        />
      ) : null}
      {offboardRow ? (
        <OffboardEmployeeModal
          employee={offboardRow.employee}
          onCancel={() => setOffboardRow(null)}
          onSuccess={() => {
            setOffboardRow(null)
            setToast({ title: "Marked as left" })
            directory.retry()
          }}
        />
      ) : null}
      <PageToast
        title={toast?.title}
        color="green"
        onDismiss={() => setToast(null)}
      />
      <div className="superadmin-page__table">
        {directory.error && !directory.rows.length ? (
          <PageLoadError title="Couldn't load employees" onRetry={directory.retry} />
        ) : (
          <ListingTableCard
            id="employees-table"
            filterChips={directory.filterChips}
            filterValues={directory.filterValues}
            searchValue={directory.searchValue}
            searchPlaceholder="Search name or email"
            columnOptions={employeeColumnOptions()}
            visibleColumnIds={directory.visibleColumnIds}
            onFilterChange={directory.handleFilterChange}
            onSearchChange={directory.handleSearchChange}
            onClearAll={directory.handleClearAll}
            onColumnToggle={onColumnToggle}
            clearGeneration={directory.clearGeneration}
            rows={directory.rows}
            isDatasetEmpty={directory.isDatasetEmpty}
            hasActiveFilters={directory.hasActiveFilters}
            tableColumns={visibleEmployeeColumns(directory.visibleColumnIds)}
            tableType={directory.loading ? "loading" : "default"}
            tableExtensions={extensions}
            skeletonRows={8}
            selection={selection}
            pagination={{
              page: directory.pagination.page,
              totalPages: directory.pagination.pages,
              totalCount: directory.pagination.count,
              perPage: directory.pagination.limit
            }}
            onPageChange={directory.handlePageChange}
          />
        )}
        <Outlet context={{ onEmployeeChanged: directory.retry }} />
        {selectedCount > 0 ? (
          <div className="acme-listing__bulk-bar">
            <FloatingBar
              selection={`${selectedCount} of ${directory.pagination.count} Selected`}
              actions={[ { id: "export", label: "Export", leadingIcon: "download" } ]}
              showDelete={false}
              showMore={false}
              onClearSelection={() => setSelectedIds([])}
              onActionClick={(action) => {
                if (action.id === "export") downloadSelectedEmployees(selectedRows)
              }}
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}
