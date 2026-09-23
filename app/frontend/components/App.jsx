/** HR SPA routes: session gate, Home, Employees, and profile modal. */

import { useEffect, useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AuthBrand } from "../april/components/AuthBrand"
import { SESSION_EXPIRED_EVENT } from "../lib/http"
import { readSession } from "../lib/session"
import AppLayout from "./AppLayout"
import AuthLayout from "./AuthLayout"
import EmployeeProfilePage from "./EmployeeProfilePage"
import EmployeesPage from "./EmployeesPage"
import HomePage from "./HomePage"
import LandingPage from "./LandingPage"
import LogoutPage from "./LogoutPage"
import NotFoundPage from "./NotFoundPage"

function AppRoutes() {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const applySession = (sessionUser) => {
      if (!cancelled) setUser(sessionUser)
    }

    const syncSession = ({ reveal } = {}) =>
      readSession()
        .then(applySession)
        .catch(() => applySession(null))
        .finally(() => {
          if (reveal && !cancelled) setReady(true)
        })

    syncSession({ reveal: true })

    const onVisible = () => {
      if (document.visibilityState === "visible") syncSession()
    }
    const onExpired = () => applySession(null)

    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => {
      cancelled = true
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
    }
  }, [])

  if (!ready) {
    return (
      <AuthLayout>
        <AuthBrand title="Loading…" subtitle="Checking your session." />
      </AuthLayout>
    )
  }

  const clearUser = () => setUser(null)
  const landing = <LandingPage onSignedIn={setUser} />

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route
          path="/sign_out"
          element={user ? <LogoutPage onSignedOut={clearUser} /> : <Navigate to="/" replace />}
        />
      </Route>
      {!user ? (
        <>
          <Route path="/" element={landing} />
          <Route path="/sign_in" element={landing} />
        </>
      ) : (
        <Route path="/sign_in" element={<Navigate to="/" replace />} />
      )}
      <Route
        element={user ? <AppLayout user={user} onSignedOut={clearUser} /> : <Navigate to="/sign_in" replace />}
      >
        {user ? <Route path="/" element={<HomePage user={user} />} /> : null}
        <Route path="/employees" element={<EmployeesPage />}>
          <Route path=":id" element={<EmployeeProfilePage />} />
        </Route>
      </Route>
      <Route
        path="*"
        element={
          user ? (
            <AppLayout user={user} onSignedOut={clearUser}>
              <NotFoundPage signedIn />
            </AppLayout>
          ) : (
            <AuthLayout>
              <NotFoundPage />
            </AuthLayout>
          )
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
