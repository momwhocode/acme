import { describe, expect, it } from "vitest"
import { placeToAddress, placeToAddressFields } from "./googleMaps.js"

describe("googleMaps", () => {
  it("reads a formatted place into address fields", () => {
    const place = {
      name: "Acme HQ",
      formatted_address: "1 King St, London",
      address_components: [
        { types: [ "locality" ], long_name: "London" }
      ]
    }

    expect(placeToAddress(place)).toBe("1 King St, London")
    expect(placeToAddressFields(place)).toMatchObject({
      address: "1 King St, London",
      city: "London",
      venueName: "Acme HQ",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=1%20King%20St%2C%20London"
    })
  })
})
