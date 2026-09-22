/**
 * Centered auth header — wordmark, optional title, optional subtitle.
 * Same structure as SchoolOS AuthBrand (Figma superadmin sign-in).
 */
export function AuthBrand({ title, subtitle, titleId, wordmark = "Acme" }) {
  return (
    <div className="superadmin-auth-brand">
      <p className="superadmin-auth-brand__wordmark april-text-style april-text-style--display-xs-semibold">
        {wordmark}
      </p>
      {title ? (
        <h1
          id={titleId}
          className="superadmin-auth-brand__title april-text-style april-text-style--display-xs-semibold"
        >
          {title}
        </h1>
      ) : null}
      {subtitle ? (
        <p className="superadmin-auth-brand__subtitle april-text-style april-text-style--text-md-regular">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
