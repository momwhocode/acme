import { useEffect, useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { readSession } from "../lib/session"
import AuthLayout from "./AuthLayout"
import HomePage from "./HomePage"
import LoginPage from "./LoginPage"
import LogoutPage from "./LogoutPage"

function AppRoutes() {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    readSession()
      .then((sessionUser) => setUser(sessionUser))
      .catch(() => setUser(null))
      .finally(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <AuthLayout>
        <p className="superadmin-auth-form__lead april-text-style april-text-style--text-md-regular">Loading…</p>
      </AuthLayout>
    )
  }

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route
          path="/sign_in"
          element={user ? <Navigate to="/" replace /> : <LoginPage onSignedIn={setUser} />}
        />
        <Route
          path="/sign_out"
          element={user ? <LogoutPage onSignedOut={() => setUser(null)} /> : <Navigate to="/sign_in" replace />}
        />
      </Route>
      <Route path="/" element={user ? <HomePage user={user} /> : <Navigate to="/sign_in" replace />} />
      <Route path="*" element={<Navigate to={user ? "/" : "/sign_in"} replace />} />
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
