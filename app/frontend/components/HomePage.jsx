import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../april/components/Button"
import { KpiHeader } from "../april/components/KpiHeader"
import { PageLoadError } from "../april/components/PageLoadError"
import { PageTitleNavHeader } from "../april/components/PageTitleNavHeader"
import { Tabs } from "../april/components/Tabs"
import { TextareaInput } from "../april/components/TextareaInput"
import { ANALYTICS_PROMPTS, analyticsQuestionError, askAnalytics, getAnalytics } from "../lib/analytics"
import {
  analyticsShare,
  directoryPathFromMix,
  fxRatesCopy,
  kpiMoney,
  mixLabel,
  mixMoney,
  payrollInsight
} from "../lib/analyticsDisplay"
import { formatUsd } from "../lib/employeesTable"
import { formatCount } from "../lib/homeSummary"
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

function AnalyticsChat() {
  const [question, setQuestion] = useState("")
  const [askError, setAskError] = useState("")
  const [messages, setMessages] = useState([])
  const [busy, setBusy] = useState(false)

  const send = async (text) => {
    const next = text || question
    const error = analyticsQuestionError(next)
    if (error) {
      setAskError(error)
      return
    }
    if (busy) return
    setAskError("")
    setBusy(true)
    setQuestion("")
    setMessages((current) => [ ...current, { role: "hr", text: next } ])
    try {
      const body = await askAnalytics(next)
      setMessages((current) => [ ...current, { role: "assistant", text: apiData(body)?.answer || "No answer." } ])
    } catch (caught) {
      setMessages((current) => [ ...current, { role: "assistant", text: caught.message } ])
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="acme-dash__card acme-dash__chat" aria-labelledby="home-chat-title">
      <h2 id="home-chat-title" className="april-text-style april-text-style--text-lg-semibold">
        Ask payroll
      </h2>
      <p className="april-text-style april-text-style--text-sm-regular">
        Plain-language questions about current pay, mix, and this month including leavers.
      </p>
      <div className="acme-dash__prompts">
        {ANALYTICS_PROMPTS.map((prompt) => (
          <Button
            key={prompt}
            variant="outlined"
            size="md"
            label={prompt}
            leadingIcon={false}
            trailingIcon={false}
            onClick={() => send(prompt)}
          />
        ))}
      </div>
      <ol className="acme-dash__messages">
        {messages.map((message, index) => (
          <li key={`${message.role}-${index}`} className={`acme-dash__message acme-dash__message--${message.role}`}>
            <p className="april-text-style april-text-style--text-sm-regular">{message.text}</p>
          </li>
        ))}
      </ol>
      <div className="acme-dash__ask">
        <TextareaInput
          id="home-question"
          label="Question"
          showLabel={false}
          fullWidth
          rows={2}
          maxLength={255}
          placeholder="Ask about payroll or headcount"
          value={question}
          state={askError ? "error" : "default"}
          description={askError}
          showDescription={Boolean(askError)}
          onChange={(event) => {
            setQuestion(event.target.value)
            setAskError("")
          }}
        />
        <Button
          variant="primary"
          size="md"
          label="Ask"
          icon="send"
          leadingIcon
          trailingIcon={false}
          loading={busy}
          onClick={() => send()}
        />
      </div>
    </section>
  )
}

export default function HomePage({ user }) {
  const navigate = useNavigate()
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState("")
  const [reloadToken, setReloadToken] = useState(0)
  const [currencyMode, setCurrencyMode] = useState("usd")

  useEffect(() => {
    const controller = new AbortController()
    setError("")
    getAnalytics({ signal: controller.signal })
      .then((analytics) => setPayload(apiData(analytics)))
      .catch((caught) => {
        if (caught.name === "AbortError") return
        setError(caught.message || "Could not load home")
        setPayload(null)
      })

    return () => controller.abort()
  }, [reloadToken])

  const local = currencyMode === "local"
  const usdTotal = Number(payload?.annualised_usd || 0)
  const localTotal = (payload?.by_currency || []).reduce((sum, row) => sum + Number(row.payroll_local || 0), 0)
  const insight = payload ? payrollInsight(payload) : ""
  const fxCopy = payload?.fx_rates?.length ? fxRatesCopy(payload.fx_rates) : ""
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
        pageTitle="Home"
        showTag={Boolean(payload)}
        tagLabel={payload ? `${formatCount(payload.headcount)} active` : ""}
        tagType="success"
        showSecondaryButton
        secondaryButtonLabel="Onboard"
        secondaryIcon="person_add"
        onSecondary={() => navigate("/employees?onboard=1")}
        showPrimaryButton
        primaryButtonLabel="Open directory"
        primaryIcon="group"
        onPrimary={() => navigate("/employees")}
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
      <p className="acme-home__intro april-text-style april-text-style--text-md-regular">
        Welcome back, {user.first_name}. Compensation source of truth for ACME.
      </p>

      {error && !payload ? (
        <PageLoadError title="Couldn't load home" onRetry={() => setReloadToken((token) => token + 1)} />
      ) : (
        <KpiHeader state={payload ? "default" : "loading"} items={kpiItems} id="home-kpi" />
      )}

      {payload ? (
        <div className="superadmin-page__body acme-dash__body">
          {insight ? (
            <p className="acme-dash__insight april-text-style april-text-style--text-md-regular">{insight}</p>
          ) : null}
          {fxCopy ? (
            <p className="acme-dash__fx april-text-style april-text-style--text-sm-regular">USD quotes {fxCopy}</p>
          ) : null}
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
          <AnalyticsChat />
        </div>
      ) : null}
    </section>
  )
}
