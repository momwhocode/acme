import { useEffect, useRef } from "react";
import { loadGoogleMapsPlaces, placeToAddress } from "../../lib/googleMaps.js";
import { TextInput } from "./TextInput.jsx";

const DEFAULT_PLACEHOLDER = "Search for an address";

/** Address field with Google Places Autocomplete. */
export function FormAddressField({
  id = "form-address",
  value = "",
  onChange,
  onBlur,
  onPlace,
  placeholder = DEFAULT_PLACEHOLDER,
  state = "default",
  description,
  showDescription = false,
  fullWidth = true,
  maxLength,
  disabled = false,
  readOnly = false,
  autoComplete = "off",
  autoFocus = false,
}) {
  const inputRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const onPlaceRef = useRef(onPlace);

  useEffect(() => {
    onChangeRef.current = onChange;
    onPlaceRef.current = onPlace;
  }, [onChange, onPlace]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input || disabled || readOnly) return undefined;

    let cancelled = false;
    let autocomplete;

    loadGoogleMapsPlaces()
      .then(async (google) => {
        if (cancelled || !input.isConnected) return;
        if (google?.maps?.importLibrary) {
          await google.maps.importLibrary("places");
        }
        const AutocompleteCtor = google?.maps?.places?.Autocomplete;
        if (!AutocompleteCtor) return;
        autocomplete = new AutocompleteCtor(input, {
          componentRestrictions: { country: "in" },
        });
        if (typeof autocomplete.setFields === "function") {
          autocomplete.setFields(["formatted_address", "address_components", "geometry", "name", "url"]);
        }
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          const address = placeToAddress(place);
          if (!address) return;
          onChangeRef.current?.({ target: { value: address } });
          onPlaceRef.current?.(place);
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (autocomplete && window.google?.maps?.event?.clearInstanceListeners) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [disabled, readOnly]);

  return (
    <TextInput
      id={id}
      inputRef={inputRef}
      showLabel={false}
      showDescription={showDescription}
      description={description}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      maxLength={maxLength}
      placeholder={placeholder}
      value={value}
      fullWidth={fullWidth}
      state={state}
      disabled={disabled}
      readOnly={readOnly}
      onBlur={onBlur}
      onChange={onChange}
    />
  );
}
