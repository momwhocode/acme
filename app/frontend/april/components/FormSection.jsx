/** Form section title + description. */
export function FormSection({
  title,
  description,
  children,
  className = "",
  variant = "flat",
  hideHeader = false,
}) {
  return (
    <section
      className={[
        "april-form-section",
        `april-form-section--${variant}`,
        hideHeader ? "april-form-section--no-header" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {!hideHeader ? (
        <header className="april-form-section__header">
          <div className="april-form-section__title-row">
            <h2 className="april-form-section__title april-text-style april-text-style--text-md-semibold">
              {title}
            </h2>
          </div>
          {description ? (
            <p className="april-form-section__description april-text-style april-text-style--text-xs-regular">
              {description}
            </p>
          ) : null}
        </header>
      ) : null}
      <div className="april-form-section__body">{children}</div>
    </section>
  );
}
