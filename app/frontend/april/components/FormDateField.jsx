import { DatePickerInput } from "./DatePickerInput.jsx";

/** Form date field — April date picker with ISO value, matching FormSelectField usage. */
export function FormDateField({
  id = "form-date",
  value = "",
  onChange,
  placeholder = "MM/DD/YYYY",
  state = "default",
  description,
  showDescription = false,
  fullWidth = true,
  minDate = "",
}) {
  return (
    <DatePickerInput
      id={id}
      showLabel={false}
      showDescription={showDescription}
      description={description}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      state={state}
      fullWidth={fullWidth}
      minDate={minDate}
    />
  );
}
