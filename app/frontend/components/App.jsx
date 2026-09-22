import { useEffect, useState } from "react"

export default function App() {
  const [status, setStatus] = useState("loading")

  useEffect(() => {
    fetch("/api/v1/health")
      .then((response) => response.json())
      .then((payload) => setStatus(payload.status))
      .catch(() => setStatus("offline"))
  }, [])

  return (
    <main>
      <p>Acme</p>
      <h1>Rails API + React</h1>
      <p>Unified app. API is {status}.</p>
    </main>
  )
}
