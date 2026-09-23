import { useRef, useState } from "react"
import { Alert } from "../april/components/Alert"
import { Button } from "../april/components/Button"
import { FormFieldRow } from "../april/components/FormFieldRow"
import { FormSection } from "../april/components/FormSection"
import { Modal } from "../april/components/Modal"
import { TextInput } from "../april/components/TextInput"
import { firstApiFieldError, importEmployees, importErrors } from "../lib/employees"

export default function ImportEmployeesModal({ onCancel, onSuccess }) {
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const chooseFile = () => fileInputRef.current?.click()

  const save = async () => {
    if (submitting) return
    const nextError = importErrors(file).file || ""
    if (nextError) {
      setError(nextError)
      return
    }

    setSubmitting(true)
    setError("")
    try {
      onSuccess?.(await importEmployees(file))
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
      icon="upload"
      title="Import employees"
      description="Bring records over from the spreadsheet ACME is retiring. Existing emails are skipped."
      showConfirmInput={false}
      showReset={false}
      showDescription
      cancel="Cancel"
      confirm="Import"
      confirmLoading={submitting}
      onCancel={onCancel}
      onConfirm={save}
    >
      <div className="april-modal__container" data-april-modal-container>
        {error && file ? (
          <Alert
            color="red"
            inline
            title={error}
            showDescription={false}
            showButtons={false}
            dismissible={false}
          />
        ) : null}
        <FormSection
          title="CSV"
          description="Repeat an email for each compensation change. Invalid rows fail the whole import."
        >
          <FormFieldRow label="File" required>
            <div className="acme-file-field">
              <input
                id="import-file"
                ref={fileInputRef}
                className="acme-file-field__input"
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => {
                  setFile(event.target.files?.[0] || null)
                  setError("")
                }}
              />
              <label className="acme-file-field__name" htmlFor="import-file">
                <TextInput
                  id="import-file-name"
                  showLabel={false}
                  fullWidth
                  readOnly
                  placeholder="No file chosen"
                  value={file?.name || ""}
                  state={error ? "error" : "default"}
                  description={error}
                  showDescription={Boolean(error)}
                />
              </label>
              <Button
                label={file ? "Change file" : "Choose file"}
                variant="outlined"
                size="md"
                icon="upload"
                leadingIcon
                trailingIcon={false}
                onClick={chooseFile}
              />
            </div>
          </FormFieldRow>
          <p className="april-text-style april-text-style--text-sm-regular">
            <a href="/templates/acme-employees.csv" download>
              Download the column template
            </a>
          </p>
        </FormSection>
      </div>
    </Modal>
  )
}
