require "swagger_helper"

RSpec.describe "Health", type: :request do
  path "/api/v1/health" do
    get "Liveness check" do
      tags "Health"
      produces "application/json"
      description "Public. Used by the signed-in home page and load balancers."

      response "200", "service is up" do
        schema "$ref" => "#/components/schemas/Health"
        run_test! do |response|
          expect(api_data).to include("status" => "ok", "app" => "acme")
        end
      end
    end
  end
end
