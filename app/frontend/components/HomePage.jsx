import { useEffect, useState } from "react"
import { Tag } from "../april/components/Tag"
import { apiData } from "../lib/http"

function statusTag(status) {
  if (status === "ok") return { type: "success", label: "API ok" }
  if (status === "loading") return { type: "info", label: "Checking API" }
  return { type: "error", label: "API offline" }
}

export default function HomePage({ user }) {
  const [status, setStatus] = useState("loading")
  const tag = statusTag(status)

  useEffect(() => {
    fetch("/api/v1/health")
      .then((response) => {
        if (!response.ok) throw new Error("health failed")
        return response.json()
      })
      .then((payload) => setStatus(apiData(payload)?.status || payload.status))
      .catch(() => setStatus("offline"))
  }, [])

  return (
    <section className="acme-page">
      <h1 className="april-text-style april-text-style--display-sm-semibold">Home</h1>
      <p className="april-text-style april-text-style--text-md-regular">
        Signed in as {user.first_name} {user.last_name}. Compensation source of truth for ACME.
      </p>
      <div className="acme-home__status">
        <Tag type={tag.type} label={tag.label} leadingIcon={false} trailingIcon={false} />
      </div>
    </section>
  )
}
