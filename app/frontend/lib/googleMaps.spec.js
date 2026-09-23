import { describe, expect, it } from "vitest"
import { loadGoogleMapsPlaces, placeToAddress } from "./googleMaps.js"

describe("googleMaps", () => {
  it("reads a formatted place into an address string", () => {
    expect(placeToAddress({
      name: "Acme HQ",
      formatted_address: "1 King St, London"
    })).toBe("1 King St, London")
    expect(placeToAddress({ name: "Acme HQ" })).toBe("Acme HQ")
    expect(placeToAddress({})).toBe("")
  })

  it("rejects Places when credentials did not inject a Maps key", async () => {
    delete window.ACME_CONFIG

    await expect(loadGoogleMapsPlaces()).rejects.toThrow("Google Maps is unavailable")
  })
})
