require "rails_helper"

RSpec.describe AnalyticsAsker do
  before { ExchangeRate.seed!(on: Date.new(2024, 1, 1)) }

  it "answers total payroll from the SQL snapshot" do
    create(:compensation_record, employee: create(:employee), base_amount: 80_000, currency: "GBP")

    expect(described_class.call(question: "What is the total annualised payroll?", as_of: Date.new(2026, 1, 1)))
      .to include(answer: "Active annualised payroll is 100,000 USD.")
  end

  it "answers this month including people who left in the month" do
    create(:compensation_record, employee: create(:employee, email: "a@acme.test"), base_amount: 120_000)
    create(:compensation_record,
           employee: create(:employee, :left, email: "b@acme.test", left_on: Date.new(2026, 1, 10)),
           base_amount: 60_000)

    expect(described_class.call(
      question: "what is the total payout this month allowing for employees who have left",
      as_of: Date.new(2026, 1, 20)
    )).to include(answer: a_string_including("15,000 USD"))
  end

  it "answers department mix with payroll" do
    create(:compensation_record,
           employee: create(:employee, email: "eng@acme.test", department: "engineering"),
           base_amount: 80_000, currency: "USD")

    expect(described_class.call(question: "headcount by department", as_of: Date.new(2026, 1, 1)))
      .to include(answer: "Active headcount by department: engineering 1 (80,000 USD).")
  end

  it "rejects a blank or oversized question" do
    expect { described_class.call(question: " ") }.to raise_error(described_class::Error, "question is required")
    expect { described_class.call(question: "a" * 256) }.to raise_error(described_class::Error, "question is too long")
  end
end
