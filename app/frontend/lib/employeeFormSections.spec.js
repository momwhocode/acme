import { describe, expect, it } from "vitest"
import { EMPLOYEE_FIELD_LABELS, EMPLOYEE_FORM_SECTIONS } from "./employeeFormSections.js"

describe("employee form copy", () => {
  it("shares section titles across onboard, edit, and profile", () => {
    expect(EMPLOYEE_FORM_SECTIONS).toEqual({
      details: "Employee Details",
      job: "Job Details",
      compensation: "Compensation Details",
      dates: "Employment Dates"
    })
  })

  it("shares field labels with the directory columns", () => {
    expect(EMPLOYEE_FIELD_LABELS.annualSalary).toBe("Annual Salary")
    expect(EMPLOYEE_FIELD_LABELS.jobTitle).toBe("Job Title")
    expect(EMPLOYEE_FIELD_LABELS.endDate).toBe("End Date")
    expect(EMPLOYEE_FIELD_LABELS.payType).toBe("Pay Type")
  })
})
