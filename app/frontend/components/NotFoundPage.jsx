import { useNavigate } from "react-router-dom"
import { PageTitleNavHeader } from "../april/components/PageTitleNavHeader"
import StatusPage from "./StatusPage"

export default function NotFoundPage({ signedIn = false }) {
  const navigate = useNavigate()
  const status = (
    <StatusPage
      variant="not_found"
      inset={signedIn}
      showPrimary
      primaryLabel={signedIn ? "Employees" : "Sign in"}
      secondaryLabel="Back to home"
      onPrimary={() => navigate(signedIn ? "/employees" : "/sign_in")}
      onSecondary={() => navigate("/")}
    />
  )

  if (!signedIn) return status

  return (
    <section className="superadmin-page">
      <PageTitleNavHeader id="not-found-title" pageTitle="Page not found" />
      {status}
    </section>
  )
}
