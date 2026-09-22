/** Label column + field column. Sibling rows get dividers from the parent section. */
export function FormFieldRow({ label, labelHint, labelAction, required = false, children, className = "" }) {
  return (
    <div className={["april-form-row", className].filter(Boolean).join(" ")}>
      <div className="april-form-row__label">
        <div className="april-form-row__label-heading">
          <p className="april-form-row__label-text april-text-style april-text-style--text-sm-medium">
            <span className="april-form-row__label-leading">
              <span>{label}</span>
              {required ? (
                <span className="april-form-row__label-required" aria-hidden="true">
                  *
                </span>
              ) : null}
            </span>
          </p>
          {labelAction ? <div className="april-form-row__label-action">{labelAction}</div> : null}
        </div>
        {labelHint ? (
          <p className="april-form-row__label-hint april-text-style april-text-style--text-xs-regular">
            {labelHint}
          </p>
        ) : null}
      </div>
      <div className="april-form-row__field">{children}</div>
    </div>
  );
}
