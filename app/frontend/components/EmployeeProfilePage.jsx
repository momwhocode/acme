import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { BreadcrumbHeader } from "../april/components/BreadcrumbHeader"
import { PageLoadError } from "../april/components/PageLoadError"
import { PageTitleNavHeader } from "../april/components/PageTitleNavHeader"
import { PageToast } from "../april/components/PageToast"
import { Tag } from "../april/components/Tag"
import CompensationChangeModal from "./CompensationChangeModal"
import { getEmployee } from "../lib/employees"
import { apiData } from "../lib/http"
import { formatMoney, formatUsd, titleCase } from "../lib/employeesTable"

function Field({ label, value }) {
  return (
    <div className="acme-profile__field">
      <dt className="april-text-style april-text-style--text-sm-regular">{label}</dt>
      <dd className="april-text-style april-text-style--text-md-regular">{value || "—"}</dd>
    </div>
  )
}

function compensationCopy(record) {
  if (!record) return "No compensation on file."
  const hours = record.hours_per_week ? ` · ${record.hours_per_week} hrs/week` : ""
  return `${formatMoney(record.base_amount, record.currency)} ${record.pay_period}${hours}`
}

export default function EmployeeProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [reloadToken, setReloadToken] = useState(0)
  const [changeOpen, setChangeOpen] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError("")
    getEmployee(id, { signal: controller.signal })
      .then((body) => setPayload(apiData(body)))
      .catch((caught) => {
        if (caught.name === "AbortError") return
        setError(caught.message || "Could not load employee")
        setPayload(null)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [id, reloadToken])

  const employee = payload?.employee
  const current = payload?.current_compensation
  const history = payload?.compensation_records || []

  return (
    <section className="acme-profile">
      <BreadcrumbHeader
        id="employee-profile-crumbs"
        items={[
          { label: "Employees", onClick: () => navigate("/employees") },
          { label: employee ? `${employee.first_name} ${employee.last_name}` : "Profile" }
        ]}
      />
      <PageTitleNavHeader
        id="employee-profile-title"
        pageTitle={employee ? `${employee.first_name} ${employee.last_name}` : "Employee"}
        showLeadingIcon
        onBack={() => navigate("/employees")}
        showTag={Boolean(employee)}
        tagLabel={employee?.status === "left" ? "Left" : "Active"}
        showPrimaryButton={employee?.status === "active"}
        primaryButtonLabel="Record pay change"
        primaryIcon="payments"
        onPrimary={() => setChangeOpen(true)}
      />
      {changeOpen && employee ? (
        <CompensationChangeModal
          employee={employee}
          currentCompensation={current}
          onCancel={() => setChangeOpen(false)}
          onSuccess={() => {
            setChangeOpen(false)
            setToast({ title: "Compensation recorded" })
            setReloadToken((token) => token + 1)
          }}
        />
      ) : null}
      <PageToast
        title={toast?.title}
        color="green"
        onDismiss={() => setToast(null)}
      />

      {loading ? <div className="pattern-page__scroll" aria-busy="true" /> : null}
      {error && !employee ? (
        <PageLoadError title="Couldn't load employee" onRetry={() => setReloadToken((current) => current + 1)} />
      ) : null}

      {employee ? (
        <>
          <dl className="acme-profile__grid">
            <Field label="Email" value={employee.email} />
            <Field label="Department" value={titleCase(employee.department)} />
            <Field label="Country" value={employee.country} />
            <Field label="Type" value={employee.employment_type} />
            <Field label="Level" value={employee.level} />
            <Field label="Started" value={employee.started_on} />
            <Field label="Left" value={employee.left_on} />
          </dl>

          <section className="acme-profile__comp" aria-labelledby="current-comp-title">
            <h2 id="current-comp-title" className="april-text-style april-text-style--text-lg-semibold">
              Current compensation
            </h2>
            {current ? (
              <>
                <p className="april-text-style april-text-style--display-xs-semibold">
                  {formatUsd(current.annualised_usd)}
                  <span className="acme-profile__comp-meta april-text-style april-text-style--text-md-regular">
                    {" "}annualised USD
                  </span>
                </p>
                <p className="april-text-style april-text-style--text-md-regular">{compensationCopy(current)}</p>
                <p className="april-text-style april-text-style--text-sm-regular">
                  Effective {current.effective_date}
                  {current.change_reason ? ` · ${current.change_reason}` : ""}
                </p>
              </>
            ) : (
              <p className="april-text-style april-text-style--text-md-regular">No compensation on file.</p>
            )}
          </section>

          <section aria-labelledby="comp-history-title">
            <h2 id="comp-history-title" className="april-text-style april-text-style--text-lg-semibold">
              Compensation history
            </h2>
            {history.length === 0 ? (
              <p className="april-text-style april-text-style--text-md-regular">No effective-dated changes yet.</p>
            ) : (
              <ol className="acme-profile__timeline">
                {history.map((record) => {
                  const currentItem = current && record.id === current.id
                  return (
                    <li key={record.id} className="acme-profile__timeline-item">
                      <div className="acme-profile__timeline-when">
                        <p className="april-text-style april-text-style--text-sm-semibold">{record.effective_date}</p>
                        {currentItem ? <Tag type="success" label="Current" leadingIcon={false} trailingIcon={false} /> : null}
                      </div>
                      <div>
                        <p className="april-text-style april-text-style--text-md-semibold">
                          {titleCase(record.change_reason || "Compensation change")}
                        </p>
                        <p className="april-text-style april-text-style--text-md-regular">{compensationCopy(record)}</p>
                        <p className="april-text-style april-text-style--text-sm-regular">
                          {formatUsd(record.annualised_usd)} annualised USD
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </section>
        </>
      ) : null}
    </section>
  )
}
