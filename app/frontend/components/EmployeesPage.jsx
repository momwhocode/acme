/** Employees directory — filters, export, and profile modal outlet. */

import { useEffect, useMemo, useState } from "react"
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { BreadcrumbHeader } from "../april/components/BreadcrumbHeader"
import { Button } from "../april/components/Button"
import { FloatingBar } from "../april/components/FloatingBar"
import { IconButton } from "../april/components/IconButton"
import { ListingTableCard } from "../april/components/ListingTableCard"
import { PageLoadError } from "../april/components/PageLoadError"
import { PageTitleNavHeader } from "../april/components/PageTitleNavHeader"
import { PageToast } from "../april/components/PageToast"
import ConfirmModal from "./ConfirmModal"
import ImportEmployeesModal from "./ImportEmployeesModal"
import OffboardEmployeeModal from "./OffboardEmployeeModal"
import OnboardEmployeeModal from "./OnboardEmployeeModal"
import { destroyEmployee, exportEmployees, importToastTitle, rehireEmployee } from "../lib/employees"
import { t } from "../lib/messages"
import { createEmployeesTableExtensions } from "../lib/employeesTableExtensions"
import {
  EMPLOYEES_TABLE_COLUMNS,
  employeeColumnOptions,
  visibleEmployeeColumns
} from "../lib/employeesTable"
import { applySortToColumns } from "../lib/tableSort"
import { createColumnToggleHandler } from "../lib/tableColumns"
import { useTableRowSelection } from "../lib/tableSelection"
import { useEmployeesDirectory } from "../lib/useEmployeesDirectory"

