import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../april/components/Button"
import { MenuButtonDropdown } from "../april/components/MenuButtonDropdown"
import { PageLoadError } from "../april/components/PageLoadError"
import { Table } from "../april/components/Table"
import { TableEmpty } from "../april/components/TableEmpty"
import { Tag } from "../april/components/Tag"
import { OverviewDonut } from "./home/OverviewDonut"
import { OverviewKpi } from "./home/OverviewKpi"
import { OverviewTabs } from "./home/OverviewTabs"
import OnboardEmployeeModal from "./OnboardEmployeeModal"
import { getAnalytics } from "../lib/analytics"
import {
  analyticsParamsFromFocus,
  directoryPathFromFocus,
  toggleFocus
} from "../lib/analyticsDisplay"
import { employeeAvatar } from "../lib/employeeAvatar"
import { countryFlag } from "../lib/employeesTable"
import {
  ACTION_TABLE_COLUMNS,
  ACTION_TABS,
  ACTION_TAG,
  MONEY_SORT_KEYS,
  MONEY_TAB_INDEX,
  MONEY_TABS,
  actionRole,
  buildOverviewModel,
  formatCompactMoney,
  formatCount,
  formatMonthlyMoney,
  formatPct,
  moneyCell,
  moneyRows,
  moneyTableColumns,
  pctShare,
  sortMoneyRows
} from "../lib/homeOverview"
import { welcomeBackTitle } from "../lib/profile"
import { renderTableLead, renderTableLink } from "../lib/tableCellRenderers"
import { applySortToColumns, nextSortState } from "../lib/tableSort"
import {
  defaultHomePeriod,
  homeMonthOptions,
  homePeriodControlLabel,
  homePeriodPresets,
  homeTimeframeAsOf,
  homeTimeframeCompareAsOf
} from "../lib/homeTimeframe"
import { apiData } from "../lib/http"
import { t } from "../lib/messages"

