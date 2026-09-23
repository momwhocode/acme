require "swagger_helper"

RSpec.describe "Compensation records", type: :request do
  path "/api/v1/employees/{employee_id}/compensation_records" do
    parameter name: :employee_id, in: :path, schema: { type: :string, format: :uuid }

    post "Record a raise or promotion" do
      tags "Compensation"
      consumes "application/json"
      produces "application/json"
      description "Appends an effective-dated pay row. Optional level updates the employee. Rejected for leavers."
      parameter name: :body, in: :body, schema: { "$ref" => "#/components/schemas/CompensationChangeRequest" }

      response "201", "pay change recorded" do
        schema "$ref" => "#/components/schemas/CompensationChangeResponse"
        let(:employee) { create(:employee, level: "IC2") }
        let(:employee_id) { employee.id }
        let(:body) do
          {
            base_amount: 90_000,
            currency: "GBP",
            pay_period: "annual",
            effective_date: "2025-04-01",
            change_reason: "promotion",
            level: "IC3"
          }
        end
        before do
          sign_in_hr
          create(:compensation_record, employee: employee)
        end

        run_test! do |response|
          expect(api_data.dig("compensation_record", "change_reason")).to eq("promotion")
          expect(api_data.dig("employee", "level")).to eq("IC3")
        end
      end

      response "401", "not signed in" do
        schema "$ref" => "#/components/schemas/Error"
        let(:employee_id) { create(:employee).id }
        let(:body) { { base_amount: 90_000, currency: "USD", pay_period: "annual", effective_date: "2025-04-01" } }
        run_test!
      end

      response "404", "unknown employee" do
        schema "$ref" => "#/components/schemas/Error"
        let(:employee_id) { SecureRandom.uuid }
        let(:body) { { base_amount: 90_000, currency: "USD", pay_period: "annual", effective_date: "2025-04-01" } }
        before { sign_in_hr }

        run_test!
      end

      response "422", "invalid pay change" do
        schema "$ref" => "#/components/schemas/ValidationError"
        before { sign_in_hr }

        context "when the employee has left" do
          let(:employee_id) { create(:employee, :left).id }
          let(:body) { { base_amount: 90_000, currency: "USD", pay_period: "annual", effective_date: "2025-04-01" } }

          run_test! do |response|
            expect(api_error).to include("message" => "cannot change pay for a leaver")
          end
        end

        context "when the effective date is already used" do
          let(:employee) { create(:employee) }
          let(:employee_id) { employee.id }
          let(:body) { { base_amount: 90_000, currency: "GBP", pay_period: "annual", effective_date: "2025-04-01" } }
          before { create(:compensation_record, employee: employee, effective_date: Date.new(2025, 4, 1)) }

          run_test! do |response|
            expect(api_error.fetch("details")).to include("effective_date")
          end
        end

        context "when the currency is unsupported" do
          let(:employee) { create(:employee) }
          let(:employee_id) { employee.id }
          let(:body) { { base_amount: 90_000, currency: "JPY", pay_period: "annual", effective_date: "2025-04-01" } }
          before { create(:compensation_record, employee: employee) }

          run_test! do |response|
            expect(api_error.fetch("details")).to include("currency")
          end
        end

        context "when the date is before started_on" do
          let(:employee) { create(:employee, started_on: Date.new(2024, 6, 1)) }
          let(:employee_id) { employee.id }
          let(:body) { { base_amount: 90_000, currency: "USD", pay_period: "annual", effective_date: "2024-01-01" } }
          before { create(:compensation_record, employee: employee, effective_date: Date.new(2024, 6, 1)) }

          run_test! do |response|
            expect(api_error.fetch("details")).to include("effective_date")
          end
        end

        context "when hourly pay has no hours" do
          let(:employee) { create(:employee) }
          let(:employee_id) { employee.id }
          let(:body) do
            { base_amount: 40, currency: "USD", pay_period: "hourly", effective_date: "2025-04-01" }
          end
          before { create(:compensation_record, employee: employee) }

          run_test! do |response|
            expect(api_error.fetch("details")).to include("hours_per_week")
          end
        end
      end
    end
  end

  path "/api/v1/employees/{employee_id}/compensation_records/{id}" do
    parameter name: :employee_id, in: :path, schema: { type: :string, format: :uuid }
    parameter name: :id, in: :path, schema: { type: :string, format: :uuid }

    patch "Correct a pay row" do
      tags "Compensation"
      consumes "application/json"
      produces "application/json"
      description "In-place correction. New raises still POST a new row."
      parameter name: :body, in: :body, schema: { "$ref" => "#/components/schemas/CompensationInput" }

      response "200", "corrected" do
        schema "$ref" => "#/components/schemas/CompensationCorrectionResponse"
        let(:employee) { create(:employee) }
        let(:record) { create(:compensation_record, employee: employee, base_amount: 80_000) }
        let(:employee_id) { employee.id }
        let(:id) { record.id }
        let(:body) { { base_amount: 81_000, currency: "USD", pay_period: "annual", effective_date: "2024-01-01" } }
        before do
          sign_in_hr
          ExchangeRate.seed!(on: Date.new(2024, 1, 1))
        end

        run_test! do |response|
          expect(record.reload.base_amount).to eq(81_000)
        end
      end

      response "401", "not signed in" do
        schema "$ref" => "#/components/schemas/Error"
        let(:employee) { create(:employee) }
        let(:employee_id) { employee.id }
        let(:id) { create(:compensation_record, employee: employee).id }
        let(:body) { { base_amount: 81_000 } }
        run_test!
      end

      response "422", "no fields to update" do
        schema "$ref" => "#/components/schemas/Error"
        let(:employee) { create(:employee) }
        let(:employee_id) { employee.id }
        let(:id) { create(:compensation_record, employee: employee).id }
        let(:body) { { level: "IC3" } }
        before { sign_in_hr }

        run_test! do |response|
          expect(api_error).to include("message" => "no compensation fields to update")
        end
      end
    end

    delete "Delete a pay row" do
      tags "Compensation"
      produces "application/json"
      description "Removes one row. The hire must keep at least one compensation record."

      response "200", "deleted" do
        schema "$ref" => "#/components/schemas/Logout"
        let(:employee) { create(:employee) }
        let(:later) do
          create(:compensation_record, employee: employee, effective_date: Date.new(2024, 1, 1))
          create(:compensation_record, employee: employee, effective_date: Date.new(2025, 1, 1), base_amount: 90_000)
        end
        let(:employee_id) { employee.id }
        let(:id) { later.id }
        before { sign_in_hr }

        run_test! do |response|
          expect(CompensationRecord.find_by(id: later.id)).to be_nil
        end
      end

      response "422", "only pay record" do
        schema "$ref" => "#/components/schemas/Error"
        let(:employee) { create(:employee) }
        let(:record) { create(:compensation_record, employee: employee) }
        let(:employee_id) { employee.id }
        let(:id) { record.id }
        before { sign_in_hr }

        run_test! do |response|
          expect(api_error).to include("message" => "cannot delete the only pay record")
        end
      end
    end
  end
end
