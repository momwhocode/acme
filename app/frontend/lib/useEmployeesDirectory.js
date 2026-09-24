/** Employees listing: URL + localStorage session, sort, and filtered fetch. */

import { useCallback, useEffect, useMemo, useState } from "react"
import { useLocation, useSearchParams } from "react-router-dom"
import { apiData, apiMeta } from "./http.js"
import { listEmployees } from "./employees.js"
import { t } from "./messages.js"
import { defaultVisibleColumnIds } from "./tableColumns.js"
import { nextSortState } from "./tableSort.js"
import { hasSelectedListingFilters, readFilterSelection } from "./filterValues.js"
import {
  readStoredColumns,
  readStoredDirectorySession,
  writeStoredColumns,
  writeStoredDirectorySession
} from "./directoryPrefs.js"
import {
  EMPLOYEES_TABLE_COLUMNS,
  directoryQueryFromFilters,
  employeeTableRow,
  employeesFilterChips
} from "./employeesTable.js"

const SEARCH_DEBOUNCE_MS = 300
const PER_PAGE = 25
const URL_STATE_KEYS = [ "status", "type", "country", "department", "manager", "level", "q", "sort", "direction" ]

function parseList(value) {
  return String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function filtersFromParams(searchParams) {
  return {
    status: parseList(searchParams.get("status")),
    type: parseList(searchParams.get("type")),
    country: parseList(searchParams.get("country")),
    department: parseList(searchParams.get("department")),
    manager: parseList(searchParams.get("manager")),
    level: parseList(searchParams.get("level"))
  }
}

function sortFromParams(searchParams) {
  const columnId = searchParams.get("sort")
  if (!columnId) return { columnId: null, direction: "desc" }
  return { columnId, direction: searchParams.get("direction") === "asc" ? "asc" : "desc" }
}

function hasUrlDirectoryState(searchParams) {
  return URL_STATE_KEYS.some((key) => searchParams.get(key))
}

export function useEmployeesDirectory() {
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const stored = !hasUrlDirectoryState(searchParams) ? readStoredDirectorySession() : null
  const [searchValue, setSearchValue] = useState(() => (stored ? stored.q : searchParams.get("q")) || "")
  const [debouncedSearch, setDebouncedSearch] = useState(() => (stored ? stored.q : searchParams.get("q")) || "")
  const [filterValues, setFilterValues] = useState(() => stored?.filterValues || filtersFromParams(searchParams))
  const [sort, setSort] = useState(() => stored?.sort || sortFromParams(searchParams))
  const [page, setPage] = useState(() => Math.max(1, Number(searchParams.get("page")) || 1))
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, count: 0, limit: PER_PAGE })
  const [facets, setFacets] = useState({ departments: [], countries: [], managers: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [clearGeneration, setClearGeneration] = useState(0)
  const [visibleColumnIds, setVisibleColumnIds] = useState(
    () => readStoredColumns() || defaultVisibleColumnIds(EMPLOYEES_TABLE_COLUMNS)
  )
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchValue.trim()), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchValue])

  useEffect(() => {
    const next = new URLSearchParams()
    if (debouncedSearch) next.set("q", debouncedSearch)
    if (page > 1) next.set("page", String(page))
    if (sort.columnId) {
      next.set("sort", sort.columnId)
      next.set("direction", sort.direction || "desc")
    }
    Object.entries(filterValues).forEach(([ key, value ]) => {
      const selected = readFilterSelection(value)
      if (selected.length) next.set(key, selected.join(","))
    })
    setSearchParams(next, { replace: true })
    writeStoredDirectorySession({ filterValues, q: debouncedSearch, sort })
  }, [debouncedSearch, filterValues, location.pathname, page, setSearchParams, sort])

  useEffect(() => {
    writeStoredColumns(visibleColumnIds)
  }, [visibleColumnIds])

  useEffect(() => {
    const controller = new AbortController()
    const params = directoryQueryFromFilters({
      filterValues,
      q: debouncedSearch,
      page,
      perPage: PER_PAGE,
      sort
    })

    setLoading(true)
    setError("")
    listEmployees(params, { signal: controller.signal })
      .then((payload) => {
        setRows((apiData(payload)?.employees || []).map(employeeTableRow))
        setPagination(apiMeta(payload).pagination || { page, pages: 1, count: 0, limit: PER_PAGE })
        const nextFacets = apiMeta(payload).facets
        if (nextFacets) setFacets(nextFacets)
      })
      .catch((caught) => {
        if (caught.name === "AbortError") return
        setError(caught.message || t("errors.loadEmployees"))
        setRows([])
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [debouncedSearch, filterValues, page, reloadToken, sort])

  const handleFilterChange = useCallback((key, value) => {
    setFilterValues((current) => ({ ...current, [key]: value }))
    setPage(1)
  }, [])

  const handleSearchChange = useCallback((value) => {
    setSearchValue(value)
    setPage(1)
  }, [])

  const handleSort = useCallback((columnId) => {
    setSort((current) => nextSortState(current, columnId))
    setPage(1)
  }, [])

  const handleClearAll = useCallback(() => {
    setFilterValues({})
    setSearchValue("")
    setDebouncedSearch("")
    setPage(1)
    setClearGeneration((current) => current + 1)
  }, [])

  const retry = useCallback(() => setReloadToken((current) => current + 1), [])

  const hasActiveFilters = Boolean(debouncedSearch) || hasSelectedListingFilters(filterValues)
  const filterChips = useMemo(
    () => employeesFilterChips(facets),
    [facets]
  )
  const exportQuery = useMemo(
    () => directoryQueryFromFilters({
      filterValues,
      q: debouncedSearch,
      sort,
      paginate: false
    }),
    [debouncedSearch, filterValues, sort]
  )

  return {
    searchValue,
    filterValues,
    filterChips,
    rows,
    pagination,
    loading,
    error,
    clearGeneration,
    visibleColumnIds,
    setVisibleColumnIds,
    sort,
    hasActiveFilters,
    isDatasetEmpty: !loading && !hasActiveFilters && pagination.count === 0,
    exportQuery,
    handleFilterChange,
    handleSearchChange,
    handleClearAll,
    handleSort,
    handlePageChange: setPage,
    retry
  }
}
