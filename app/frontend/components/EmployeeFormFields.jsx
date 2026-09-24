/** Shared onboard/edit fields — same labels, order, and dropdowns on new and edit. */

import { FormDateField } from "../april/components/FormDateField"
import { FormFieldRow } from "../april/components/FormFieldRow"
import { FormSelectField } from "../april/components/FormSelectField"
import { TextInput } from "../april/components/TextInput"
import { EMPLOYEE_FIELD_LABELS } from "../lib/employeeFormSections"
import {
  TYPE_SELECT_OPTIONS,
  countrySelectOptions,
  departmentSelectOptions,
  levelSelectOptions
} from "../lib/employeeFormOptions"
import { fieldErrorText } from "../lib/employees"

export function EmployeeDetailsFields({ idPrefix, form, errors, onChange, autoFocus = false }) {
  return (
    <>
      <FormFieldRow label={EMPLOYEE_FIELD_LABELS.firstName} required>
        <TextInput
          id={`${idPrefix}-first-name`}
          showLabel={false}
          fullWidth
          autoFocus={autoFocus}
          placeholder={EMPLOYEE_FIELD_LABELS.firstName}
          value={form.first_name}
          onChange={(event) => onChange("first_name", event.target.value)}
          state={fieldErrorText(errors.first_name) ? "error" : "default"}
          description={fieldErrorText(errors.first_name)}
          showDescription={Boolean(fieldErrorText(errors.first_name))}
        />
      </FormFieldRow>
      <FormFieldRow label={EMPLOYEE_FIELD_LABELS.lastName} required>
        <TextInput
          id={`${idPrefix}-last-name`}
          showLabel={false}
          fullWidth
          placeholder={EMPLOYEE_FIELD_LABELS.lastName}
          value={form.last_name}
          onChange={(event) => onChange("last_name", event.target.value)}
          state={fieldErrorText(errors.last_name) ? "error" : "default"}
          description={fieldErrorText(errors.last_name)}
          showDescription={Boolean(fieldErrorText(errors.last_name))}
        />
      </FormFieldRow>
      <FormFieldRow label={EMPLOYEE_FIELD_LABELS.email} required>
        <TextInput
          id={`${idPrefix}-email`}
          showLabel={false}
          fullWidth
          type="email"
          value={form.email}
          onChange={(event) => onChange("email", event.target.value)}
          state={fieldErrorText(errors.email) ? "error" : "default"}
          description={fieldErrorText(errors.email)}
          showDescription={Boolean(fieldErrorText(errors.email))}
        />
      </FormFieldRow>
      <FormFieldRow label={EMPLOYEE_FIELD_LABELS.country} required>
        <FormSelectField
          id={`${idPrefix}-country`}
          value={form.country}
          options={countrySelectOptions(form.country)}
          placeholder={EMPLOYEE_FIELD_LABELS.country}
          onChange={(value) => onChange("country", value)}
          state={fieldErrorText(errors.country) ? "error" : "default"}
          description={fieldErrorText(errors.country)}
          showDescription={Boolean(fieldErrorText(errors.country))}
        />
      </FormFieldRow>
    </>
  )
}

export function EmployeeJobFields({
  idPrefix,
  form,
  errors,
  onChange,
  managerPlaceholder = EMPLOYEE_FIELD_LABELS.manager,
  managerDescription = ""
}) {
  return (
    <>
      <FormFieldRow label={EMPLOYEE_FIELD_LABELS.jobTitle}>
        <TextInput
          id={`${idPrefix}-job-title`}
          showLabel={false}
          fullWidth
          placeholder={EMPLOYEE_FIELD_LABELS.jobTitle}
          value={form.job_title}
          onChange={(event) => onChange("job_title", event.target.value)}
        />
      </FormFieldRow>
      <FormFieldRow label={EMPLOYEE_FIELD_LABELS.level}>
        <FormSelectField
          id={`${idPrefix}-level`}
          value={form.level}
          options={levelSelectOptions(form.level)}
          placeholder={EMPLOYEE_FIELD_LABELS.level}
          onChange={(value) => onChange("level", value)}
        />
      </FormFieldRow>
      <FormFieldRow label={EMPLOYEE_FIELD_LABELS.department} required>
        <FormSelectField
          id={`${idPrefix}-department`}
          value={form.department}
          options={departmentSelectOptions(form.department)}
          placeholder={EMPLOYEE_FIELD_LABELS.department}
          onChange={(value) => onChange("department", value)}
          state={fieldErrorText(errors.department) ? "error" : "default"}
          description={fieldErrorText(errors.department)}
          showDescription={Boolean(fieldErrorText(errors.department))}
        />
      </FormFieldRow>
      <FormFieldRow label={EMPLOYEE_FIELD_LABELS.type} required>
        <FormSelectField
          id={`${idPrefix}-type`}
          value={form.employment_type}
          options={TYPE_SELECT_OPTIONS}
          onChange={(value) => onChange("employment_type", value)}
          state={fieldErrorText(errors.employment_type) ? "error" : "default"}
          description={fieldErrorText(errors.employment_type)}
          showDescription={Boolean(fieldErrorText(errors.employment_type))}
        />
      </FormFieldRow>
      <FormFieldRow label={EMPLOYEE_FIELD_LABELS.manager}>
        <TextInput
          id={`${idPrefix}-manager-email`}
          showLabel={false}
          fullWidth
          type="email"
          placeholder={managerPlaceholder}
          value={form.manager_email}
          onChange={(event) => onChange("manager_email", event.target.value)}
          state={fieldErrorText(errors.manager_id) ? "error" : "default"}
          description={fieldErrorText(errors.manager_id) || managerDescription}
          showDescription={Boolean(fieldErrorText(errors.manager_id) || managerDescription)}
        />
      </FormFieldRow>
    </>
  )
}

export function EmployeeDatesFields({ idPrefix, form, errors, onChange }) {
  return (
    <FormFieldRow label={EMPLOYEE_FIELD_LABELS.startDate} required>
      <FormDateField
        id={`${idPrefix}-started-on`}
        value={form.started_on}
        onChange={(event) => onChange("started_on", event.target.value)}
        state={fieldErrorText(errors.started_on) ? "error" : "default"}
        description={fieldErrorText(errors.started_on)}
        showDescription={Boolean(fieldErrorText(errors.started_on))}
      />
    </FormFieldRow>
  )
}
