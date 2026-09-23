import { useState } from "react"
import { Alert } from "../april/components/Alert"
import { FormDateField } from "../april/components/FormDateField"
import { FormFieldRow } from "../april/components/FormFieldRow"
import { FormSection } from "../april/components/FormSection"
import { Modal } from "../april/components/Modal"
import { firstApiFieldError, offboardEmployee, offboardErrors } from "../lib/employees"
import { todayIso } from "../lib/formDates"

export default function OffboardEmployeeModal({ employee, onCancel, onSuccess }) {
  const [leftOn, setLeftOn] = useState(() => todayIso())
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const save = async () => {
    if (submitting) return
    const nextError = offboardErrors({ left_on: leftOn, started_on: employee.started_on }).left_on || ""
    setError(nextError)
    if (nextError) return

    setSubmitting(true)
    try {
      onSuccess?.(await offboardEmployee(employee.id, { left_on: leftOn, started_on: employee.started_on }))
    } catch (caught) {
      setError(firstApiFieldError(caught.details) || caught.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      backdrop
      size="md"
      icon="person_off"
      title="Mark as left"
      description="Removes this person from active payroll. Compensation history stays on the timeline."
      showConfirmInput={false}
      showReset={false}
      showDescription
      cancel="Cancel"
      confirm="Mark as left"
      confirmLoading={submitting}
      onCancel={onCancel}
      onConfirm={save}
    >
      <div className="april-modal__container" data-april-modal-container>
        {error ? (
          <Alert
            color="red"
            inline
            title={error}
            showDescription={false}
            showButtons={false}
            dismissible={false}
          />
        ) : null}
        <FormSection title="Leave date">
          <FormFieldRow label="Left on" required>
            <FormDateField
              id="offboard-left-on"
              value={leftOn}
              minDate={employee.started_on || ""}
              onChange={(event) => {
                setLeftOn(event.target.value)
                setError("")
              }}
              state={error ? "error" : "default"}
            />
          </FormFieldRow>
        </FormSection>
      </div>
    </Modal>
  )
}
