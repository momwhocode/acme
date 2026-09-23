import { afterEach, describe, expect, it } from "vitest"
import { getApiBaseUrl } from "./api.js"

describe("getApiBaseUrl", () => {
  afterEach(() => {
    delete window.ACME_CONFIG
  })

  it("uses same-origin when credentials api.url is unset", () => {
    expect(getApiBaseUrl()).toBe("")
  })

  it("strips a trailing slash from the credentials API URL", () => {
    window.ACME_CONFIG = { apiUrl: "https://api.example.com/" }

    expect(getApiBaseUrl()).toBe("https://api.example.com")
  })
})
