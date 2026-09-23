import { afterEach, describe, expect, it } from "vitest"
import { runtimeConfig } from "./runtime.js"

describe("runtimeConfig", () => {
  afterEach(() => {
    delete window.ACME_CONFIG
  })

  it("returns an empty object when credentials were not injected", () => {
    expect(runtimeConfig()).toEqual({})
  })

  it("reads the injected credentials payload", () => {
    window.ACME_CONFIG = { apiUrl: "https://api.example.com", mapsBrowserKey: "maps-key" }

    expect(runtimeConfig()).toEqual({
      apiUrl: "https://api.example.com",
      mapsBrowserKey: "maps-key"
    })
  })
})
