/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { EmployeeDatesFields, EmployeeDetailsFields, EmployeeJobFields } from "./EmployeeFormFields"

const form = {
  first_name: "Ada",
  last_name: "Lovelace",
  email: "ada@acme.test",
  country: "GB",
  job_title: "Engineer",
  level: "L2",
  department: "engineering",
  employment_type: "full-time",
  manager_email: "",
  started_on: "2024-01-01"
}

describe("EmployeeFormFields", () => {
  afterEach(() => {
    cleanup()
  })

  it("renders the shared details, job, and date fields", () => {
    render(
      <>
        <EmployeeDetailsFields idPrefix="form" form={form} errors={{}} onChange={vi.fn()} />
        <EmployeeJobFields idPrefix="form" form={form} errors={{}} onChange={vi.fn()} />
        <EmployeeDatesFields idPrefix="form" form={form} errors={{}} onChange={vi.fn()} />
      </>
    )

    expect(screen.getByText("First Name")).toBeTruthy()
    expect(screen.getByText("Country")).toBeTruthy()
    expect(screen.getByText("Job Title")).toBeTruthy()
    expect(screen.getByText("Level")).toBeTruthy()
    expect(screen.getByText("Department")).toBeTruthy()
    expect(screen.getByText("Type")).toBeTruthy()
    expect(screen.getByText("Manager")).toBeTruthy()
    expect(screen.getByText("Start Date")).toBeTruthy()
    expect(document.getElementById("form-first-name").value).toBe("Ada")
    expect(document.getElementById("form-job-title").value).toBe("Engineer")
    expect(document.getElementById("form-started-on")).toBeTruthy()
  })
})
