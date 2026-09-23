/** Signed-in HR chrome — Home / Employees plus account sign-out. */

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Sidebar } from "../april/components/Sidebar"
import { hrSidebarMenu, resolveHrActiveNavItemId } from "../lib/hrNav"
import { userDisplayName, userInitials } from "../lib/profile"
import { signOut } from "../lib/session"
import AcmeLogo from "./AcmeLogo"

export default function AppSidebar({ user, onSignedOut }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [signingOut, setSigningOut] = useState(false)
  const menu = hrSidebarMenu()

  const handleLogout = async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      await signOut()
      onSignedOut()
      navigate("/sign_in", { replace: true })
    } catch {
      setSigningOut(false)
    }
  }

  return (
    <Sidebar
      id="hr-sidebar"
      ariaLabel="HR navigation"
      variant="main"
      headerContent={
        <Link to="/" className="april-sidebar__logo-link acme-sidebar__wordmark" aria-label="Acme">
          <AcmeLogo className="april-sidebar__logo-image acme-sidebar__logo" />
        </Link>
      }
      topItems={menu.topItems}
      groups={menu.groups}
      bottomItems={menu.bottomItems}
      activeItemId={resolveHrActiveNavItemId(location.pathname)}
      profileName={userDisplayName(user)}
      profileEmail={user?.email || ""}
      profileInitials={userInitials(user)}
      onLogoutClick={handleLogout}
      logoutLoading={signingOut}
    />
  )
}
