require "swagger_helper"

RSpec.describe "Analytics", type: :request do
  path "/api/v1/analytics" do
    get "HR analytics snapshot" do
      tags "Analytics"
      produces "application/json"
      description "SQL aggregations over current active compensation. Returns annualised payroll in USD, average and median pay, and headcount mix by type and department."
      parameter name: :as_of, in: :query, required: false, schema: { type: :string, format: :date },
                description: "Snapshot date. Defaults to today."

      response "200", "metrics" do
        schema "$ref" => "#/components/schemas/Analytics"
        before do
          sign_in_hr
          ExchangeRate.seed!(on: Date.new(2024, 1, 1))
          create(:compensation_record, employee: create(:employee), base_amount: 80_000)
        end

        run_test! do |response|
          expect(api_data).to include("annualised_usd", "by_type", "by_department")
        end
      end

      response "401", "not signed in" do
        schema "$ref" => "#/components/schemas/Error"
        run_test!
      end
    end
  end
end
