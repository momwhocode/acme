import { Outlet } from "react-router-dom"

export default function AuthLayout({ children }) {
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
