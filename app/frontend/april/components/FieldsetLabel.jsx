/** Fieldset label — Figma form fieldset header */
export function FieldsetLabel({
  label = "Fieldset Label",
  requiredText = "*",
  showRequired = true,
  description = "Help description.",
  showDescription = true,
  id = "fieldset-label",
  className = "",
}) {
  return (
    <div className={["april-fieldset-label", className].filter(Boolean).join(" ")} id={id}>
      <div className="april-fieldset-label__leading">
        <span className="april-fieldset-label__title">{label}</span>
        {showRequired ? <span className="april-fieldset-label__required">{requiredText}</span> : null}
      </div>
      {showDescription ? <p className="april-fieldset-label__description">{description}</p> : null}
    </div>
  );
}
