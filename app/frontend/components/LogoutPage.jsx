/** Explicit sign-out confirmation. Stay signed in returns to Home. */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthBrand } from "../april/components/AuthBrand"
import { Button } from "../april/components/Button"
import { signOut } from "../lib/session"

export default function LogoutPage({ onSignedOut }) {
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return

    setError("")
    setSubmitting(true)
    try {
      await signOut()
      onSignedOut()
      navigate("/sign_in", { replace: true })
    } catch (caught) {
      setError(caught.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="superadmin-auth-form" onSubmit={handleSubmit} noValidate>
      <AuthBrand title="Sign out" subtitle="End your HR session on this device." />

      <div className="superadmin-auth-form__fields">
        {error ? (
          <p className="superadmin-auth-form__lead april-text-style april-text-style--text-sm-regular">{error}</p>
        ) : null}
        <Button
          type="submit"
          label="Sign out"
          variant="primary"
          size="lg"
          fullWidth
          leadingIcon={false}
          trailingIcon={false}
          loading={submitting}
          disabled={submitting}
          loadingLabel="Signing out"
        />
        <Button
          type="button"
          label="Stay signed in"
          variant="outlined"
          size="lg"
          fullWidth
          leadingIcon={false}
          trailingIcon={false}
          disabled={submitting}
          onClick={() => navigate("/")}
        />
      </div>
    </form>
  )
}
