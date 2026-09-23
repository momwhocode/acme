import { useEffect, useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AuthBrand } from "../april/components/AuthBrand"
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
    readSession()
      .then((sessionUser) => setUser(sessionUser))
      .catch(() => setUser(null))
      .finally(() => setReady(true))
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
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/employees/:id" element={<EmployeeProfilePage />} />
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
