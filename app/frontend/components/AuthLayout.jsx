import { Outlet } from "react-router-dom"
import { APP_CHROME_SCROLL, useAppDocumentChrome } from "../lib/appDocumentChrome"

export default function AuthLayout({ children }) {
  useAppDocumentChrome(APP_CHROME_SCROLL)
  const year = new Date().getFullYear()

  return (
    <div className="superadmin-auth">
      <main className="superadmin-auth__body">{children || <Outlet />}</main>
      <footer className="superadmin-auth__footer">
        <p className="superadmin-auth__copyright april-text-style april-text-style--text-sm-regular">
          © {year} ACME. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
