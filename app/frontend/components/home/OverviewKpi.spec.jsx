/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { OverviewKpi } from "./OverviewKpi"

describe("OverviewKpi", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders a metric with a signed delta tag", () => {
    render(
      <OverviewKpi
        icon="group"
        label="Headcount"
        value="128"
        delta="+4"
      />
    )

    expect(screen.getByText("Headcount")).toBeTruthy()
    expect(screen.getByText("128")).toBeTruthy()
    expect(screen.getByText("+4")).toBeTruthy()
    expect(screen.queryByRole("button", { name: /Headcount/ })).toBeNull()
  })
})
