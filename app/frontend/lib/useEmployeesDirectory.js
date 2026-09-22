import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { apiData, apiMeta } from "./http.js"
import { listEmployees } from "./employees.js"
import { defaultVisibleColumnIds } from "./tableColumns.js"
import { hasSelectedListingFilters, readFilterSelection } from "./filterValues.js"
import {
  EMPLOYEES_TABLE_COLUMNS,
  directoryQueryFromFilters,
  employeeTableRow,
  employeesFilterChips
} from "./employeesTable.js"

const SEARCH_DEBOUNCE_MS = 300
const PER_PAGE = 25

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
    department: parseList(searchParams.get("department"))
  }
}

export function useEmployeesDirectory() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchValue, setSearchValue] = useState(() => searchParams.get("q") || "")
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get("q") || "")
  const [filterValues, setFilterValues] = useState(() => filtersFromParams(searchParams))
  const [page, setPage] = useState(() => Math.max(1, Number(searchParams.get("page")) || 1))
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, count: 0, limit: PER_PAGE })
  const [facets, setFacets] = useState({ departments: [], countries: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [clearGeneration, setClearGeneration] = useState(0)
  const [visibleColumnIds, setVisibleColumnIds] = useState(() => defaultVisibleColumnIds(EMPLOYEES_TABLE_COLUMNS))
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchValue.trim()), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchValue])

  useEffect(() => {
    const next = new URLSearchParams()
    if (debouncedSearch) next.set("q", debouncedSearch)
    if (page > 1) next.set("page", String(page))
    Object.entries(filterValues).forEach(([ key, value ]) => {
      const selected = readFilterSelection(value)
      if (selected.length) next.set(key, selected.join(","))
    })
    setSearchParams(next, { replace: true })
  }, [debouncedSearch, filterValues, page, setSearchParams])

  useEffect(() => {
    const controller = new AbortController()
    const params = directoryQueryFromFilters({
      filterValues,
      q: debouncedSearch,
      page,
      perPage: PER_PAGE
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
        setError(caught.message || "Could not load employees")
        setRows([])
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [debouncedSearch, filterValues, page, reloadToken])

  const handleFilterChange = useCallback((key, value) => {
    setFilterValues((current) => ({ ...current, [key]: value }))
    setPage(1)
  }, [])

  const handleSearchChange = useCallback((value) => {
    setSearchValue(value)
    setPage(1)
  }, [])

  const handleClearAll = useCallback(() => {
    setFilterValues({})
    setSearchValue("")
    setDebouncedSearch("")
    setPage(1)
    setClearGeneration((current) => current + 1)
  }, [])

  const hasActiveFilters = Boolean(debouncedSearch) || hasSelectedListingFilters(filterValues)
  const filterChips = useMemo(
    () => employeesFilterChips(facets),
    [facets]
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
    hasActiveFilters,
    isDatasetEmpty: !loading && !hasActiveFilters && pagination.count === 0,
    handleFilterChange,
    handleSearchChange,
    handleClearAll,
    handlePageChange: setPage,
    retry: () => setReloadToken((current) => current + 1)
  }
}
