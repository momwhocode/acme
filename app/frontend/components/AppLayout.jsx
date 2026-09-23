import { Outlet } from "react-router-dom"
import { APP_CHROME_SHELL, useAppDocumentChrome } from "../lib/appDocumentChrome"
import AppShell from "./AppShell"
import AppSidebar from "./AppSidebar"

export default function AppLayout({ user, onSignedOut, children }) {
  useAppDocumentChrome(APP_CHROME_SHELL)

  return (
    <AppShell sidebar={<AppSidebar user={user} onSignedOut={onSignedOut} />}>
      {children ?? <Outlet />}
    </AppShell>
  )
}
