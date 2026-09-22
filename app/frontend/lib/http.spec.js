import { afterEach, describe, expect, it, vi } from "vitest"
import { apiFetch, csrfToken, setCsrfToken } from "./http.js"

function stubDocument(token = "abc") {
  const meta = {
    content: token,
    getAttribute: (name) => (name === "content" ? meta.content : null),
    setAttribute: (name, value) => {
      if (name === "content") meta.content = value
    }
  }
  vi.stubGlobal("document", {
    querySelector: (selector) => (selector === 'meta[name="csrf-token"]' ? meta : null)
  })
  return meta
}

describe("csrfToken", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("reads the csrf meta tag" , () => {
    stubDocument("token-1")

    expect(csrfToken()).toBe("token-1")
  })

  it("returns blank when document is missing", () => {
    expect(csrfToken()).toBe("")
  })
})

describe("setCsrfToken", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("updates the csrf meta tag", () => {
    const meta = stubDocument("old")
    setCsrfToken("new")

    expect(meta.content).toBe("new")
  })
})

describe("apiFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it("sends the csrf token and same-origin credentials", async () => {
    stubDocument("csrf-token")
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    await apiFetch("/api/v1/session", { method: "POST", body: JSON.stringify({ email: "hr@acme.test" }) })

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/session",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
        headers: expect.objectContaining({
          "X-CSRF-Token": "csrf-token",
          "Content-Type": "application/json"
        })
      })
    )
  })

  it("omits the JSON content type on a GET", async () => {
    stubDocument("csrf-token")
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    await apiFetch("/api/v1/employees")

    expect(fetchMock.mock.calls[0][1].headers["Content-Type"]).toBeUndefined()
  })
})
