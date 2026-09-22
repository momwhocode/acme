import { useEffect, useState } from "react";
import { Modal } from "./Modal.jsx";
import { FormSearchSelectField } from "./FormSearchSelectField.jsx";
import { FormSelectField } from "./FormSelectField.jsx";

function selectedValue(value) {
  if (Array.isArray(value)) return value[0] ?? "all";
  return value || "all";
}

function withAllOption(options = []) {
  const normalized = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option
  );
  return normalized.some((option) => option.value === "all")
    ? normalized
    : [{ value: "all", label: "All" }, ...normalized];
}

function FilterModalField({ field, fieldId, value, onChange }) {
  const options = withAllOption(field.dropdownOptions);
  const SelectComponent = field.searchable ? FormSearchSelectField : FormSelectField;

  return (
    <div className="april-modal__filter-field">
      <label
        className="april-select-input__label"
        htmlFor={field.searchable ? `${fieldId}-input` : `${fieldId}-input-trigger`}
      >
        {field.filterLabel}
      </label>
      <SelectComponent
        id={fieldId}
        value={value}
        options={options}
        placeholder={field.searchable ? `Search ${field.filterLabel.toLowerCase()}` : "All"}
        onChange={onChange}
      />
    </div>
  );
}

function FilterModalForm({ fields, values, onChange, idPrefix = "filter-modal" }) {
  return (
    <div className="april-modal__container april-modal__container--filter" data-april-modal-container>
      <div className="april-modal__form-grid">
        {fields.map((field) => (
          <FilterModalField
            key={field.filterKey}
            field={field}
            fieldId={`${idPrefix}-${field.filterKey}`}
            value={values[field.filterKey] ?? "all"}
            onChange={(value) => onChange(field.filterKey, value)}
          />
        ))}
      </div>
    </div>
  );
}

/** Filter modal — lg filter pattern from UI Patterns / Modal (Figma 456:6660). */
export function FilterModal({
  open = false,
  id = "filter-modal",
  title = "Filter",
  fields = [],
  cancelLabel = "Cancel",
  confirmLabel = "Apply Filter",
  resetLabel = "Reset All",
  showReset = true,
  filterValues = {},
  onClose,
  onConfirm,
  onFilterChange,
}) {
  const [draftValues, setDraftValues] = useState({});

  useEffect(() => {
    if (!open) return;
    setDraftValues(
      Object.fromEntries(
        fields.map((field) => [field.filterKey, selectedValue(filterValues[field.filterKey])])
      )
    );
  }, [fields, filterValues, open]);

  if (!open) return null;

  const reset = () => {
    setDraftValues(Object.fromEntries(fields.map((field) => [field.filterKey, "all"])));
  };

  const confirm = () => {
    fields.forEach((field) => {
      const value = draftValues[field.filterKey];
      onFilterChange?.(field.filterKey, !value || value === "all" ? [] : [value]);
    });
    onConfirm?.();
  };

  return (
    <Modal
      backdrop
      size="lg"
      title={title}
      icon="filter_list"
      showDescription={false}
      showConfirmInput={false}
      cancel={cancelLabel}
      confirm={confirmLabel}
      resetLabel={resetLabel}
      showReset={showReset}
      onCancel={onClose}
      onConfirm={confirm}
      onReset={reset}
    >
      <FilterModalForm
        fields={fields}
        values={draftValues}
        onChange={(key, value) => setDraftValues((current) => ({ ...current, [key]: value }))}
        idPrefix={id}
      />
    </Modal>
  );
}
