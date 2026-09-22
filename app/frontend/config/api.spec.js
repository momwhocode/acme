import { afterEach, describe, expect, it, vi } from "vitest"
import { getApiBaseUrl } from "./api.js"

describe("getApiBaseUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("uses same-origin when VITE_API_URL is unset", () => {
    expect(getApiBaseUrl()).toBe("")
  })

  it("strips a trailing slash from VITE_API_URL", () => {
    vi.stubEnv("VITE_API_URL", "https://api.example.com/")

    expect(getApiBaseUrl()).toBe("https://api.example.com")
  })
})
