import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../april/components/Button"
import { Tag } from "../april/components/Tag"

function statusTag(status) {
  if (status === "ok") return { type: "success", label: "API ok" }
  if (status === "loading") return { type: "info", label: "Checking API" }
  return { type: "error", label: "API offline" }
}

export default function HomePage({ user }) {
  const navigate = useNavigate()
  const [status, setStatus] = useState("loading")
  const tag = statusTag(status)

  useEffect(() => {
    fetch("/api/v1/health")
      .then((response) => {
        if (!response.ok) throw new Error("health failed")
        return response.json()
      })
      .then((payload) => setStatus(payload.status))
      .catch(() => setStatus("offline"))
  }, [])

  return (
    <main className="acme-home">
      <div className="acme-home__bar">
        <Tag type="primary" label="Acme" leadingIcon={false} trailingIcon={false} />
        <p className="april-text-style april-text-style--text-sm-regular">
          Signed in as {user.first_name} {user.last_name}
        </p>
        <Button
          label="Sign out"
          variant="outlined"
          size="sm"
          leadingIcon={false}
          trailingIcon={false}
          onClick={() => navigate("/sign_out")}
        />
      </div>
      <h1 className="april-text-style april-text-style--display-sm-semibold">Salary Management</h1>
      <p className="april-text-style april-text-style--text-md-regular">
        Compensation source of truth for ACME.
      </p>
      <div className="acme-home__status">
        <Tag type={tag.type} label={tag.label} leadingIcon={false} trailingIcon={false} />
      </div>
      <div className="acme-home__actions">
        <Button
          label="Open Storybook"
          variant="primary"
          size="md"
          leadingIcon={false}
          trailingIcon={false}
          onClick={() => window.open("http://localhost:6006", "_blank", "noopener,noreferrer")}
        />
        <Button
          label="API health"
          variant="outlined"
          size="md"
          leadingIcon={false}
          trailingIcon={false}
          onClick={() => window.open("/api/v1/health", "_blank", "noopener,noreferrer")}
        />
      </div>
    </main>
  )
}
