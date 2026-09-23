/** Employee profile as a modal over the directory (nested `/employees/:id`). */

import { useEffect, useState } from "react"
import { useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom"
import { Button } from "../april/components/Button"
import { IconMenuDropdown } from "../april/components/IconMenuDropdown"
import { Modal } from "../april/components/Modal"
import { PageLoadError } from "../april/components/PageLoadError"
import { PageToast } from "../april/components/PageToast"
import { Tag } from "../april/components/Tag"
import CompensationChangeModal from "./CompensationChangeModal"
import ConfirmModal from "./ConfirmModal"
import EditEmployeeModal from "./EditEmployeeModal"
import OffboardEmployeeModal from "./OffboardEmployeeModal"
import { deleteCompensation, destroyEmployee, getEmployee, rehireEmployee } from "../lib/employees"
import { apiData } from "../lib/http"
import { formatAprilShortDate } from "../april/renderers/date-time"
import { formatMoney, formatUsd, titleCase } from "../lib/employeesTable"
import { renderCountryCell } from "../lib/tableCellRenderers"

function Field({ label, value }) {
  return (
    <div className="acme-profile__field">
      <dt className="april-text-style april-text-style--text-sm-regular">{label}</dt>
      <dd className="april-text-style april-text-style--text-md-semibold">{value || "—"}</dd>
    </div>
  )
}

function compensationCopy(record) {
  if (!record) return "No compensation on file."
  const hours = record.hours_per_week ? ` · ${record.hours_per_week} hrs/week` : ""
  return `${formatMoney(record.base_amount, record.currency)} ${record.pay_period}${hours}`
}

function payBandCopy(band) {
  if (!band) return null
  const midpoint = formatMoney(band.midpoint, band.currency)
  const compa = band.compa_ratio == null ? "—" : Number(band.compa_ratio).toFixed(2)
  return `${band.level} band midpoint ${midpoint} · compa ${compa}`
}

function auditCopy(event) {
  const action = titleCase(event.action)
  const actor = event.actor_name || "HR"
  const when = formatAprilShortDate(event.created_at)
  return `${actor} · ${action} · ${when}`
}

export default function EmployeeProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { onEmployeeChanged } = useOutletContext() || {}
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState("")
  const [errorCode, setErrorCode] = useState("")
  const [loading, setLoading] = useState(true)
  const [reloadToken, setReloadToken] = useState(0)
  const [editOpen, setEditOpen] = useState(false)
  const [changeOpen, setChangeOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [offboardOpen, setOffboardOpen] = useState(false)
  const [deleteHireOpen, setDeleteHireOpen] = useState(false)
  const [deleteRecord, setDeleteRecord] = useState(null)
  const [toast, setToast] = useState(null)
  const [busy, setBusy] = useState(false)

  const close = () => navigate({ pathname: "/employees", search: location.search })
  const refresh = () => {
    setReloadToken((token) => token + 1)
    onEmployeeChanged?.()
  }

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError("")
    setErrorCode("")
    getEmployee(id, { signal: controller.signal })
      .then((body) => setPayload(apiData(body)))
      .catch((caught) => {
        if (caught.name === "AbortError") return
        setError(caught.message || "Could not load employee")
        setErrorCode(caught.code || "")
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
  const auditEvents = payload?.audit_events || []
  const left = employee?.status === "left"
  const title = employee
    ? `${employee.first_name} ${employee.last_name}`
    : errorCode === "not_found"
      ? "Employee not found"
      : "Employee"
  const moreItems = left
    ? [
        { label: "Rehire", onClick: async () => {
          await rehireEmployee(employee.id)
          setToast({ title: "Employee rehired" })
          refresh()
        } },
        { label: "Delete hire", onClick: () => setDeleteHireOpen(true) }
      ]
    : [
        { label: "Mark as left", onClick: () => setOffboardOpen(true) },
        { label: "Delete hire", onClick: () => setDeleteHireOpen(true) }
      ]

  return (
    <>
      <Modal
        backdrop
        size="lg"
        icon="person"
        title={title}
        description={employee?.email || ""}
        showDescription={Boolean(employee?.email)}
        showConfirmInput={false}
        showReset={false}
        showFooter={false}
        onCancel={close}
        className="acme-profile-modal"
      >
        {employee ? (
          <div className="acme-profile-modal__toolbar">
            <Tag type={left ? "default" : "success"} label={left ? "Left" : "Active"} leadingIcon={false} trailingIcon={false} />
            <div className="acme-profile-modal__actions">
              <Button
                label="Edit"
                variant="outlined"
                size="md"
                icon="edit"
                leadingIcon
                trailingIcon={false}
                onClick={() => setEditOpen(true)}
              />
              {employee.status === "active" ? (
                <Button
                  label="Record pay change"
                  variant="primary"
                  size="md"
                  icon="payments"
                  leadingIcon
                  trailingIcon={false}
                  onClick={() => setChangeOpen(true)}
                />
              ) : null}
              <IconMenuDropdown
                id="employee-profile-more-menu"
                ariaLabel="More actions"
                variant="outlined"
                size="md"
                items={moreItems}
              />
            </div>
          </div>
        ) : null}

        {loading ? <div className="page-loader" aria-busy="true" /> : null}
        {error && !employee && errorCode === "not_found" ? (
          <p className="april-text-style april-text-style--text-md-regular">This person is not in the directory.</p>
        ) : null}
        {error && !employee && errorCode !== "not_found" ? (
          <PageLoadError title="Couldn't load employee" onRetry={() => setReloadToken((current) => current + 1)} />
        ) : null}

        {employee ? (
          <div className="acme-profile__stack acme-profile-modal__stack">
            <section className="acme-profile__card" aria-labelledby="profile-details-title">
              <h2 id="profile-details-title" className="april-text-style april-text-style--text-lg-semibold">
                Details
              </h2>
              <dl className="acme-profile__grid">
                <Field label="Email" value={employee.email} />
                <Field label="Department" value={titleCase(employee.department)} />
                <Field label="Manager" value={employee.manager_name} />
                <Field label="Country" value={renderCountryCell(employee.country)} />
                <Field label="Type" value={titleCase(employee.employment_type)} />
                <Field label="Level" value={employee.level} />
                <Field label="Started" value={formatAprilShortDate(employee.started_on)} />
                <Field label="Left" value={formatAprilShortDate(employee.left_on)} />
              </dl>
            </section>

            <section className="acme-profile__card" aria-labelledby="current-comp-title">
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
                  {payload.pay_band ? (
                    <p className="april-text-style april-text-style--text-sm-regular">{payBandCopy(payload.pay_band)}</p>
                  ) : null}
                  <p className="april-text-style april-text-style--text-sm-regular">
                    Effective {formatAprilShortDate(current.effective_date)}
                    {current.change_reason ? ` · ${titleCase(current.change_reason)}` : ""}
                  </p>
                </>
              ) : (
                <p className="april-text-style april-text-style--text-md-regular">No compensation on file.</p>
              )}
            </section>

            <section className="acme-profile__card" aria-labelledby="comp-history-title">
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
                          <p className="april-text-style april-text-style--text-sm-semibold">{formatAprilShortDate(record.effective_date)}</p>
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
                          <div>
                            <Button
                              label="Correct"
                              variant="link-neutral"
                              size="sm"
                              leadingIcon={false}
                              trailingIcon={false}
                              onClick={() => setEditRecord(record)}
                            />
                            {history.length > 1 ? (
                              <Button
                                label="Delete row"
                                variant="link-neutral"
                                size="sm"
                                leadingIcon={false}
                                trailingIcon={false}
                                onClick={() => setDeleteRecord(record)}
                              />
                            ) : null}
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              )}
            </section>

            <section className="acme-profile__card" aria-labelledby="audit-trail-title">
              <h2 id="audit-trail-title" className="april-text-style april-text-style--text-lg-semibold">
                Audit trail
              </h2>
              {auditEvents.length === 0 ? (
                <p className="april-text-style april-text-style--text-md-regular">No changes recorded yet.</p>
              ) : (
                <ol className="acme-profile__timeline">
                  {auditEvents.map((event) => (
                    <li key={event.id} className="acme-profile__timeline-item">
                      <p className="april-text-style april-text-style--text-md-regular">{auditCopy(event)}</p>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        ) : null}
      </Modal>

      {editOpen && employee ? (
        <EditEmployeeModal
          employee={employee}
          onCancel={() => setEditOpen(false)}
          onSuccess={() => {
            setEditOpen(false)
            setToast({ title: "Employee updated" })
            refresh()
          }}
        />
      ) : null}
      {changeOpen && employee ? (
        <CompensationChangeModal
          employee={employee}
          currentCompensation={current}
          onCancel={() => setChangeOpen(false)}
          onSuccess={() => {
            setChangeOpen(false)
            setToast({ title: "Compensation recorded" })
            refresh()
          }}
        />
      ) : null}
      {editRecord && employee ? (
        <CompensationChangeModal
          employee={employee}
          currentCompensation={editRecord}
          record={editRecord}
          onCancel={() => setEditRecord(null)}
          onSuccess={() => {
            setEditRecord(null)
            setToast({ title: "Pay row corrected" })
            refresh()
          }}
        />
      ) : null}
      {offboardOpen && employee ? (
        <OffboardEmployeeModal
          employee={employee}
          onCancel={() => setOffboardOpen(false)}
          onSuccess={() => {
            setOffboardOpen(false)
            setToast({ title: "Marked as left" })
            refresh()
          }}
        />
      ) : null}
      {deleteHireOpen && employee ? (
        <ConfirmModal
          title="Delete hire"
          description={`Removes ${employee.first_name} ${employee.last_name} and their pay history. This cannot be undone.`}
          confirm="Delete hire"
          confirmLoading={busy}
          onCancel={() => setDeleteHireOpen(false)}
          onConfirm={async () => {
            if (busy) return
            setBusy(true)
            try {
              await destroyEmployee(employee.id)
              setToast({ title: "Hire deleted" })
              onEmployeeChanged?.()
              close()
            } catch (caught) {
              setToast({ title: caught.message || "Could not delete employee" })
            } finally {
              setBusy(false)
            }
          }}
        />
      ) : null}
      {deleteRecord && employee ? (
        <ConfirmModal
          title="Delete pay row"
          description="Removes this compensation row. Earlier and later records stay on the timeline."
          confirm="Delete row"
          confirmLoading={busy}
          onCancel={() => setDeleteRecord(null)}
          onConfirm={async () => {
            if (busy) return
            setBusy(true)
            try {
              await deleteCompensation(employee.id, deleteRecord.id)
              setDeleteRecord(null)
              setToast({ title: "Pay row deleted" })
              refresh()
            } catch (caught) {
              setToast({ title: caught.message || "Could not delete compensation" })
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
    </>
  )
}
