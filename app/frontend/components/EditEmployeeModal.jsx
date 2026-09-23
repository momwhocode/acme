import { useState } from "react"
import { Alert } from "../april/components/Alert"
import { FormDateField } from "../april/components/FormDateField"
import { FormFieldRow } from "../april/components/FormFieldRow"
import { FormSection } from "../april/components/FormSection"
import { FormSelectField } from "../april/components/FormSelectField"
import { Modal } from "../april/components/Modal"
import { TextInput } from "../april/components/TextInput"
import {
  EMPLOYMENT_TYPES,
  employeeIdentityErrors,
  fieldErrorText,
  firstApiFieldError,
  updateEmployee
} from "../lib/employees"

const TYPE_OPTIONS = EMPLOYMENT_TYPES.map((value) => ({ value, label: value }))

function formFromEmployee(employee = {}) {
  return {
    first_name: employee.first_name || "",
    last_name: employee.last_name || "",
    email: employee.email || "",
    country: employee.country || "",
    department: employee.department || "",
    employment_type: employee.employment_type || "full-time",
    level: employee.level || "",
    started_on: employee.started_on || ""
  }
}

function payloadFromForm(form) {
  return {
    first_name: form.first_name,
    last_name: form.last_name,
    email: form.email,
    country: form.country.trim().toUpperCase(),
    department: form.department,
    employment_type: form.employment_type,
    started_on: form.started_on,
    level: form.level.trim()
  }
}

export default function EditEmployeeModal({ employee, onCancel, onSuccess }) {
  const [form, setForm] = useState(() => formFromEmployee(employee))
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
    const nextErrors = employeeIdentityErrors(payload)
    setErrors(nextErrors)
    setSubmitError("")
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      onSuccess?.(await updateEmployee(employee.id, payload))
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
      icon="edit"
      title="Edit employee"
      description="Updates profile details. Pay changes stay on the compensation timeline."
      showConfirmInput={false}
      showReset={false}
      showDescription
      cancel="Cancel"
      confirm="Save changes"
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
        <FormSection title="Employee">
          <FormFieldRow label="Name" required>
            <div className="april-modal__form-grid">
              <TextInput
                id="edit-first-name"
                showLabel={false}
                fullWidth
                autoFocus
                placeholder="First name"
                value={form.first_name}
                onChange={(event) => setField("first_name", event.target.value)}
                state={fieldErrorText(errors.first_name) ? "error" : "default"}
                description={fieldErrorText(errors.first_name)}
                showDescription={Boolean(fieldErrorText(errors.first_name))}
              />
              <TextInput
                id="edit-last-name"
                showLabel={false}
                fullWidth
                placeholder="Last name"
                value={form.last_name}
                onChange={(event) => setField("last_name", event.target.value)}
                state={fieldErrorText(errors.last_name) ? "error" : "default"}
                description={fieldErrorText(errors.last_name)}
                showDescription={Boolean(fieldErrorText(errors.last_name))}
              />
            </div>
          </FormFieldRow>
          <FormFieldRow label="Email" required>
            <TextInput
              id="edit-email"
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
          <FormFieldRow label="Team" required>
            <div className="april-modal__form-grid">
              <TextInput
                id="edit-country"
                showLabel={false}
                fullWidth
                maxLength={2}
                placeholder="Country"
                value={form.country}
                onChange={(event) => setField("country", event.target.value.toUpperCase())}
                state={fieldErrorText(errors.country) ? "error" : "default"}
                description={fieldErrorText(errors.country)}
                showDescription={Boolean(fieldErrorText(errors.country))}
              />
              <TextInput
                id="edit-department"
                showLabel={false}
                fullWidth
                placeholder="Department"
                value={form.department}
                onChange={(event) => setField("department", event.target.value)}
                state={fieldErrorText(errors.department) ? "error" : "default"}
                description={fieldErrorText(errors.department)}
                showDescription={Boolean(fieldErrorText(errors.department))}
              />
            </div>
          </FormFieldRow>
          <FormFieldRow label="Role" required>
            <div className="april-modal__form-grid">
              <FormSelectField
                id="edit-type"
                value={form.employment_type}
                options={TYPE_OPTIONS}
                onChange={(value) => setField("employment_type", value)}
                state={fieldErrorText(errors.employment_type) ? "error" : "default"}
                description={fieldErrorText(errors.employment_type)}
                showDescription={Boolean(fieldErrorText(errors.employment_type))}
              />
              <TextInput
                id="edit-level"
                showLabel={false}
                fullWidth
                placeholder="Level"
                value={form.level}
                onChange={(event) => setField("level", event.target.value)}
              />
            </div>
          </FormFieldRow>
          <FormFieldRow label="Start date" required>
            <FormDateField
              id="edit-started-on"
              value={form.started_on}
              onChange={(event) => setField("started_on", event.target.value)}
              state={fieldErrorText(errors.started_on) ? "error" : "default"}
              description={fieldErrorText(errors.started_on)}
              showDescription={Boolean(fieldErrorText(errors.started_on))}
            />
          </FormFieldRow>
        </FormSection>
      </div>
    </Modal>
  )
}
