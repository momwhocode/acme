require "swagger_helper"

RSpec.describe "Analytics", type: :request do
  path "/api/v1/analytics" do
    get "HR analytics snapshot" do
      tags "Analytics"
      produces "application/json"
      description "as_of snapshot over employment dates. Mix filters refetch the same window."
      parameter name: :as_of, in: :query, required: false, schema: { type: :string, format: :date },
                description: "Snapshot date. Defaults to today."
      parameter name: :country, in: :query, required: false, schema: { type: :string }
      parameter name: :department, in: :query, required: false, schema: { type: :string }
      parameter name: :type, in: :query, required: false, schema: { type: :string }
      parameter name: :level, in: :query, required: false, schema: { type: :string }

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
