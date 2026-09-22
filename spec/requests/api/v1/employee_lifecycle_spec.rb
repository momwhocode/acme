require "rails_helper"

RSpec.describe "Employee lifecycle API" do
  def onboard_payload(**overrides)
    {
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@acme.test",
      country: "GB",
      department: "engineering",
      employment_type: "full-time",
      started_on: "2024-01-01",
      compensation: {
        base_amount: 80_000,
        currency: "GBP",
        pay_period: "annual",
        effective_date: "2024-01-01",
        change_reason: "hire"
      }
    }.deep_merge(overrides)
  end

  describe "POST /api/v1/employees" do
    it "requires login" do
      post "/api/v1/employees", params: onboard_payload, as: :json

      expect(response).to have_http_status(:unauthorized)
    end

    it "onboards an employee with starting pay" do
      sign_in_hr
      post "/api/v1/employees", params: onboard_payload, as: :json

      expect(response).to have_http_status(:created)
      expect(api_data).to include(
        "employee" => include("email" => "ada@acme.test", "status" => "active"),
        "compensation_record" => include("change_reason" => "hire", "currency" => "GBP")
      )
    end

    it "rejects a hire without compensation" do
      sign_in_hr
      post "/api/v1/employees", params: onboard_payload.except(:compensation), as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(api_error).to include("code" => "invalid_request", "message" => "compensation is required")
    end

    it "rejects a duplicate email" do
      sign_in_hr
      create(:employee, email: "ada@acme.test")
      post "/api/v1/employees", params: onboard_payload, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(api_error).to include(
        "code" => "validation_failed",
        "message" => "validation failed",
        "details" => include("email" => [ "has already been taken" ])
      )
    end

    it "rejects a hire with no first name" do
      sign_in_hr
      post "/api/v1/employees", params: onboard_payload.merge(first_name: ""), as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(api_error.fetch("details")).to include("first_name")
    end

    it "rejects hourly starting pay without hours" do
      sign_in_hr
      post "/api/v1/employees",
           params: onboard_payload(compensation: { pay_period: "hourly", hours_per_week: nil }),
           as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(api_error.fetch("details")).to include("hours_per_week")
    end
  end

  describe "POST /api/v1/employees/:id/compensation_records" do
    it "requires login" do
      employee = create(:employee)
      post "/api/v1/employees/#{employee.id}/compensation_records",
           params: { base_amount: 90_000 }, as: :json

      expect(response).to have_http_status(:unauthorized)
    end

    it "records a raise or promotion" do
      sign_in_hr
      employee = create(:employee, level: "IC2")
      create(:compensation_record, employee: employee)

      post "/api/v1/employees/#{employee.id}/compensation_records", params: {
        base_amount: 90_000, currency: "GBP", pay_period: "annual",
        effective_date: "2025-04-01", change_reason: "promotion", level: "IC3"
      }, as: :json

      expect(response).to have_http_status(:created)
      expect(api_data).to include(
        "compensation_record" => include("change_reason" => "promotion"),
        "employee" => include("id" => employee.id, "level" => "IC3")
      )
    end

    it "returns not found for an unknown employee" do
      sign_in_hr
      post "/api/v1/employees/#{SecureRandom.uuid}/compensation_records",
           params: { base_amount: 1, currency: "USD", pay_period: "annual", effective_date: "2025-01-01" },
           as: :json

      expect(response).to have_http_status(:not_found)
    end

    it "rejects a pay change after the employee left" do
      sign_in_hr
      employee = create(:employee, :left)
      post "/api/v1/employees/#{employee.id}/compensation_records", params: {
        base_amount: 90_000, currency: "USD", pay_period: "annual", effective_date: "2025-04-01"
      }, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(api_error).to include("code" => "invalid_request", "message" => "cannot change pay for a leaver")
    end

    it "rejects a second record on the same date" do
      sign_in_hr
      employee = create(:employee)
      create(:compensation_record, employee: employee, effective_date: Date.new(2025, 4, 1))

      post "/api/v1/employees/#{employee.id}/compensation_records", params: {
        base_amount: 90_000, currency: "GBP", pay_period: "annual", effective_date: "2025-04-01"
      }, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(api_error.fetch("details")).to include("effective_date")
    end

    it "rejects an unsupported currency" do
      sign_in_hr
      employee = create(:employee)
      create(:compensation_record, employee: employee)

      post "/api/v1/employees/#{employee.id}/compensation_records", params: {
        base_amount: 90_000, currency: "JPY", pay_period: "annual", effective_date: "2025-04-01"
      }, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(api_error.fetch("details")).to include("currency")
    end
  end

  describe "PATCH /api/v1/employees/:id/offboard" do
    it "requires login" do
      patch "/api/v1/employees/#{create(:employee).id}/offboard",
            params: { left_on: "2025-06-01" }, as: :json

      expect(response).to have_http_status(:unauthorized)
    end

    it "marks a leaver" do
      sign_in_hr
      employee = create(:employee)
      create(:compensation_record, employee: employee)

      patch "/api/v1/employees/#{employee.id}/offboard",
            params: { left_on: "2025-06-01" }, as: :json

      expect(response).to have_http_status(:ok)
      expect(api_data.fetch("employee")).to include(
        "id" => employee.id, "status" => "left", "left_on" => "2025-06-01"
      )
    end

    it "rejects an employee who already left" do
      sign_in_hr
      employee = create(:employee, :left)
      patch "/api/v1/employees/#{employee.id}/offboard",
            params: { left_on: "2025-07-01" }, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(api_error).to include("message" => "already left")
    end

    it "returns not found for an unknown employee" do
      sign_in_hr
      patch "/api/v1/employees/#{SecureRandom.uuid}/offboard",
            params: { left_on: "2025-06-01" }, as: :json

      expect(response).to have_http_status(:not_found)
    end

    it "rejects a blank leave date" do
      sign_in_hr
      patch "/api/v1/employees/#{create(:employee).id}/offboard", params: { left_on: "" }, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(api_error).to include("message" => "left_on is required")
    end

    it "rejects a non-ISO leave date" do
      sign_in_hr
      patch "/api/v1/employees/#{create(:employee).id}/offboard",
            params: { left_on: "June 1" }, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(api_error).to include("message" => "left_on is invalid")
    end

    it "rejects a leave date before the latest compensation" do
      sign_in_hr
      employee = create(:employee)
      create(:compensation_record, employee: employee, effective_date: Date.new(2025, 4, 1))

      patch "/api/v1/employees/#{employee.id}/offboard",
            params: { left_on: "2025-03-01" }, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(api_error.fetch("details")).to include("left_on")
    end
  end
end
