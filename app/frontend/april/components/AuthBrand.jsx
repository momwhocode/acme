/**
 * Centered auth header — wordmark, optional title, optional subtitle.
 * Same structure as SchoolOS AuthBrand (Figma superadmin sign-in).
 */
export function AuthBrand({ title, subtitle, titleId, titleTag = "h1", wordmark = "Acme", showWordmark = true }) {
  const TitleTag = titleTag === "h2" ? "h2" : "h1"
  return (
    <div className="superadmin-auth-brand">
      {showWordmark ? (
        <p className="superadmin-auth-brand__wordmark april-text-style april-text-style--display-xs-semibold">
          {wordmark}
        </p>
      ) : null}
      {title ? (
        <TitleTag
          id={titleId}
          className="superadmin-auth-brand__title april-text-style april-text-style--display-xs-semibold"
        >
          {title}
        </TitleTag>
      ) : null}
      {subtitle ? (
        <p className="superadmin-auth-brand__subtitle april-text-style april-text-style--text-md-regular">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
