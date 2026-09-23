import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FilterChipDateRange } from "../april/components/FilterChipDateRange"
import { FilterChipsHeader } from "../april/components/FilterChipsHeader"
import { KpiHeader } from "../april/components/KpiHeader"
import { PageLoadError } from "../april/components/PageLoadError"
import { PageTitleNavHeader } from "../april/components/PageTitleNavHeader"
import { Tabs } from "../april/components/Tabs"
import { getAnalytics } from "../lib/analytics"
import { analyticsShare, directoryPathFromMix, kpiMoney, mixLabel, mixMoney } from "../lib/analyticsDisplay"
import { formatUsd } from "../lib/employeesTable"
import { formatCount } from "../lib/homeSummary"
import {
  DEFAULT_HOME_TIMEFRAME,
  HOME_TIMEFRAME_PRESETS,
  homeTimeframeAsOf
} from "../lib/homeTimeframe"
import { apiData } from "../lib/http"

function MixCard({ title, rows, rowKey, total, currencyMode, onSelect }) {
  return (
    <section className="acme-dash__card" aria-labelledby={`${rowKey}-mix-title`}>
      <h2 id={`${rowKey}-mix-title`} className="april-text-style april-text-style--text-lg-semibold">
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="april-text-style april-text-style--text-md-regular">No active employees.</p>
      ) : (
        <ul className="acme-dash__mix">
          {rows.map((row) => {
            const share = analyticsShare(row.payroll_usd ?? row.headcount, total)
            const label = mixLabel(row, rowKey)
            const body = (
              <>
                <div className="acme-dash__mix-copy">
                  <span className="april-text-style april-text-style--text-md-semibold">{label}</span>
                  <span className="april-text-style april-text-style--text-sm-regular">
                    {formatCount(row.headcount)} · {mixMoney(row, currencyMode)}
                  </span>
                </div>
                <div className="acme-dash__bar" aria-hidden="true">
                  <span className="acme-dash__bar-fill" style={{ width: `${share}%` }} />
                </div>
              </>
            )

            return (
              <li key={label}>
                {onSelect ? (
                  <button
                    type="button"
                    className="acme-dash__mix-row"
                    aria-label={`View ${label} in directory`}
                    onClick={() => onSelect(row)}
                  >
                    {body}
                  </button>
                ) : (
                  <div className="acme-dash__mix-row">{body}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default function HomePage({ user }) {
  const navigate = useNavigate()
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState("")
  const [reloadToken, setReloadToken] = useState(0)
  const [currencyMode, setCurrencyMode] = useState("usd")
  const [timeframe, setTimeframe] = useState(DEFAULT_HOME_TIMEFRAME)
  const asOf = homeTimeframeAsOf(timeframe)

  useEffect(() => {
    const controller = new AbortController()
    setError("")
    getAnalytics({ signal: controller.signal, as_of: asOf })
      .then((analytics) => setPayload(apiData(analytics)))
      .catch((caught) => {
        if (caught.name === "AbortError") return
        setError(caught.message || "Could not load home")
        setPayload(null)
      })

    return () => controller.abort()
  }, [reloadToken, asOf])

  const local = currencyMode === "local"
  const usdTotal = Number(payload?.annualised_usd || 0)
  const localTotal = (payload?.by_currency || []).reduce((sum, row) => sum + Number(row.payroll_local || 0), 0)
  const kpiItems = local
    ? [
        { label: "Active employees", value: formatCount(payload?.headcount) },
        ...(payload?.by_currency || []).map((row) => ({
          label: `${row.currency} payroll`,
          value: kpiMoney(row.payroll_local, "local", row.currency)
        }))
      ]
    : [
        { label: "Annualised payroll", value: formatUsd(payload?.annualised_usd) },
        { label: "Active employees", value: formatCount(payload?.headcount) },
        { label: "Average", value: formatUsd(payload?.average_usd) },
        { label: "Median", value: formatUsd(payload?.median_usd) },
        { label: "This month", value: formatUsd(payload?.monthly_usd) }
      ]

  return (
    <section className="superadmin-page superadmin-page--home acme-home acme-dash">
      <PageTitleNavHeader
        id="home-title"
        pageTitle={`Welcome Back, ${user.first_name}!`}
        showPrimaryButton
        primaryButtonLabel="Onboard Employee"
        primaryIcon="person_add"
        onPrimary={() => navigate("/employees?onboard=1")}
      >
        <Tabs
          id="home-currency"
          tabs={[
            { label: "USD", icon: "payments" },
            { label: "Local", icon: "currency_exchange" }
          ]}
          activeIndex={local ? 1 : 0}
          onTabChange={(index) => setCurrencyMode(index === 1 ? "local" : "usd")}
        />
      </PageTitleNavHeader>

      {error && !payload ? (
        <PageLoadError title="Couldn't load home" onRetry={() => setReloadToken((token) => token + 1)} />
      ) : (
        <>
          <FilterChipsHeader
            id="home-timeframe"
            className="acme-dash__toolbar"
            ariaLabel="Home timeframe"
            chips={[]}
            showSearch={false}
            showColumnsButton={false}
            showClearAll={false}
            endContent={
              <FilterChipDateRange
                id="home-timeframe-chip"
                filterLabel="Timeframe"
                presets={HOME_TIMEFRAME_PRESETS}
                showPeriod
                value={timeframe}
                onChange={setTimeframe}
              />
            }
          />
          <KpiHeader state={payload ? "default" : "loading"} items={kpiItems} id="home-kpi" />
        </>
      )}

      {payload ? (
        <div className="superadmin-page__body acme-dash__body">
          <div className="acme-dash__grid">
            <MixCard
              title="By type"
              rows={payload.by_type || []}
              rowKey="employment_type"
              total={usdTotal}
              currencyMode="usd"
              onSelect={(row) => navigate(directoryPathFromMix("employment_type", row))}
            />
            <MixCard
              title="By department"
              rows={payload.by_department || []}
              rowKey="department"
              total={usdTotal}
              currencyMode="usd"
              onSelect={(row) => navigate(directoryPathFromMix("department", row))}
            />
            <MixCard
              title="By country"
              rows={payload.by_country || []}
              rowKey="country"
              total={usdTotal}
              currencyMode="usd"
              onSelect={(row) => navigate(directoryPathFromMix("country", row))}
            />
            {local ? (
              <MixCard
                title="By currency"
                rows={payload.by_currency || []}
                rowKey="currency"
                total={localTotal}
                currencyMode="local"
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
