/** Unknown route — Home when signed in, sign-in when signed out. */

import { useNavigate } from "react-router-dom"
import { PageTitleNavHeader } from "../april/components/PageTitleNavHeader"
import { t } from "../lib/messages"
import StatusPage from "./StatusPage"

export default function NotFoundPage({ signedIn = false }) {
  const navigate = useNavigate()
  const status = (
    <StatusPage
      inset={signedIn}
      showPrimary
      primaryLabel={signedIn ? "Employee Directory" : "Sign in"}
      secondaryLabel={t("labels.backToHome")}
      onPrimary={() => navigate(signedIn ? "/employees" : "/sign_in")}
      onSecondary={() => navigate("/")}
    />
  )

  if (!signedIn) return status

  return (
    <section className="superadmin-page">
      <PageTitleNavHeader id="not-found-title" pageTitle={t("errors.pageNotFound")} />
      {status}
    </section>
  )
}