export default function EmployeesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const directory = useEmployeesDirectory()
  const { retry, exportQuery, setVisibleColumnIds, handleSort, sort } = directory
  const [onboardOpen, setOnboardOpen] = useState(() => searchParams.get("onboard") === "1")
  const [importOpen, setImportOpen] = useState(false)
  const [offboardRow, setOffboardRow] = useState(null)
  const [deleteRow, setDeleteRow] = useState(null)
  const [toast, setToast] = useState(null)
  const [busy, setBusy] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const { selection, selectedCount } = useTableRowSelection(directory.rows, selectedIds, setSelectedIds)
  const onDirectory = location.pathname === "/employees"

  const closeDirectoryModals = () => {
    setOnboardOpen(false)
    setImportOpen(false)
    setOffboardRow(null)
    setDeleteRow(null)
  }

  const stayOnDirectory = () => {
    if (onDirectory) return
    navigate({ pathname: "/employees", search: location.search })
  }

  useEffect(() => {
    if (searchParams.get("onboard") !== "1") return
    const next = new URLSearchParams(searchParams)
    next.delete("onboard")
    closeDirectoryModals()
    setOnboardOpen(true)
    if (location.pathname === "/employees") {
      setSearchParams(next, { replace: true })
    } else {
      navigate({ pathname: "/employees", search: next.toString() }, { replace: true })
    }
  }, [location.pathname, navigate, searchParams, setSearchParams])

  const rowIdsKey = directory.rows.map((row) => row.id).join(",")
  useEffect(() => {
    setSelectedIds([])
  }, [rowIdsKey])

  const extensions = useMemo(
    () =>
      createEmployeesTableExtensions({
        onDetails: (row) => {
          closeDirectoryModals()
          navigate({ pathname: `/employees/${row.id}`, search: location.search })
        },
        onOffboard: (row) => {
          closeDirectoryModals()
          stayOnDirectory()
          setOffboardRow(row)
        },
        onRehire: async (row) => {
          try {
            await rehireEmployee(row.id)
            setToast({ title: t("success.employeeRehired") })
            retry()
          } catch (caught) {
            setToast({ title: caught.message || t("errors.rehireEmployee") })
          }
        },
        onDelete: (row) => {
          closeDirectoryModals()
          stayOnDirectory()
          setDeleteRow(row)
        }
      }),
    [location.pathname, location.search, navigate, retry]
  )
  const onColumnToggle = useMemo(
    () => createColumnToggleHandler(EMPLOYEES_TABLE_COLUMNS, setVisibleColumnIds),
    [setVisibleColumnIds]
  )

  const exportView = async () => {
    if (busy) return
    setBusy(true)
    try {
      await exportEmployees(exportQuery)
      setToast({ title: t("success.exportedView") })
    } catch (caught) {
      setToast({ title: caught.message || t("errors.exportEmployees") })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="superadmin-page superadmin-page--listing acme-listing">
      <BreadcrumbHeader
        id="employees-breadcrumb"
        links="1"
        items={[ { label: "Home", onClick: () => navigate("/") } ]}
      />
      <PageTitleNavHeader
        pageTitle="Employee Directory"
        id="employees-title"
        showPrimaryButton
        primaryButtonLabel="Onboard Employee"
        primaryIcon="person_add"
        onPrimary={() => {
          closeDirectoryModals()
          stayOnDirectory()
          setOnboardOpen(true)
        }}
      >
        <Button
          label="Import"
          variant="outlined"
          size="md"
          icon="upload"
          leadingIcon
          trailingIcon={false}
          onClick={() => {
            closeDirectoryModals()
            stayOnDirectory()
            setImportOpen(true)
          }}
        />
        <IconButton
          variant="outlined"
          size="md"
          icon="download"
          ariaLabel="Export"
          onClick={exportView}
        />
      </PageTitleNavHeader>
      {importOpen ? (
        <ImportEmployeesModal
          onCancel={() => setImportOpen(false)}
          onSuccess={(result) => {
            setImportOpen(false)
            setToast({ title: importToastTitle(result) })
            retry()
          }}
        />
      ) : null}
      {onboardOpen ? (
        <OnboardEmployeeModal
          onCancel={() => setOnboardOpen(false)}
          onSuccess={() => {
            setOnboardOpen(false)
            setToast({ title: t("success.employeeOnboarded") })
            retry()
          }}
        />
      ) : null}
      {offboardRow ? (
        <OffboardEmployeeModal
          employee={offboardRow.employee}
          onCancel={() => setOffboardRow(null)}
          onSuccess={() => {
            setOffboardRow(null)
            setToast({ title: t("success.markedAsLeft") })
            retry()
          }}
        />
      ) : null}
      {deleteRow ? (
        <ConfirmModal
          title="Delete hire"
          description={`Removes ${deleteRow.name} and their pay history. This cannot be undone.`}
          confirm="Delete hire"
          confirmLoading={busy}
          onCancel={() => setDeleteRow(null)}
          onConfirm={async () => {
            if (busy) return
            setBusy(true)
            try {
              await destroyEmployee(deleteRow.id)
              setDeleteRow(null)
              setToast({ title: t("success.hireDeleted") })
              retry()
            } catch (caught) {
              setToast({ title: caught.message || t("errors.deleteEmployee") })
            } finally {
              setBusy(false)
            }
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
          <PageLoadError title="Couldn't load employees" onRetry={retry} />
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
            onSort={handleSort}
            clearGeneration={directory.clearGeneration}
            rows={directory.rows}
            isDatasetEmpty={directory.isDatasetEmpty}
            hasActiveFilters={directory.hasActiveFilters}
            tableColumns={applySortToColumns(visibleEmployeeColumns(directory.visibleColumnIds), sort)}
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
        {onboardOpen || importOpen || offboardRow || deleteRow ? null : (
          <Outlet context={{ onEmployeeChanged: retry }} />
        )}
        {selectedCount > 0 ? (
          <div className="acme-listing__bulk-bar">
            <FloatingBar
              selection={`${selectedCount} of ${directory.pagination.count} Selected`}
              actions={[ { id: "export", label: "Export", leadingIcon: "download" } ]}
              showDelete={false}
              showMore={false}
              onClearSelection={() => setSelectedIds([])}
              onActionClick={(action) => {
                if (action.id === "export") exportView()
              }}
            />
          </div>
        ) : null}
      </div>
    </section>
  )
}