/** Home overview — live analytics snapshot with in-page drill-down. */
export default function HomePage({ user }) {
  const navigate = useNavigate()
  const [payload, setPayload] = useState(null)
  const [compare, setCompare] = useState(null)
  const [error, setError] = useState("")
  const [reloadToken, setReloadToken] = useState(0)
  const [currencyMode, setCurrencyMode] = useState("usd")
  const [period, setPeriod] = useState(() => defaultHomePeriod())
  const [moneyTab, setMoneyTab] = useState(2)
  const [moneySort, setMoneySort] = useState({ columnId: "payroll", direction: "desc" })
  const [actionTab, setActionTab] = useState(0)
  const [focus, setFocus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [onboardOpen, setOnboardOpen] = useState(false)
  const asOf = homeTimeframeAsOf(period)
  const compareAsOf = homeTimeframeCompareAsOf(period)
  const local = currencyMode === "local"
  const analyticsFilter = useMemo(() => analyticsParamsFromFocus(focus), [focus])

  useEffect(() => {
    const controller = new AbortController()
    setError("")
    setLoading(true)
    Promise.all([
      getAnalytics({ signal: controller.signal, as_of: asOf, ...analyticsFilter }),
      getAnalytics({ signal: controller.signal, as_of: compareAsOf, ...analyticsFilter })
    ])
      .then(([analytics, previous]) => {
        setPayload(apiData(analytics))
        setCompare(apiData(previous))
      })
      .catch((caught) => {
        if (caught.name === "AbortError") return
        setError(caught.message || t("errors.loadHome"))
        setPayload(null)
        setCompare(null)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [reloadToken, asOf, compareAsOf, analyticsFilter])

  const model = useMemo(() => buildOverviewModel(payload, compare), [compare, payload])
  const moneyMeta = MONEY_TABS[moneyTab]
  const spendRows = sortMoneyRows(
    moneyRows(payload?.[`by_${moneyMeta.id}`] || [], moneyMeta.rowKey),
    { key: MONEY_SORT_KEYS[moneySort.columnId] || "payroll", direction: moneySort.direction }
  )
  const moneyTableRows = [
    ...spendRows.map((row) => ({
      id: row.key,
      label: row.label,
      headcount: formatCount(row.headcount),
      payroll: moneyCell(row, local),
      share: formatPct(pctShare(row.payroll, model.annual)),
      median: formatMonthlyMoney(row.median, local),
      country: row.country,
      color: row.color,
      shareWidth: pctShare(row.payroll, model.annual),
      isTotal: false
    })),
    {
      id: "__total",
      label: moneyMeta.allLabel,
      headcount: formatCount(model.headcount),
      payroll: formatCompactMoney(model.annual, local),
      share: "100.0%",
      median: formatMonthlyMoney(model.median, local),
      isTotal: true,
      clickable: false
    }
  ]
  const actionMeta = ACTION_TABS[actionTab]
  const actionGroup = payload?.actions?.[actionMeta.id] || { count: 0, employees: [] }
  const actionRows = actionGroup.employees.map((employee) => {
    const avatar = employeeAvatar(employee)
    return {
      id: `${actionMeta.id}-${employee.id}-${employee.event_on}`,
      name: `${employee.first_name} ${employee.last_name}`.trim(),
      first_name: employee.first_name,
      last_name: employee.last_name,
      initials: avatar.initials,
      color: avatar.color,
      avatarUrl: avatar.avatarUrl,
      role: actionRole(employee),
      status: employee.missing_comp ? "Missing Comp Record" : ACTION_TAG[actionMeta.id],
      statusType: employee.missing_comp ? "warning" : "default",
      event_on: employee.event_on,
      employee
    }
  })
  const maxLevelMedian = Math.max(...model.levels.map((row) => row.median), 1)
  const applyFocus = (next) => {
    setFocus((current) => {
      const selected = toggleFocus(current, next)
      if (selected && MONEY_TAB_INDEX[selected.key] != null) setMoneyTab(MONEY_TAB_INDEX[selected.key])
      return selected
    })
  }
  const openDirectory = (path = directoryPathFromFocus(focus)) => navigate(path)
  const moneyExtensions = {
    renderBodyContent(column, row) {
      if (column.id === "label") {
        if (row.isTotal) return <span className="april-table__cell-text">{row.label}</span>
        const nextFocus = { key: moneyMeta.rowKey, value: row.id, label: row.label }
        return (
          <span className="acme-overview__country">
            {moneyMeta.id === "type" ? <span className="acme-overview__swatch" style={{ background: row.color }} /> : null}
            {moneyMeta.id === "country" ? <span aria-hidden="true">{countryFlag(row.country)}</span> : null}
            {renderTableLink(row.label, () => applyFocus(nextFocus))}
          </span>
        )
      }
      if (column.id === "payroll") {
        return (
          <span className="acme-overview__cost">
            <span className="april-table__cell-text">{row.payroll}</span>
            {row.isTotal ? null : (
              <span className="acme-overview__cost-bar" aria-hidden="true">
                <span style={{ width: `${row.shareWidth}%`, background: row.color }} />
              </span>
            )}
          </span>
        )
      }
      return undefined
    }
  }
  const actionExtensions = {
    renderBodyContent(column, row) {
      if (column.kind !== "lead") return undefined
      return renderTableLead({
        name: row.name,
        user: row,
        onClick: () => navigate(`/employees/${row.employee.id}`)
      })
    }
  }

  return (
    <section className="superadmin-page superadmin-page--home acme-overview">
      <header className="acme-overview__header">
        <h1 id="home-title" className="april-text-style april-text-style--display-xs-semibold">
          {welcomeBackTitle(user)}
        </h1>
      </header>

      {error && !payload ? (
        <PageLoadError title="Couldn't load home" onRetry={() => setReloadToken((token) => token + 1)} />
      ) : (
        <div className={[ "acme-overview__body", loading ? "is-loading" : "" ].filter(Boolean).join(" ")} aria-busy={loading || undefined}>
          <div className="acme-overview__controls">
            <div className="acme-overview__controls-start">
              <MenuButtonDropdown
                id="home-period"
                label={homePeriodControlLabel(period)}
                variant="outlined"
                size="md"
                leadingIconName="calendar_month"
                items={[
                  ...homePeriodPresets().map((preset) => ({
                    label: preset.label,
                    onClick: () => setPeriod(preset.period)
                  })),
                  { divider: true },
                  ...homeMonthOptions().map((option) => ({
                    label: option.label,
                    onClick: () => setPeriod({
                      toDate: option.current,
                      year: option.year,
                      month: option.month
                    })
                  }))
                ]}
              />
              {focus ? (
                <Tag
                  label={focus.label}
                  type="primary"
                  leadingIcon={false}
                  trailingIcon
                  trailingIconName="close"
                  onRemove={() => setFocus(null)}
                  removeLabel={`Clear ${focus.label}`}
                />
              ) : null}
            </div>
            <OverviewTabs
              id="home-currency"
              align="end"
              tabs={[ { id: "local", label: "Local" }, { id: "usd", label: "USD" } ]}
              activeIndex={local ? 0 : 1}
              onChange={(index) => setCurrencyMode(index === 0 ? "local" : "usd")}
            />
          </div>
          <div className="acme-overview__kpis">
            <OverviewKpi
              icon="payments"
              label="Total Annualised Cost"
              value={`${formatCompactMoney(model.annual, local)}/yo`}
              delta={model.kpis.costDelta}
            />
            <OverviewKpi
              icon="group"
              label="Active Headcount"
              value={formatCount(model.headcount)}
              delta={model.kpis.headDelta}
            />
            <OverviewKpi
              icon="equalizer"
              label="Median Compensation"
              value={`${formatMonthlyMoney(model.median, local)}/mo`}
              delta={model.kpis.medianDelta}
            />
            <OverviewKpi
              icon="work"
              label="Contingent Ratio"
              value={formatPct(model.contingentRatio)}
              delta={model.kpis.ratioDelta}
            />
          </div>

          <div className="acme-overview__charts">
            <section className="acme-overview__card" aria-labelledby="type-mix-title">
              <div>
                <h2 id="type-mix-title" className="april-text-style april-text-style--text-lg-semibold">
                  Employment Type
                </h2>
                <p className="acme-overview__muted">Headcount by type</p>
              </div>
              {model.slices.length === 0 ? (
                <p className="april-text-style april-text-style--text-md-regular">No active employees.</p>
              ) : (
                <div className="acme-overview__donut-row">
                  <OverviewDonut slices={model.slices} total={model.headcount} />
                  <ul className="acme-overview__legend">
                    {model.slices.map((slice) => (
                      <li key={slice.key}>
                        <button
                          type="button"
                          className="acme-overview__legend-row"
                          onClick={() => applyFocus({ key: "employment_type", value: slice.key, label: slice.label })}
                        >
                          <span className="acme-overview__swatch" style={{ background: slice.color }} />
                          <span>{slice.label}</span>
                          <span>{formatCount(slice.headcount)}</span>
                          <span>{formatPct(pctShare(slice.headcount, model.headcount))}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className="acme-overview__card" aria-labelledby="level-mix-title">
              <div>
                <h2 id="level-mix-title" className="april-text-style april-text-style--text-lg-semibold">
                  Comp By Level
                </h2>
                <p className="acme-overview__muted">Median monthly compensation</p>
              </div>
              {model.levels.length === 0 ? (
                <p className="april-text-style april-text-style--text-md-regular">No level bands yet.</p>
              ) : (
                <div className="acme-overview__bars" role="img" aria-label="Median compensation by level">
                  {model.levels.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      className={[ "acme-overview__bar-col", focus?.value === row.id ? "is-selected" : "" ].filter(Boolean).join(" ")}
                      onClick={() => applyFocus({ key: "level", value: row.id, label: row.label })}
                    >
                      <span className="acme-overview__chart-tip" role="tooltip">
                        {row.label} · {formatMonthlyMoney(row.median, local)}/mo · {formatCount(row.headcount)} people
                      </span>
                      <span className="acme-overview__bar-value">{formatMonthlyMoney(row.median, local)}</span>
                      <span
                        className="acme-overview__bar"
                        style={{ height: `${Math.max(8, (row.median / maxLevelMedian) * 140)}px`, background: row.color }}
                      />
                      <span className="acme-overview__bar-label">{row.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="acme-overview__card" aria-labelledby="money-title">
            <div className="acme-overview__card-head">
              <div>
                <h2 id="money-title" className="april-text-style april-text-style--text-lg-semibold">
                  Spend
                </h2>
                <p className="acme-overview__muted">Payroll by {moneyMeta.label.toLowerCase()}</p>
              </div>
              <OverviewTabs
                id="home-money-tabs"
                align="end"
                tabs={MONEY_TABS.map((tab) => ({ id: tab.id, label: tab.label }))}
                activeIndex={moneyTab}
                onChange={(index) => {
                  setMoneyTab(index)
                  setMoneySort({ columnId: "payroll", direction: "desc" })
                }}
              />
            </div>
            <Table
              className="acme-overview__table acme-overview__table--spend"
              columns={applySortToColumns(moneyTableColumns(moneyMeta), moneySort)}
              rows={moneyTableRows}
              extensions={moneyExtensions}
              onSort={(columnId) => setMoneySort((current) => nextSortState(current, columnId))}
              onRowClick={(row) => {
                if (row.isTotal) return
                applyFocus({ key: moneyMeta.rowKey, value: row.id, label: row.label })
              }}
              animateColumnChanges={false}
            />
          </section>

          <section className="acme-overview__card" aria-labelledby="actions-title">
            <div className="acme-overview__card-head">
              <div>
                <h2 id="actions-title" className="april-text-style april-text-style--text-lg-semibold">
                  Onboarding/Offboarding Tracker
                </h2>
                <p className="acme-overview__muted">Hires, exits, and contracts</p>
              </div>
              {actionMeta.action === "onboard" ? (
                <Button
                  label="Onboard Employee"
                  variant="outlined"
                  size="sm"
                  trailingIcon={false}
                  leadingIcon
                  icon="person_add"
                  onClick={() => setOnboardOpen(true)}
                />
              ) : null}
            </div>
            <OverviewTabs
              id="home-action-tabs"
              tabs={ACTION_TABS.map((tab) => ({
                id: tab.id,
                label: tab.label,
                count: formatCount(payload?.actions?.[tab.id]?.count || 0)
              }))}
              activeIndex={actionTab}
              onChange={setActionTab}
            />
            {actionRows.length === 0 ? (
              <TableEmpty
                title="Nothing in this queue."
                description={
                  actionMeta.action === "onboard"
                    ? "No recent hires in this snapshot. Onboard someone to add them to payroll."
                    : "Nobody in this queue for the selected snapshot."
                }
                icon="group"
                showAction={actionMeta.action === "onboard"}
                actionLabel="Onboard Employee"
                onAction={() => setOnboardOpen(true)}
                regionLabel="Empty action queue"
              />
            ) : (
              <Table
                className="acme-overview__table acme-overview__table--actions"
                columns={ACTION_TABLE_COLUMNS}
                rows={actionRows}
                extensions={actionExtensions}
                onRowClick={(row) => navigate(`/employees/${row.employee.id}`)}
                animateColumnChanges={false}
              />
            )}
            <div className="acme-overview__action-foot">
              <p className="acme-overview__muted">
                Showing {actionGroup.employees.length} of {formatCount(actionGroup.count)}
              </p>
              <Button
                label="View All"
                variant="ghost"
                size="sm"
                leadingIcon={false}
                trailingIcon={false}
                onClick={() => openDirectory(actionMeta.path)}
              />
            </div>
          </section>
        </div>
      )}
      {onboardOpen ? (
        <OnboardEmployeeModal
          onCancel={() => setOnboardOpen(false)}
          onSuccess={() => {
            setOnboardOpen(false)
            setReloadToken((token) => token + 1)
          }}
        />
      ) : null}
    </section>
  )
}
