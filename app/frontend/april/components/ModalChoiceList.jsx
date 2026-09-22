import { Tag } from "./Tag.jsx";

function optionInputId(name, value) {
  return `${name}-${value}`.replace(/\s+/g, "-").toLowerCase();
}

/** Radio choice cards for content modals. */
export function ModalChoiceList({ name, value, onChange, options = [], ariaLabel = "Choice" }) {
  return (
    <div className="april-modal__choice-list" role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => {
        const selected = value === option.value;
        const inputId = optionInputId(name, option.value);

        return (
          <label
            key={option.value}
            className={["april-modal__choice-card", selected ? "april-modal__choice-card--selected" : ""]
              .filter(Boolean)
              .join(" ")}
            htmlFor={inputId}
          >
            <input
              className="april-modal__choice-input"
              type="radio"
              id={inputId}
              name={name}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
            />
            <span className="april-modal__choice-card-leading" aria-hidden="true">
              <span className="april-modal__choice-radio" data-selected={selected} />
            </span>
            <Tag type={option.tagType} label={option.label} leadingIcon={false} trailingIcon={false} />
          </label>
        );
      })}
    </div>
  );
}
