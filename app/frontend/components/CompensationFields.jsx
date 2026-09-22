import { FormDateField } from "../april/components/FormDateField"
import { FormFieldRow } from "../april/components/FormFieldRow"
import { FormSelectField } from "../april/components/FormSelectField"
import { TextInput } from "../april/components/TextInput"
import { CURRENCIES, PAY_PERIODS, fieldErrorText } from "../lib/employees"

const CURRENCY_OPTIONS = CURRENCIES.map((value) => ({ value, label: value }))
const PERIOD_OPTIONS = PAY_PERIODS.map((value) => ({ value, label: value }))

export default function CompensationFields({
  idPrefix,
  values,
  errors = {},
  onChange,
  showEffectiveDate = true,
  showChangeReason = true
}) {
  const hourly = values.pay_period === "hourly"

  return (
    <>
      <FormFieldRow label="Amount" required>
        <TextInput
          id={`${idPrefix}-amount`}
          showLabel={false}
          fullWidth
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={values.base_amount}
          onChange={(event) => onChange("base_amount", event.target.value)}
          state={fieldErrorText(errors.base_amount) ? "error" : "default"}
          description={fieldErrorText(errors.base_amount)}
          showDescription={Boolean(fieldErrorText(errors.base_amount))}
        />
      </FormFieldRow>
      <FormFieldRow label="Currency" required>
        <FormSelectField
          id={`${idPrefix}-currency`}
          value={values.currency}
          options={CURRENCY_OPTIONS}
          onChange={(value) => onChange("currency", value)}
          state={fieldErrorText(errors.currency) ? "error" : "default"}
          description={fieldErrorText(errors.currency)}
          showDescription={Boolean(fieldErrorText(errors.currency))}
        />
      </FormFieldRow>
      <FormFieldRow label="Pay period" required>
        <FormSelectField
          id={`${idPrefix}-pay-period`}
          value={values.pay_period}
          options={PERIOD_OPTIONS}
          onChange={(value) => onChange("pay_period", value)}
          state={fieldErrorText(errors.pay_period) ? "error" : "default"}
          description={fieldErrorText(errors.pay_period)}
          showDescription={Boolean(fieldErrorText(errors.pay_period))}
        />
      </FormFieldRow>
      {hourly ? (
        <FormFieldRow label="Hours / week" required>
          <TextInput
            id={`${idPrefix}-hours`}
            showLabel={false}
            fullWidth
            type="number"
            inputMode="decimal"
            min="0.01"
            max="168"
            step="0.25"
            value={values.hours_per_week}
            onChange={(event) => onChange("hours_per_week", event.target.value)}
            state={fieldErrorText(errors.hours_per_week) ? "error" : "default"}
            description={fieldErrorText(errors.hours_per_week)}
            showDescription={Boolean(fieldErrorText(errors.hours_per_week))}
          />
        </FormFieldRow>
      ) : null}
      {showEffectiveDate ? (
        <FormFieldRow label="Effective date" required>
          <FormDateField
            id={`${idPrefix}-effective-date`}
            value={values.effective_date}
            onChange={(event) => onChange("effective_date", event.target.value)}
            state={fieldErrorText(errors.effective_date) ? "error" : "default"}
            description={fieldErrorText(errors.effective_date)}
            showDescription={Boolean(fieldErrorText(errors.effective_date))}
          />
        </FormFieldRow>
      ) : null}
      {showChangeReason ? (
        <FormFieldRow label="Reason">
          <TextInput
            id={`${idPrefix}-reason`}
            showLabel={false}
            fullWidth
            placeholder="hire, raise, promotion"
            value={values.change_reason}
            onChange={(event) => onChange("change_reason", event.target.value)}
            state={fieldErrorText(errors.change_reason) ? "error" : "default"}
            description={fieldErrorText(errors.change_reason)}
            showDescription={Boolean(fieldErrorText(errors.change_reason))}
          />
        </FormFieldRow>
      ) : null}
    </>
  )
}
