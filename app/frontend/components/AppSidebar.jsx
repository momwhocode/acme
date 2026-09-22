import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Sidebar } from "../april/components/Sidebar"
import { hrSidebarMenu, resolveHrActiveNavItemId } from "../lib/hrNav"
import { userDisplayName, userInitials } from "../lib/profile"
import { signOut } from "../lib/session"

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
    } catch {
      // Leave the shell even if the API is unreachable, same as SchoolOS.
    }
    onSignedOut()
    navigate("/sign_in", { replace: true })
  }

  return (
    <Sidebar
      id="hr-sidebar"
      ariaLabel="HR navigation"
      variant="main"
      headerContent={
        <Link to="/" className="april-sidebar__logo-link acme-sidebar__wordmark">
          <span className="april-text-style april-text-style--display-xs-semibold">Acme</span>
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
