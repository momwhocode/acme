import { TimePickerInput } from "./TimePickerInput.jsx";

/** Form time field — April time picker with `HH:mm` value, matching FormDateField usage. */
export function FormTimeField({
  id = "form-time",
  value = "",
  onChange,
  placeholder = "hh:mm AM",
  state = "default",
  description,
  showDescription = false,
  fullWidth = true,
}) {
  return (
    <TimePickerInput
      id={id}
      showLabel={false}
      showDescription={showDescription}
      description={description}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      state={state}
      fullWidth={fullWidth}
    />
  );
}
