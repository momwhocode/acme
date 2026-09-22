require "swagger_helper"

RSpec.describe "Exceptions", type: :request do
  path "/api/v1/{unmatched}" do
    parameter name: :unmatched, in: :path, schema: { type: :string }

    get "Unknown API route" do
      tags "Errors"
      produces "application/json"
      description "Any unmatched `/api` path returns the shared error envelope."
      let(:unmatched) { "does-not-exist" }

      response "404", "route not found" do
        schema "$ref" => "#/components/schemas/Error"

        run_test! do |response|
          expect(api_error).to include("code" => "not_found", "message" => "not found")
        end
      end
    end
  end
end
