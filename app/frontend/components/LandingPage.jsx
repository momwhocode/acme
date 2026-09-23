import { APP_CHROME_SCROLL, useAppDocumentChrome } from "../lib/appDocumentChrome"
import LoginPage from "./LoginPage"

export default function LandingPage({ onSignedIn }) {
  useAppDocumentChrome(APP_CHROME_SCROLL)
  const year = new Date().getFullYear()

  return (
    <div className="acme-split-landing">
      <section className="acme-split-landing__brand" aria-label="Acme">
        <p className="acme-split-landing__wordmark april-text-style april-text-style--display-xs-semibold">
          Acme
        </p>
        <h1 className="acme-split-landing__title april-text-style april-text-style--display-md-semibold">
          Salary management
        </h1>
        <p className="acme-split-landing__lead april-text-style april-text-style--text-md-regular">
          Who is paid, how much, and how that has changed — without the spreadsheet.
        </p>
      </section>
      <section className="acme-split-landing__panel">
        <div className="acme-split-landing__form">
          <LoginPage onSignedIn={onSignedIn} titleTag="h2" showWordmark={false} />
        </div>
        <p className="acme-split-landing__copyright april-text-style april-text-style--text-sm-regular">
          © {year} ACME. All rights reserved.
        </p>
      </section>
    </div>
  )
}
