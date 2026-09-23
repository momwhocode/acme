import { useState } from "react"
import { Alert } from "../april/components/Alert"
import { FormFieldRow } from "../april/components/FormFieldRow"
import { FormSection } from "../april/components/FormSection"
import { Modal } from "../april/components/Modal"
import { TextInput } from "../april/components/TextInput"
import CompensationFields from "./CompensationFields"
import { addCompensation, compensationChangeErrors, firstApiFieldError } from "../lib/employees"
import { todayIso } from "../lib/formDates"

function formFromCurrent(current = {}, employee = {}) {
  return {
    level: employee.level || "",
    base_amount: current.base_amount ?? "",
    currency: current.currency || "USD",
    pay_period: current.pay_period || "annual",
    hours_per_week: current.hours_per_week ?? "",
    effective_date: todayIso(),
    change_reason: ""
  }
}

function payloadFromForm(form) {
  const payload = {
    base_amount: form.base_amount,
    currency: form.currency,
    pay_period: form.pay_period,
    effective_date: form.effective_date,
    change_reason: form.change_reason
  }
  if (form.pay_period === "hourly") payload.hours_per_week = form.hours_per_week
  if (form.level.trim() !== "") payload.level = form.level
  return payload
}

export default function CompensationChangeModal({ employee, currentCompensation, onCancel, onSuccess }) {
  const [form, setForm] = useState(() => formFromCurrent(currentCompensation, employee))
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
    setSubmitError("")
  }

  const save = async () => {
    if (submitting) return
    const payload = payloadFromForm(form)
    const nextErrors = compensationChangeErrors(payload)
    setErrors(nextErrors)
    setSubmitError("")
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      onSuccess?.(await addCompensation(employee.id, payload))
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
      icon="payments"
      title="Record pay change"
      description="Adds an effective-dated raise or promotion. Previous records stay on the timeline."
      showConfirmInput={false}
      showReset={false}
      showDescription
      cancel="Cancel"
      confirm="Save change"
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
        <FormSection title="Compensation">
          <FormFieldRow label="Level">
            <TextInput
              id="comp-change-level"
              showLabel={false}
              fullWidth
              value={form.level}
              onChange={(event) => setField("level", event.target.value)}
            />
          </FormFieldRow>
          <CompensationFields
            idPrefix="comp-change"
            values={form}
            errors={errors}
            onChange={setField}
          />
        </FormSection>
      </div>
    </Modal>
  )
}
