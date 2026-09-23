import { afterEach, describe, expect, it, vi } from "vitest"
import { apiErrorMessage, apiData, apiFetch, apiMeta, csrfToken, setCsrfToken } from "./http.js"

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

  it("omits the JSON content type for FormData", async () => {
    stubDocument("csrf-token")
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    await apiFetch("/api/v1/employees/import", { method: "POST", body: new FormData() })

    expect(fetchMock.mock.calls[0][1].headers["Content-Type"]).toBeUndefined()
    expect(fetchMock.mock.calls[0][1].headers["X-CSRF-Token"]).toBe("csrf-token")
  })

  it("omits the JSON content type on a GET", async () => {
    stubDocument("csrf-token")
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }))
    vi.stubGlobal("fetch", fetchMock)

    await apiFetch("/api/v1/employees")

    expect(fetchMock.mock.calls[0][1].headers["Content-Type"]).toBeUndefined()
  })
})

describe("api envelope", () => {
  it("reads data and meta", () => {
    const payload = { data: { user: { email: "hr@acme.test" } }, meta: { csrf_token: "t" } }

    expect(apiData(payload)).toEqual({ user: { email: "hr@acme.test" } })
    expect(apiMeta(payload)).toEqual({ csrf_token: "t" })
  })

  it("reads a structured error message", () => {
    expect(apiErrorMessage({ error: { code: "invalid_request", message: "already left" } })).toBe("already left")
  })

  it("reads an internal error message", () => {
    expect(apiErrorMessage({ error: { code: "internal_error", message: "internal error" } })).toBe("internal error")
  })

  it("falls back when the message is missing", () => {
    expect(apiErrorMessage({ error: { code: "internal_error" } }, "unavailable")).toBe("unavailable")
  })

  it("uses the fallback for an empty payload", () => {
    expect(apiErrorMessage({}, "unavailable")).toBe("unavailable")
  })
})
