import { useEffect, useState } from "react"
import { Button } from "../april/components/Button"
import { Tag } from "../april/components/Tag"

function statusTag(status) {
  if (status === "ok") return { type: "success", label: "API ok" }
  if (status === "loading") return { type: "info", label: "Checking API" }
  return { type: "error", label: "API offline" }
}

export default function App() {
  const [status, setStatus] = useState("loading")

  useEffect(() => {
    fetch("/api/v1/health")
      .then((response) => {
        if (!response.ok) throw new Error("health failed")
        return response.json()
      })
      .then((payload) => setStatus(payload.status))
      .catch(() => setStatus("offline"))
  }, [])

  const tag = statusTag(status)

  return (
    <main className="acme-home">
      <Tag type="primary" label="Acme" leadingIcon={false} trailingIcon={false} />
      <h1 className="april-text-style april-text-style--display-sm-semibold">Rails API + React</h1>
      <p className="april-text-style april-text-style--text-md-regular">
        Unified app using the April System.
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
