/** Centered form page body. */
export function FormPageCard({ id = "form-page", className = "", onSubmit, children, noValidate = true }) {
  return (
    <div className="april-form-page">
      <form
        id={id}
        className={["april-form-page__form", className].filter(Boolean).join(" ")}
        onSubmit={onSubmit}
        noValidate={noValidate}
      >
        <div className="april-form-page__fields">{children}</div>
      </form>
    </div>
  );
}
