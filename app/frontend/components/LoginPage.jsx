/** HR session form. Validation stays client-side until the request is sent. */

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthBrand } from "../april/components/AuthBrand"
import { Button } from "../april/components/Button"
import { TextInput } from "../april/components/TextInput"
import { loginFormErrors, signIn } from "../lib/session"

export default function LoginPage({ onSignedIn, titleTag = "h1", showWordmark = true }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return

    const nextErrors = loginFormErrors({ email, password })
    setFieldErrors(nextErrors)
    setError("")
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      onSignedIn(await signIn({ email, password }))
      navigate("/", { replace: true })
    } catch (caught) {
      setError(caught.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="superadmin-auth-form" onSubmit={handleSubmit} noValidate>
      <AuthBrand
        title="Sign in"
        titleTag={titleTag}
        showWordmark={showWordmark}
        subtitle="Sign in as the HR manager."
      />

      <div className="superadmin-auth-form__fields">
        <TextInput
          id="hr-email"
          size="lg"
          fullWidth
          autoFocus
          label="Email address"
          showLabel
          required={false}
          leadingIcon={false}
          trailingIcon={false}
          type="email"
          name="email"
          autoComplete="username"
          inputMode="email"
          placeholder="E.g. name@example.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            if (error || fieldErrors.email) {
              setError("")
              setFieldErrors({})
            }
          }}
          state={fieldErrors.email || error ? "error" : "default"}
          showDescription={Boolean(fieldErrors.email || error)}
          description={fieldErrors.email || error}
        />
        <TextInput
          id="hr-password"
          size="lg"
          fullWidth
          label="Password"
          showLabel
          required={false}
          leadingIcon={false}
          trailingIcon={false}
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            if (fieldErrors.password) setFieldErrors({})
          }}
          state={fieldErrors.password ? "error" : "default"}
          showDescription={Boolean(fieldErrors.password)}
          description={fieldErrors.password}
        />
        <Button
          type="submit"
          label="Sign in"
          variant="primary"
          size="lg"
          fullWidth
          leadingIcon={false}
          trailingIcon={false}
          loading={submitting}
          disabled={submitting}
          loadingLabel="Signing in"
        />
      </div>
    </form>
  )
}
