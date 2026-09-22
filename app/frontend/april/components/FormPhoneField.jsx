import { TextInput } from "./TextInput.jsx";
import { digitsOnlyPhone } from "../../lib/validation.js";

const DEFAULT_MAX_LENGTH = 10;

/** Form phone field — digits-only Contact Number input (10-digit Indian mobile). */
export function FormPhoneField({
  id = "form-phone",
  value = "",
  onChange,
  onBlur,
  placeholder = "E.g. 9876543210",
  state = "default",
  description,
  showDescription = false,
  fullWidth = true,
  maxLength = DEFAULT_MAX_LENGTH,
  disabled = false,
  readOnly = false,
  autoComplete = "tel",
}) {
  return (
    <TextInput
      id={id}
      showLabel={false}
      showDescription={showDescription}
      description={description}
      type="tel"
      inputMode="numeric"
      autoComplete={autoComplete}
      maxLength={maxLength}
      placeholder={placeholder}
      value={value}
      fullWidth={fullWidth}
      state={state}
      disabled={disabled}
      readOnly={readOnly}
      onBlur={onBlur}
      onChange={(event) => {
        let next = String(event.target.value || "").replace(/\D/g, "");
        // Paste/type of +91XXXXXXXXXX → keep the 10-digit mobile.
        if (next.startsWith("91") && next.length > maxLength) {
          next = next.slice(2);
        }
        next = digitsOnlyPhone(next).slice(0, maxLength);
        onChange?.({ target: { value: next } });
      }}
    />
  );
}
