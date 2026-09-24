/** Employee profile as a modal over the directory (nested `/employees/:id`). */

import { useEffect, useState } from "react"
import { useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom"
import { Button } from "../april/components/Button"
import { IconMenuDropdown } from "../april/components/IconMenuDropdown"
import { Modal } from "../april/components/Modal"
import { UserAvatar } from "../april/components/UserAvatar"
import { PageLoadError } from "../april/components/PageLoadError"
import { PageToast } from "../april/components/PageToast"
import { Tag } from "../april/components/Tag"
import CompensationChangeModal from "./CompensationChangeModal"
import ConfirmModal from "./ConfirmModal"
import EditEmployeeModal from "./EditEmployeeModal"
import OffboardEmployeeModal from "./OffboardEmployeeModal"
import { deleteCompensation, destroyEmployee, getEmployee } from "../lib/employees"
import { apiData } from "../lib/http"
import { t } from "../lib/messages"
import { formatAprilDateTime, formatAprilShortDate } from "../april/renderers/date-time"
import { employeeAvatar } from "../lib/employeeAvatar"
import { EMPLOYEE_FIELD_LABELS, EMPLOYEE_FORM_SECTIONS } from "../lib/employeeFormSections"
import { annualisedLocal, displayLevel, formatMoney, titleCase } from "../lib/employeesTable"
import { renderCountryCell } from "../lib/tableCellRenderers"

function Field({ label, value }) {
  return (
    <div className="acme-profile__field">
      <dt className="april-text-style april-text-style--text-sm-regular">{label}</dt>
      <dd className="april-fieldset-label__title">{value || "—"}</dd>
    </div>
  )
}

function ProfileSection({ id, title, children }) {
  return (
    <section className="acme-profile__section" aria-labelledby={id}>
      <h2 id={id} className="april-text-style april-text-style--text-md-semibold">
        {title}
      </h2>
      {children}
    </section>
  )
}

function compensationCopy(record) {
  if (!record) return "No Pay On File."
  const hours = record.hours_per_week ? ` · ${record.hours_per_week} Hrs/Week` : ""
  return `${formatMoney(record.base_amount, record.currency)} ${titleCase(record.pay_period)}${hours}`
}

function statusLabel(status) {
  return status === "left" ? "Left" : "Active"
}

function activityItems({ auditEvents, history, current }) {
  const source = auditEvents.length
    ? auditEvents.map((event) => ({
        id: `audit-${event.id}`,
        timestamp: event.created_at,
        title: titleCase(event.action),
        detail: event.actor_name || "Hr",
        kind: "audit"
      }))
    : history.map((record) => ({
        id: `pay-${record.id}`,
        timestamp: record.effective_date,
        title: titleCase(record.change_reason || "Pay Change"),
        detail: compensationCopy(record),
        kind: "pay",
        record,
        isCurrent: Boolean(current && record.id === current.id)
      }))
  return source.sort((left, right) => String(right.timestamp).localeCompare(String(left.timestamp)))
}

function groupActivityByTimestamp(items) {
  const groups = []
  const indexByLabel = new Map()
  items.forEach((item) => {
    const label = item.timestamp?.includes?.("T")
      ? formatAprilDateTime(item.timestamp)
      : formatAprilShortDate(item.timestamp)
    if (!indexByLabel.has(label)) {
      indexByLabel.set(label, groups.length)
      groups.push({ label, items: [] })
    }
    groups[indexByLabel.get(label)].items.push(item)
  })
  return groups
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
  const [profileTab, setProfileTab] = useState("overview")
  const [editOpen, setEditOpen] = useState(false)
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
    setProfileTab("overview")
  }, [id])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError("")
    setErrorCode("")
    getEmployee(id, { signal: controller.signal })
      .then((body) => setPayload(apiData(body)))
      .catch((caught) => {
        if (caught.name === "AbortError") return
        setError(caught.message || t("errors.loadEmployee"))
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
      ? t("errors.employeeNotFound")
      : "Employee"
  const avatarUser = employee ? employeeAvatar(employee) : null
  const openOverlay = (next) => {
    setEditOpen(next === "edit")
    setEditRecord(next?.record || null)
    setOffboardOpen(next === "offboard")
    setDeleteHireOpen(next === "deleteHire")
    setDeleteRecord(next?.deleteRecord || null)
  }
  const overlayOpen = editOpen || Boolean(editRecord) || offboardOpen || deleteHireOpen || Boolean(deleteRecord)
  const moreItems = [
    ...(left ? [] : [{ label: "Start Offboarding", onClick: () => openOverlay("offboard") }]),
    { label: "Delete", onClick: () => openOverlay("deleteHire") }
  ]
  const groupedActivity = groupActivityByTimestamp(activityItems({ auditEvents, history, current }))

  const footer = employee ? (
    <div className="acme-profile-modal__actions">
      <Button
        label="Edit Record"
        variant="primary"
        size="md"
        icon="edit"
        leadingIcon
        trailingIcon={false}
        onClick={() => openOverlay("edit")}
      />
      <IconMenuDropdown
        id="employee-profile-more-menu"
        ariaLabel="More Actions"
        variant="ghost"
        size="md"
        items={moreItems}
      />
    </div>
  ) : null

  const subheader = employee ? (
    <div className="april-modal__subheader acme-profile-modal__tabs" role="tablist" aria-label="Profile Views">
      <div className={["april-tab-wrapper", profileTab === "overview" ? "april-tab-wrapper--active" : ""].filter(Boolean).join(" ")}>
        <Button
          label="Overview"
          variant="ghost"
          size="md"
          leadingIcon={false}
          trailingIcon={false}
          state={profileTab === "overview" ? "active-pressed" : null}
          role="tab"
          aria-selected={profileTab === "overview"}
          onClick={() => setProfileTab("overview")}
        />
      </div>
      <div className={["april-tab-wrapper", profileTab === "activity" ? "april-tab-wrapper--active" : ""].filter(Boolean).join(" ")}>
        <Button
          label="Activity History"
          variant="ghost"
          size="md"
          leadingIcon={false}
          trailingIcon={false}
          state={profileTab === "activity" ? "active-pressed" : null}
          role="tab"
          aria-selected={profileTab === "activity"}
          onClick={() => setProfileTab("activity")}
        />
      </div>
    </div>
  ) : null

  return (
    <>
      {overlayOpen ? null : (
      <Modal
        backdrop
        size="lg"
        icon="person"
        leading={avatarUser ? <UserAvatar user={avatarUser} size="md" /> : null}
        title={title}
        showDescription={false}
        showConfirmInput={false}
        showReset={false}
        showFooter={Boolean(employee)}
        subheader={subheader}
        footer={footer}
        onCancel={close}
        className="acme-profile-modal"
      >
        {loading ? <div className="page-loader" aria-busy="true" /> : null}
        {error && !employee && errorCode === "not_found" ? (
          <p className="april-text-style april-text-style--text-md-regular">This person is not in the directory.</p>
        ) : null}
        {error && !employee && errorCode !== "not_found" ? (
          <PageLoadError title="Couldn't load employee" onRetry={() => setReloadToken((current) => current + 1)} />
        ) : null}

        {employee && profileTab === "overview" ? (
          <div className="acme-profile__stack acme-profile-modal__stack">
            <ProfileSection id="profile-details-title" title={EMPLOYEE_FORM_SECTIONS.details}>
              <dl className="acme-profile__grid">
                <Field label={EMPLOYEE_FIELD_LABELS.firstName} value={employee.first_name} />
                <Field label={EMPLOYEE_FIELD_LABELS.lastName} value={employee.last_name} />
                <Field label={EMPLOYEE_FIELD_LABELS.email} value={employee.email} />
                <Field label={EMPLOYEE_FIELD_LABELS.country} value={renderCountryCell(employee.country)} />
                <Field label={EMPLOYEE_FIELD_LABELS.status} value={statusLabel(employee.status)} />
              </dl>
            </ProfileSection>

            <ProfileSection id="profile-job-title" title={EMPLOYEE_FORM_SECTIONS.job}>
              <dl className="acme-profile__grid">
                <Field label={EMPLOYEE_FIELD_LABELS.jobTitle} value={employee.job_title} />
                <Field label={EMPLOYEE_FIELD_LABELS.level} value={displayLevel(employee.level)} />
                <Field label={EMPLOYEE_FIELD_LABELS.department} value={titleCase(employee.department)} />
                <Field label={EMPLOYEE_FIELD_LABELS.type} value={titleCase(employee.employment_type)} />
                <Field label={EMPLOYEE_FIELD_LABELS.manager} value={employee.manager_name} />
              </dl>
            </ProfileSection>

            <ProfileSection id="profile-comp-title" title={EMPLOYEE_FORM_SECTIONS.compensation}>
              {current ? (
                <dl className="acme-profile__grid">
                  <Field label={EMPLOYEE_FIELD_LABELS.payType} value={titleCase(current.pay_period)} />
                  {current.pay_period === "hourly" ? (
                    <>
                      <Field label={EMPLOYEE_FIELD_LABELS.rate} value={`${formatMoney(current.base_amount, current.currency)} / Hour`} />
                      <Field
                        label={EMPLOYEE_FIELD_LABELS.hours}
                        value={current.hours_per_week ? `${current.hours_per_week} / Week` : "—"}
                      />
                    </>
                  ) : current.pay_period !== "annual" ? (
                    <Field
                      label={EMPLOYEE_FIELD_LABELS.rate}
                      value={`${formatMoney(current.base_amount, current.currency)} / ${titleCase(current.pay_period)}`}
                    />
                  ) : null}
                  <Field
                    label={EMPLOYEE_FIELD_LABELS.annualSalary}
                    value={formatMoney(annualisedLocal(current), current.currency)}
                  />
                  <Field label={EMPLOYEE_FIELD_LABELS.effective} value={formatAprilShortDate(current.effective_date)} />
                </dl>
              ) : (
                <p className="april-text-style april-text-style--text-md-regular">No Pay On File.</p>
              )}
            </ProfileSection>

            <ProfileSection id="profile-dates-title" title={EMPLOYEE_FORM_SECTIONS.dates}>
              <dl className="acme-profile__grid">
                <Field label={EMPLOYEE_FIELD_LABELS.startDate} value={formatAprilShortDate(employee.started_on)} />
                <Field label={EMPLOYEE_FIELD_LABELS.endDate} value={formatAprilShortDate(employee.left_on)} />
              </dl>
            </ProfileSection>
          </div>
        ) : null}

        {employee && profileTab === "activity" ? (
          <div className="acme-profile__stack acme-profile-modal__stack">
            {groupedActivity.length === 0 ? (
              <p className="april-text-style april-text-style--text-md-regular">No Changes Yet.</p>
            ) : (
              <ol className="acme-profile__timeline">
                {groupedActivity.map((group) => (
                  <li key={group.label} className="acme-profile__timeline-item">
                    <div className="acme-profile__timeline-when">
                      <p className="april-text-style april-text-style--text-sm-semibold">{group.label}</p>
                    </div>
                    <div>
                      {group.items.map((item) => (
                        <div key={item.id}>
                          <p className="april-text-style april-text-style--text-md-semibold">
                            {item.title}
                            {item.isCurrent ? (
                              <>
                                {" "}
                                <Tag type="success" label="Current" leadingIcon={false} trailingIcon={false} />
                              </>
                            ) : null}
                          </p>
                          <p className="april-text-style april-text-style--text-md-regular">{item.detail}</p>
                          {item.kind === "pay" ? (
                            <div>
                              <Button
                                label="Correct"
                                variant="link-neutral"
                                size="sm"
                                leadingIcon={false}
                                trailingIcon={false}
                                onClick={() => openOverlay({ record: item.record })}
                              />
                              {history.length > 1 ? (
                                <Button
                                  label="Delete Row"
                                  variant="link-neutral"
                                  size="sm"
                                  leadingIcon={false}
                                  trailingIcon={false}
                                  onClick={() => openOverlay({ deleteRecord: item.record })}
                                />
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ) : null}
      </Modal>
      )}

      {editOpen && employee ? (
        <EditEmployeeModal
          employee={employee}
          onCancel={() => openOverlay(null)}
          onSuccess={() => {
            openOverlay(null)
            setToast({ title: t("success.employeeUpdated") })
            refresh()
          }}
        />
      ) : null}
      {editRecord && employee ? (
        <CompensationChangeModal
          employee={employee}
          currentCompensation={editRecord}
          record={editRecord}
          onCancel={() => openOverlay(null)}
          onSuccess={() => {
            openOverlay(null)
            setToast({ title: t("success.payRowCorrected") })
            refresh()
          }}
        />
      ) : null}
      {offboardOpen && employee ? (
        <OffboardEmployeeModal
          employee={employee}
          onCancel={() => openOverlay(null)}
          onSuccess={() => {
            openOverlay(null)
            setToast({ title: t("success.employeeOffboarded") })
            refresh()
          }}
        />
      ) : null}
      {deleteHireOpen && employee ? (
        <ConfirmModal
          title="Delete"
          description={`Removes ${employee.first_name} ${employee.last_name} and their pay history. This cannot be undone.`}
          confirm="Delete"
          confirmLoading={busy}
          onCancel={() => openOverlay(null)}
          onConfirm={async () => {
            if (busy) return
            setBusy(true)
            try {
              await destroyEmployee(employee.id)
              setToast({ title: t("success.employeeDeleted") })
              onEmployeeChanged?.()
              close()
            } catch (caught) {
              setToast({ title: caught.message || t("errors.deleteEmployee") })
            } finally {
              setBusy(false)
            }
          }}
        />
      ) : null}
      {deleteRecord && employee ? (
        <ConfirmModal
          title="Delete Row"
          description="Removes this compensation row. Earlier and later records stay on the timeline."
          confirm="Delete Row"
          confirmLoading={busy}
          onCancel={() => openOverlay(null)}
          onConfirm={async () => {
            if (busy) return
            setBusy(true)
            try {
              await deleteCompensation(employee.id, deleteRecord.id)
              openOverlay(null)
              setToast({ title: t("success.payRowDeleted") })
              refresh()
            } catch (caught) {
              setToast({ title: caught.message || t("errors.deleteCompensation") })
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
