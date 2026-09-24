/** Edit identity and employment fields for an existing hire. */

import { useState } from "react"
import { Alert } from "../april/components/Alert"
import { FormSection } from "../april/components/FormSection"
import { Modal } from "../april/components/Modal"
import { EmployeeDatesFields, EmployeeDetailsFields, EmployeeJobFields } from "./EmployeeFormFields"
import { EMPLOYEE_FORM_SECTIONS } from "../lib/employeeFormSections"
import { formLevelValue } from "../lib/employeeFormOptions"
import {
  employeeIdentityErrors,
  firstApiFieldError,
  lookupEmployeeByEmail,
  updateEmployee
} from "../lib/employees"

function formFromEmployee(employee = {}) {
  return {
    first_name: employee.first_name || "",
    last_name: employee.last_name || "",
    email: employee.email || "",
    country: employee.country || "",
    department: employee.department || "",
    job_title: employee.job_title || "",
    employment_type: employee.employment_type || "full-time",
    level: formLevelValue(employee.level),
    started_on: employee.started_on || "",
    manager_email: ""
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
    job_title: form.job_title.trim(),
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
      const managerEmail = form.manager_email.trim().toLowerCase()
      if (managerEmail) {
        const match = await lookupEmployeeByEmail(managerEmail)
        if (!match) {
          setErrors({ manager_id: "Manager not found" })
          setSubmitError("Manager not found")
          return
        }
        payload.manager_id = match.id
      } else {
        payload.manager_id = employee.manager_id || null
      }
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
      title="Edit Employee"
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
        <FormSection title={EMPLOYEE_FORM_SECTIONS.details}>
          <EmployeeDetailsFields idPrefix="edit" form={form} errors={errors} onChange={setField} autoFocus />
        </FormSection>
        <FormSection title={EMPLOYEE_FORM_SECTIONS.job}>
          <EmployeeJobFields
            idPrefix="edit"
            form={form}
            errors={errors}
            onChange={setField}
            managerPlaceholder={employee.manager_name ? `Current: ${employee.manager_name}` : "Manager Email"}
            managerDescription={employee.manager_name ? `Reports to ${employee.manager_name}` : "Optional"}
          />
        </FormSection>
        <FormSection title={EMPLOYEE_FORM_SECTIONS.dates}>
          <EmployeeDatesFields idPrefix="edit" form={form} errors={errors} onChange={setField} />
        </FormSection>
      </div>
    </Modal>
  )
}
