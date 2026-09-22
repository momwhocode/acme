import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { IconButton } from "../april/components/IconButton"

const MOBILE_NAV_QUERY = "(max-width: 768px)"

function useMobileNav() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined
    const media = window.matchMedia(MOBILE_NAV_QUERY)
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  return isMobile
}

export default function AppShell({ sidebar, children }) {
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)
  const isMobile = useMobileNav()
  const shellRef = useRef(null)
  const menuButtonRef = useRef(null)

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    const sidebarEl = shellRef.current?.querySelector(".april-sidebar")
    const hideDrawer = isMobile && !navOpen
    if (!sidebarEl) return
    if (hideDrawer) {
      sidebarEl.setAttribute("inert", "")
      sidebarEl.setAttribute("aria-hidden", "true")
    } else {
      sidebarEl.removeAttribute("inert")
      sidebarEl.removeAttribute("aria-hidden")
    }
  }, [isMobile, navOpen, sidebar])

  useEffect(() => {
    if (!navOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setNavOpen(false)
        menuButtonRef.current?.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [navOpen])

  const closeNav = () => {
    setNavOpen(false)
    menuButtonRef.current?.focus()
  }

  return (
    <div
      ref={shellRef}
      className={["superadmin-shell", "superadmin-shell--app", navOpen ? "superadmin-shell--nav-open" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="tenant-shell__mobile-bar">
        <span
          ref={(node) => {
            menuButtonRef.current = node?.querySelector("button") || null
          }}
        >
          <IconButton
            variant="ghost"
            size="md"
            icon="menu"
            ariaLabel="Open navigation"
            aria-expanded={navOpen}
            aria-controls="hr-sidebar"
            onClick={() => setNavOpen(true)}
          />
        </span>
      </div>

      {navOpen ? (
        <button
          type="button"
          className="tenant-shell__nav-backdrop"
          aria-label="Close navigation"
          onClick={closeNav}
        />
      ) : null}

      {navOpen ? (
        <IconButton
          className="tenant-shell__nav-close"
          variant="ghost"
          size="md"
          icon="close"
          ariaLabel="Close menu"
          onClick={closeNav}
        />
      ) : null}

      {sidebar}

      <main className="superadmin-shell__main">{children}</main>
    </div>
  )
}
