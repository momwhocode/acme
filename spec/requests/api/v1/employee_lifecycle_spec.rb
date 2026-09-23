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
      expect(AuditEvent.where(action: "onboard", record_type: "Employee")).to exist
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

  describe "PATCH /api/v1/employees/:id" do
    it "requires login" do
      patch "/api/v1/employees/#{create(:employee).id}", params: { first_name: "Grace" }, as: :json

      expect(response).to have_http_status(:unauthorized)
    end

    it "updates employee identity and returns the profile" do
      sign_in_hr
      employee = create(:employee, first_name: "Ada", department: "engineering")
      create(:compensation_record, employee: employee, change_reason: "hire")

      patch "/api/v1/employees/#{employee.id}",
            params: { first_name: "Grace", department: "sales", email: "grace@acme.test" },
            as: :json

      expect(response).to have_http_status(:ok)
      expect(api_data).to include(
        "employee" => include(
          "id" => employee.id,
          "first_name" => "Grace",
          "department" => "sales",
          "email" => "grace@acme.test"
        ),
        "compensation_records" => [ include("change_reason" => "hire") ]
      )
    end

    it "does not change status or leave date" do
      sign_in_hr
      employee = create(:employee, :left)

      patch "/api/v1/employees/#{employee.id}",
            params: { first_name: "Grace", status: "active", left_on: nil },
            as: :json

      expect(response).to have_http_status(:ok)
      expect(api_data.fetch("employee")).to include("first_name" => "Grace", "status" => "left")
    end

    it "returns not found for an unknown employee" do
      sign_in_hr
      patch "/api/v1/employees/#{SecureRandom.uuid}", params: { first_name: "Grace" }, as: :json

      expect(response).to have_http_status(:not_found)
    end

    it "rejects an empty update" do
      sign_in_hr
      patch "/api/v1/employees/#{create(:employee).id}", params: {}, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(api_error).to include("code" => "invalid_request", "message" => "no employee fields to update")
    end

    it "rejects a duplicate email" do
      sign_in_hr
      create(:employee, email: "taken@acme.test")
      employee = create(:employee, email: "ada@acme.test")

      patch "/api/v1/employees/#{employee.id}", params: { email: "taken@acme.test" }, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(api_error).to include(
        "code" => "validation_failed",
        "details" => include("email" => [ "has already been taken" ])
      )
    end

    it "rejects a start date after the earliest compensation" do
      sign_in_hr
      employee = create(:employee, started_on: Date.new(2024, 1, 1))
      create(:compensation_record, employee: employee, effective_date: Date.new(2024, 1, 1))

      patch "/api/v1/employees/#{employee.id}", params: { started_on: "2024-06-01" }, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(api_error.fetch("details")).to include("started_on")
    end
  end

  describe "POST /api/v1/employees/import" do
    def upload_csv(path = Rails.root.join("spec/fixtures/files/directory.csv"))
      Rack::Test::UploadedFile.new(path, "text/csv")
    end

    it "requires login" do
      post "/api/v1/employees/import", params: { file: upload_csv }

      expect(response).to have_http_status(:unauthorized)
    end

    it "imports unique employees from the spreadsheet" do
      sign_in_hr
      post "/api/v1/employees/import", params: { file: upload_csv }

      expect(response).to have_http_status(:ok)
      expect(api_data).to include("employees" => 2, "compensation_records" => 3)
    end

    it "updates emails that already exist" do
      sign_in_hr
      post "/api/v1/employees/import", params: { file: upload_csv }
      post "/api/v1/employees/import", params: { file: upload_csv }

      expect(response).to have_http_status(:ok)
      expect(api_data).to include("employees" => 0, "updated" => 2)
    end

    it "rejects a missing file" do
      sign_in_hr
      post "/api/v1/employees/import"

      expect(response).to have_http_status(:unprocessable_content)
      expect(api_error).to include("code" => "invalid_request", "message" => "file is required")
    end

    it "rejects a non-CSV upload" do
      sign_in_hr
      path = Rails.root.join("tmp/directory_import.txt")
      File.write(path, "nope")
      post "/api/v1/employees/import", params: { file: upload_csv(path) }

      expect(response).to have_http_status(:unprocessable_content)
      expect(api_error).to include("code" => "invalid_request", "message" => "upload a CSV file")
    end

    it "rejects a spreadsheet that fails validation" do
      sign_in_hr
      path = Rails.root.join("tmp/directory_import_bad.csv")
      File.write(path, "first_name,email\nAda,ada@acme.test\n")
      post "/api/v1/employees/import", params: { file: upload_csv(path) }

      expect(response).to have_http_status(:unprocessable_content)
      expect(api_error).to include("code" => "invalid_request", "message" => a_string_including("missing columns"))
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

  describe "PATCH /api/v1/employees/:id/rehire" do
    it "requires login" do
      patch "/api/v1/employees/#{create(:employee, :left).id}/rehire", as: :json

      expect(response).to have_http_status(:unauthorized)
    end

    it "reactivates a leaver" do
      sign_in_hr
      employee = create(:employee, :left)
      create(:compensation_record, employee: employee)

      patch "/api/v1/employees/#{employee.id}/rehire", as: :json

      expect(response).to have_http_status(:ok)
      expect(api_data.fetch("employee")).to include("id" => employee.id, "status" => "active", "left_on" => nil)
    end

    it "rejects an active employee" do
      sign_in_hr
      patch "/api/v1/employees/#{create(:employee).id}/rehire", as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(api_error).to include("message" => "already active")
    end
  end

  describe "DELETE /api/v1/employees/:id" do
    it "requires login" do
      delete "/api/v1/employees/#{create(:employee).id}", as: :json

      expect(response).to have_http_status(:unauthorized)
    end

    it "deletes a mistaken hire" do
      sign_in_hr
      employee = create(:employee)
      create(:compensation_record, employee: employee)

      delete "/api/v1/employees/#{employee.id}", as: :json

      expect(response).to have_http_status(:ok)
      expect(Employee.find_by(id: employee.id)).to be_nil
    end
  end

  describe "compensation corrections" do
    it "updates a pay row" do
      sign_in_hr
      employee = create(:employee)
      record = create(:compensation_record, employee: employee, base_amount: 80_000)

      patch "/api/v1/employees/#{employee.id}/compensation_records/#{record.id}",
            params: { base_amount: 81_000, currency: "USD", pay_period: "annual", effective_date: "2024-01-01" },
            as: :json

      expect(response).to have_http_status(:ok)
      expect(record.reload.base_amount).to eq(81_000)
    end

    it "deletes a pay row when more than one exists" do
      sign_in_hr
      employee = create(:employee)
      create(:compensation_record, employee: employee, effective_date: Date.new(2024, 1, 1))
      later = create(:compensation_record, employee: employee, effective_date: Date.new(2025, 1, 1),
                                           base_amount: 90_000)

      delete "/api/v1/employees/#{employee.id}/compensation_records/#{later.id}", as: :json

      expect(response).to have_http_status(:ok)
      expect(CompensationRecord.find_by(id: later.id)).to be_nil
    end

    it "does not delete the only pay row" do
      sign_in_hr
      employee = create(:employee)
      record = create(:compensation_record, employee: employee)

      delete "/api/v1/employees/#{employee.id}/compensation_records/#{record.id}", as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(api_error).to include("message" => "cannot delete the only pay record")
      expect(AuditEvent.where(action: "destroy", record_type: "CompensationRecord")).not_to exist
    end
  end

  describe "GET /api/v1/employees/export" do
    it "requires login" do
      get "/api/v1/employees/export"

      expect(response).to have_http_status(:unauthorized)
    end

    it "exports the filtered directory as csv" do
      sign_in_hr
      create(:employee, first_name: "Ada", last_name: "Lovelace", country: "GB")
      create(:employee, first_name: "Grace", last_name: "Hopper", country: "US", email: "grace@acme.test")

      get "/api/v1/employees/export", params: { country: "GB" }

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("text/csv")
      expect(response.body).to include("Ada Lovelace")
      expect(response.body).not_to include("Grace Hopper")
    end
  end
end
