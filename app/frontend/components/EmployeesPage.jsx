import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ListingTableCard } from "../april/components/ListingTableCard"
import { PageLoadError } from "../april/components/PageLoadError"
import { PageTitleNavHeader } from "../april/components/PageTitleNavHeader"
import { PageToast } from "../april/components/PageToast"
import OnboardEmployeeModal from "./OnboardEmployeeModal"
import { createEmployeesTableExtensions } from "../lib/employeesTableExtensions"
import {
  EMPLOYEES_TABLE_COLUMNS,
  employeeColumnOptions,
  visibleEmployeeColumns
} from "../lib/employeesTable"
import { createColumnToggleHandler } from "../lib/tableColumns"
import { useEmployeesDirectory } from "../lib/useEmployeesDirectory"

export default function EmployeesPage() {
  const navigate = useNavigate()
  const directory = useEmployeesDirectory()
  const [onboardOpen, setOnboardOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const extensions = useMemo(
    () => createEmployeesTableExtensions({ onDetails: (row) => navigate(`/employees/${row.id}`) }),
    [navigate]
  )
  const onColumnToggle = useMemo(
    () => createColumnToggleHandler(EMPLOYEES_TABLE_COLUMNS, directory.setVisibleColumnIds),
    [directory.setVisibleColumnIds]
  )

  return (
    <section className="acme-listing">
      <PageTitleNavHeader
        pageTitle="Employees"
        id="employees-title"
        showPrimaryButton
        primaryButtonLabel="Onboard"
        primaryIcon="person_add"
        onPrimary={() => setOnboardOpen(true)}
      />
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
      <PageToast
        title={toast?.title}
        color="green"
        onDismiss={() => setToast(null)}
      />
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
          pagination={{
            page: directory.pagination.page,
            totalPages: directory.pagination.pages,
            totalCount: directory.pagination.count,
            perPage: directory.pagination.limit
          }}
          onPageChange={directory.handlePageChange}
        />
      )}
    </section>
  )
}
