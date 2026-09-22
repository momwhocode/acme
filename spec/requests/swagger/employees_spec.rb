require "swagger_helper"

RSpec.describe "Employees", type: :request do
  def onboard_body(**overrides)
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

  path "/api/v1/employees" do
    get "List the directory" do
      tags "Employees"
      produces "application/json"
      description "Server-paginated. Filters use the directory index. `q` is trigram search on name and email."
      parameter name: :page, in: :query, required: false, schema: { type: :integer, minimum: 1 }
      parameter name: :per_page, in: :query, required: false, schema: { type: :integer, minimum: 1, maximum: 100 }
      parameter name: :limit, in: :query, required: false, schema: { type: :integer, minimum: 1, maximum: 100 }
      parameter name: :country, in: :query, required: false, schema: { type: :string, minLength: 2, maxLength: 2 }
      parameter name: :department, in: :query, required: false, schema: { type: :string }
      parameter name: :type, in: :query, required: false, schema: { type: :string, enum: Employee::EMPLOYMENT_TYPES }
      parameter name: :employment_type, in: :query, required: false, schema: { type: :string, enum: Employee::EMPLOYMENT_TYPES }
      parameter name: :status, in: :query, required: false, getter: :employment_status,
                schema: { type: :string, enum: Employee::STATUSES }
      parameter name: :q, in: :query, required: false, schema: { type: :string }

      response "200", "page of employees" do
        schema "$ref" => "#/components/schemas/DirectoryPage"

        context "when listing the first page" do
          before do
            sign_in_hr
            create(:employee, first_name: "Ada", last_name: "Lovelace")
          end

          run_test! do |response|
            expect(api_meta.fetch("pagination")).to include("page" => 1, "limit" => 25)
          end
        end

        context "when paging past the last page" do
          let(:page) { 9 }
          before do
            sign_in_hr
            create(:employee)
          end

          run_test! do |response|
            expect(api_data.fetch("employees")).to eq([])
          end
        end

        context "when per_page is above the max" do
          let(:per_page) { 500 }
          before { sign_in_hr }

          run_test! do |response|
            expect(api_meta.dig("pagination", "limit")).to eq(100)
          end
        end

        context "when filtering and searching" do
          let(:country) { "gb" }
          let(:department) { "engineering" }
          let(:type) { "full-time" }
          let(:employment_status) { "active" }
          let(:q) { "ada" }
          before do
            sign_in_hr
            create(:employee, first_name: "Ada", country: "GB", department: "engineering")
            create(:employee, first_name: "Grace", country: "US", department: "sales", email: "grace@acme.test")
          end

          run_test! do |response|
            expect(api_data.fetch("employees").pluck("first_name")).to eq([ "Ada" ])
          end
        end

        context "when filtering by employment_type" do
          let(:employment_type) { "intern" }
          before do
            sign_in_hr
            create(:employee, employment_type: "intern")
            create(:employee, employment_type: "full-time", email: "ft@acme.test")
          end

          run_test! do |response|
            expect(api_data.fetch("employees").pluck("employment_type")).to eq([ "intern" ])
          end
        end
      end

      response "401", "not signed in" do
        schema "$ref" => "#/components/schemas/Error"
        run_test!
      end

      response "422", "invalid filter" do
        schema "$ref" => "#/components/schemas/Error"
        before { sign_in_hr }

        context "when type is unknown" do
          let(:type) { "contractor-plus" }

          run_test! do |response|
            expect(api_error).to include("code" => "invalid_request", "message" => "unknown type")
          end
        end

        context "when status is unknown" do
          let(:employment_status) { "onboarding" }

          run_test! do |response|
            expect(api_error).to include("message" => "unknown status")
          end
        end

        context "when country is not ISO-2" do
          let(:country) { "USA" }

          run_test! do |response|
            expect(api_error).to include("message" => "unknown country")
          end
        end
      end
    end

    post "Onboard an employee" do
      tags "Employees"
      consumes "application/json"
      produces "application/json"
      description "Creates an active employee and the first compensation row in one transaction."
      parameter name: :body, in: :body, schema: { "$ref" => "#/components/schemas/OnboardRequest" }

      response "201", "hired" do
        schema "$ref" => "#/components/schemas/HireResponse"
        let(:body) { onboard_body }
        before { sign_in_hr }

        run_test! do |response|
          expect(api_data.dig("employee", "status")).to eq("active")
          expect(api_data.dig("compensation_record", "change_reason")).to eq("hire")
        end
      end

      response "401", "not signed in" do
        schema "$ref" => "#/components/schemas/Error"
        let(:body) { onboard_body }
        run_test!
      end

      response "422", "invalid hire" do
        schema "$ref" => "#/components/schemas/ValidationError"
        before { sign_in_hr }

        context "when compensation is missing" do
          let(:body) { onboard_body.except(:compensation) }

          run_test! do |response|
            expect(api_error).to include("message" => "compensation is required")
          end
        end

        context "when compensation is empty" do
          let(:body) { onboard_body.merge(compensation: {}) }

          run_test! do |response|
            expect(api_error).to include("message" => "compensation is required")
          end
        end

        context "when the email is taken" do
          let(:body) { onboard_body }
          before { create(:employee, email: "ada@acme.test") }

          run_test! do |response|
            expect(api_error).to include("code" => "validation_failed", "message" => "validation failed")
          end
        end

        context "when first_name is blank" do
          let(:body) { onboard_body.merge(first_name: "") }

          run_test! do |response|
            expect(api_error.fetch("details")).to include("first_name")
          end
        end

        context "when hourly pay has no hours" do
          let(:body) { onboard_body(compensation: { pay_period: "hourly", hours_per_week: nil }) }

          run_test! do |response|
            expect(api_error.fetch("details")).to include("hours_per_week")
          end
        end

        context "when the currency is unsupported" do
          let(:body) { onboard_body(compensation: { currency: "JPY" }) }

          run_test! do |response|
            expect(api_error.fetch("details")).to include("currency")
          end
        end

        context "when the country is not ISO-2" do
          let(:body) { onboard_body.merge(country: "USA") }

          run_test! do |response|
            expect(api_error.fetch("details")).to include("country")
          end
        end
      end
    end
  end

  path "/api/v1/employees/{id}/offboard" do
    parameter name: :id, in: :path, schema: { type: :string, format: :uuid }

    patch "Mark a leaver" do
      tags "Employees"
      consumes "application/json"
      produces "application/json"
      description "Sets status to left. left_on must be ISO-8601 and cover every compensation date."
      parameter name: :body, in: :body, schema: { "$ref" => "#/components/schemas/OffboardRequest" }

      response "200", "marked left" do
        schema "$ref" => "#/components/schemas/OffboardResponse"
        let(:employee) { create(:employee) }
        let(:id) { employee.id }
        let(:body) { { left_on: "2025-06-01" } }
        before do
          sign_in_hr
          create(:compensation_record, employee: employee)
        end

        run_test! do |response|
          expect(api_data.fetch("employee")).to include("status" => "left", "left_on" => "2025-06-01")
        end
      end

      response "401", "not signed in" do
        schema "$ref" => "#/components/schemas/Error"
        let(:id) { create(:employee).id }
        let(:body) { { left_on: "2025-06-01" } }
        run_test!
      end

      response "404", "unknown employee" do
        schema "$ref" => "#/components/schemas/Error"
        let(:id) { SecureRandom.uuid }
        let(:body) { { left_on: "2025-06-01" } }
        before { sign_in_hr }

        run_test!
      end

      response "422", "cannot offboard" do
        schema "$ref" => "#/components/schemas/ValidationError"
        before { sign_in_hr }

        context "when the employee already left" do
          let(:id) { create(:employee, :left).id }
          let(:body) { { left_on: "2025-07-01" } }

          run_test! do |response|
            expect(api_error).to include("message" => "already left")
          end
        end

        context "when left_on is blank" do
          let(:id) { create(:employee).id }
          let(:body) { { left_on: "" } }

          run_test! do |response|
            expect(api_error).to include("message" => "left_on is required")
          end
        end

        context "when left_on is not ISO-8601" do
          let(:id) { create(:employee).id }
          let(:body) { { left_on: "June 1" } }

          run_test! do |response|
            expect(api_error).to include("message" => "left_on is invalid")
          end
        end

        context "when left_on is before the latest compensation" do
          let(:employee) { create(:employee) }
          let(:id) { employee.id }
          let(:body) { { left_on: "2025-03-01" } }
          before { create(:compensation_record, employee: employee, effective_date: Date.new(2025, 4, 1)) }

          run_test! do |response|
            expect(api_error.fetch("details")).to include("left_on")
          end
        end

        context "when left_on is before started_on" do
          let(:id) { create(:employee, started_on: Date.new(2024, 1, 1)).id }
          let(:body) { { left_on: "2023-12-01" } }

          run_test! do |response|
            expect(api_error.fetch("details")).to include("left_on")
          end
        end
      end
    end
  end
end
