/** New hire modal — identity, start date, and first compensation. */

import { useState } from "react"
import { Alert } from "../april/components/Alert"
import { FormSection } from "../april/components/FormSection"
import { Modal } from "../april/components/Modal"
import CompensationFields from "./CompensationFields"
import { EmployeeDatesFields, EmployeeDetailsFields, EmployeeJobFields } from "./EmployeeFormFields"
import { EMPLOYEE_FORM_SECTIONS } from "../lib/employeeFormSections"
import {
  firstApiFieldError,
  lookupEmployeeByEmail,
  onboardEmployee,
  onboardErrors
} from "../lib/employees"
import { todayIso } from "../lib/formDates"

function emptyForm() {
  return {
    first_name: "",
    last_name: "",
    email: "",
    country: "",
    department: "",
    job_title: "",
    employment_type: "full-time",
    level: "",
    manager_email: "",
    started_on: todayIso(),
    compensation: {
      base_amount: "",
      currency: "USD",
      pay_period: "annual",
      hours_per_week: "",
      effective_date: "",
      change_reason: "hire"
    }
  }
}

function payloadFromForm(form) {
  const compensation = {
    base_amount: form.compensation.base_amount,
    currency: form.compensation.currency,
    pay_period: form.compensation.pay_period,
    effective_date: form.compensation.effective_date || form.started_on,
    change_reason: form.compensation.change_reason || "hire"
  }
  if (form.compensation.pay_period === "hourly") {
    compensation.hours_per_week = form.compensation.hours_per_week
  }
  const payload = {
    first_name: form.first_name,
    last_name: form.last_name,
    email: form.email,
    country: form.country.trim().toUpperCase(),
    department: form.department,
    employment_type: form.employment_type,
    started_on: form.started_on,
    compensation
  }
  if (form.job_title.trim()) payload.job_title = form.job_title.trim()
  if (form.level.trim()) payload.level = form.level
  return payload
}

export default function OnboardEmployeeModal({ onCancel, onSuccess }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
    setSubmitError("")
  }

  const setCompensation = (key, value) => {
    setForm((current) => ({ ...current, compensation: { ...current.compensation, [key]: value } }))
    setErrors((current) => ({ ...current, [key]: undefined }))
    setSubmitError("")
  }

  const save = async () => {
    if (submitting) return
    const payload = payloadFromForm(form)
    const nextErrors = onboardErrors(payload)
    setErrors(nextErrors)
    setSubmitError("")
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      const managerEmail = form.manager_email.trim().toLowerCase()
      if (managerEmail) {
        const match = await lookupEmployeeByEmail(managerEmail)
        if (!match) {
          setErrors({ manager_id: "Manager not found" })
          setSubmitError("Manager not found")
          return
        }
        payload.manager_id = match.id
      }
      onSuccess?.(await onboardEmployee(payload))
    } catch (caught) {
      setErrors(caught.details || {})
      setSubmitError(firstApiFieldError(caught.details) || caught.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      backdrop
      size="lg"
      icon="person_add"
      title="Onboard Employee"
      description="Creates an active hire and the first compensation record."
      showConfirmInput={false}
      showReset={false}
      showDescription
      cancel="Cancel"
      confirm="Onboard"
      confirmLoading={submitting}
      onCancel={onCancel}
      onConfirm={save}
    >
      <div className="april-modal__container" data-april-modal-container>
        {submitError ? (
          <Alert
            color="red"
            inline
            title={submitError}
            showDescription={false}
            showButtons={false}
            dismissible={false}
          />
        ) : null}
        <FormSection title={EMPLOYEE_FORM_SECTIONS.details}>
          <EmployeeDetailsFields idPrefix="onboard" form={form} errors={errors} onChange={setField} autoFocus />
        </FormSection>
        <FormSection title={EMPLOYEE_FORM_SECTIONS.job}>
          <EmployeeJobFields
            idPrefix="onboard"
            form={form}
            errors={errors}
            onChange={setField}
            managerPlaceholder="Manager Email"
            managerDescription="Optional"
          />
        </FormSection>
        <FormSection title={EMPLOYEE_FORM_SECTIONS.compensation}>
          <CompensationFields
            idPrefix="onboard"
            values={form.compensation}
            errors={errors}
            onChange={setCompensation}
            showEffectiveDate={false}
            showChangeReason={false}
          />
        </FormSection>
        <FormSection title={EMPLOYEE_FORM_SECTIONS.dates}>
          <EmployeeDatesFields idPrefix="onboard" form={form} errors={errors} onChange={setField} />
        </FormSection>
      </div>
    </Modal>
  )
}
