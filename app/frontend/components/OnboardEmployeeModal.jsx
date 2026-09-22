import { useState } from "react"
import { FormDateField } from "../april/components/FormDateField"
import { FormFieldRow } from "../april/components/FormFieldRow"
import { FormSelectField } from "../april/components/FormSelectField"
import { Modal } from "../april/components/Modal"
import { TextInput } from "../april/components/TextInput"
import CompensationFields from "./CompensationFields"
import { EMPLOYMENT_TYPES, fieldErrorText, firstApiFieldError, onboardEmployee, onboardErrors } from "../lib/employees"
import { todayIso } from "../lib/formDates"

const TYPE_OPTIONS = EMPLOYMENT_TYPES.map((value) => ({ value, label: value }))

function emptyForm() {
  return {
    first_name: "",
    last_name: "",
    email: "",
    country: "",
    department: "",
    employment_type: "full-time",
    level: "",
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
      title="Onboard employee"
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
          <p className="april-text-style april-text-style--text-sm-regular">{submitError}</p>
        ) : null}
        <FormFieldRow label="First name" required>
          <TextInput
            id="onboard-first-name"
            showLabel={false}
            fullWidth
            autoFocus
            value={form.first_name}
            onChange={(event) => setField("first_name", event.target.value)}
            state={fieldErrorText(errors.first_name) ? "error" : "default"}
            description={fieldErrorText(errors.first_name)}
            showDescription={Boolean(fieldErrorText(errors.first_name))}
          />
        </FormFieldRow>
        <FormFieldRow label="Last name" required>
          <TextInput
            id="onboard-last-name"
            showLabel={false}
            fullWidth
            value={form.last_name}
            onChange={(event) => setField("last_name", event.target.value)}
            state={fieldErrorText(errors.last_name) ? "error" : "default"}
            description={fieldErrorText(errors.last_name)}
            showDescription={Boolean(fieldErrorText(errors.last_name))}
          />
        </FormFieldRow>
        <FormFieldRow label="Email" required>
          <TextInput
            id="onboard-email"
            showLabel={false}
            fullWidth
            type="email"
            value={form.email}
            onChange={(event) => setField("email", event.target.value)}
            state={fieldErrorText(errors.email) ? "error" : "default"}
            description={fieldErrorText(errors.email)}
            showDescription={Boolean(fieldErrorText(errors.email))}
          />
        </FormFieldRow>
        <FormFieldRow label="Country" required>
          <TextInput
            id="onboard-country"
            showLabel={false}
            fullWidth
            maxLength={2}
            placeholder="GB"
            value={form.country}
            onChange={(event) => setField("country", event.target.value.toUpperCase())}
            state={fieldErrorText(errors.country) ? "error" : "default"}
            description={fieldErrorText(errors.country)}
            showDescription={Boolean(fieldErrorText(errors.country))}
          />
        </FormFieldRow>
        <FormFieldRow label="Department" required>
          <TextInput
            id="onboard-department"
            showLabel={false}
            fullWidth
            value={form.department}
            onChange={(event) => setField("department", event.target.value)}
            state={fieldErrorText(errors.department) ? "error" : "default"}
            description={fieldErrorText(errors.department)}
            showDescription={Boolean(fieldErrorText(errors.department))}
          />
        </FormFieldRow>
        <FormFieldRow label="Employment type" required>
          <FormSelectField
            id="onboard-type"
            value={form.employment_type}
            options={TYPE_OPTIONS}
            onChange={(value) => setField("employment_type", value)}
            state={fieldErrorText(errors.employment_type) ? "error" : "default"}
            description={fieldErrorText(errors.employment_type)}
            showDescription={Boolean(fieldErrorText(errors.employment_type))}
          />
        </FormFieldRow>
        <FormFieldRow label="Level">
          <TextInput
            id="onboard-level"
            showLabel={false}
            fullWidth
            placeholder="IC2"
            value={form.level}
            onChange={(event) => setField("level", event.target.value)}
          />
        </FormFieldRow>
        <FormFieldRow label="Start date" required>
          <FormDateField
            id="onboard-started-on"
            value={form.started_on}
            onChange={(event) => setField("started_on", event.target.value)}
            state={fieldErrorText(errors.started_on) ? "error" : "default"}
            description={fieldErrorText(errors.started_on)}
            showDescription={Boolean(fieldErrorText(errors.started_on))}
          />
        </FormFieldRow>
        <CompensationFields
          idPrefix="onboard"
          values={form.compensation}
          errors={errors}
          onChange={setCompensation}
          showEffectiveDate={false}
        />
      </div>
    </Modal>
  )
}
