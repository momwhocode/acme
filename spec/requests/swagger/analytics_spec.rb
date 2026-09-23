require "swagger_helper"

RSpec.describe "Analytics", type: :request do
  path "/api/v1/analytics" do
    get "HR analytics snapshot" do
      tags "Analytics"
      produces "application/json"
      description "SQL aggregations over current active compensation. Returns annualised payroll in USD, average and median pay, and headcount mix by type and department."

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

  path "/api/v1/analytics/ask" do
    post "Ask a payroll question" do
      tags "Analytics"
      consumes "application/json"
      produces "application/json"
      description "Answers payroll, average, median, headcount mix, and this month including leavers from the SQL snapshot."
      parameter name: :body, in: :body, schema: { "$ref" => "#/components/schemas/AnalyticsAskRequest" }

      response "200", "answered" do
        schema "$ref" => "#/components/schemas/AnalyticsAsk"
        let(:body) { { question: "What is the total annualised payroll?" } }
        before do
          sign_in_hr
          ExchangeRate.seed!(on: Date.new(2024, 1, 1))
          create(:compensation_record, employee: create(:employee), base_amount: 80_000)
        end

        run_test! do |response|
          expect(api_data.fetch("answer")).to include("USD")
        end
      end

      response "401", "not signed in" do
        schema "$ref" => "#/components/schemas/Error"
        let(:body) { { question: "What is payroll?" } }
        run_test!
      end

      response "422", "invalid question" do
        schema "$ref" => "#/components/schemas/Error"
        let(:body) { { question: "" } }
        before { sign_in_hr }

        run_test! do |response|
          expect(api_error).to include("message" => "question is required")
        end
      end
    end
  end
end
