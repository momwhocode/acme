/** @vitest-environment jsdom */
import { render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { APP_CHROME_SCROLL, APP_CHROME_SHELL, setAppDocumentChrome, useAppDocumentChrome } from "./appDocumentChrome.js"

function Chrome({ mode }) {
  useAppDocumentChrome(mode)
  return null
}

describe("appDocumentChrome", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-app-chrome")
  })

  it("sets the document chrome attribute", () => {
    setAppDocumentChrome(APP_CHROME_SHELL)
    expect(document.documentElement.getAttribute("data-app-chrome")).toBe("shell")
    setAppDocumentChrome("other")
    expect(document.documentElement.getAttribute("data-app-chrome")).toBe(APP_CHROME_SCROLL)
  })

  it("applies chrome while mounted and restores scroll on unmount", () => {
    const view = render(<Chrome mode={APP_CHROME_SHELL} />)
    expect(document.documentElement.getAttribute("data-app-chrome")).toBe("shell")
    view.unmount()
    expect(document.documentElement.getAttribute("data-app-chrome")).toBe("scroll")
  })
})
