require "swagger_helper"

RSpec.describe "Session", type: :request do
  path "/api/v1/session" do
    post "Sign in" do
      tags "Session"
      consumes "application/json"
      produces "application/json"
      description "Creates a cookie session and returns a CSRF token. Email is matched case-insensitively."
      parameter name: :body, in: :body, schema: { "$ref" => "#/components/schemas/LoginRequest" }

      response "201", "signed in" do
        schema "$ref" => "#/components/schemas/Session"
        let(:user) { create(:user, email: "hr@acme.test", password: "password") }
        let(:body) { { email: "HR@acme.test", password: "password" } }
        before { user }

        run_test! do |response|
          expect(response.parsed_body.dig("user", "email")).to eq("hr@acme.test")
          expect(response.parsed_body.fetch("csrf_token")).to be_present
        end
      end

      response "401", "invalid credentials" do
        schema "$ref" => "#/components/schemas/Error"

        context "when the password is wrong" do
          let(:body) { { email: "hr@acme.test", password: "wrong-password" } }
          before { create(:user, email: "hr@acme.test", password: "password") }

          run_test! do |response|
            expect(response.parsed_body).to eq("error" => "Invalid email or password")
          end
        end

        context "when the email is unknown" do
          let(:body) { { email: "missing@acme.test", password: "password" } }

          run_test! do |response|
            expect(response.parsed_body).to eq("error" => "Invalid email or password")
          end
        end

        context "when credentials are blank" do
          let(:body) { { email: "", password: "" } }

          run_test! do |response|
            expect(response.parsed_body).to eq("error" => "Invalid email or password")
          end
        end
      end

      response "422", "CSRF token missing" do
        schema "$ref" => "#/components/schemas/Error"
        let(:body) { { email: "hr@acme.test", password: "password" } }

        before { create(:user, email: "hr@acme.test", password: "password") }

        around do |example|
          previous = Api::V1::BaseController.allow_forgery_protection
          Api::V1::BaseController.allow_forgery_protection = true
          example.run
        ensure
          Api::V1::BaseController.allow_forgery_protection = previous
        end

        run_test! do |response|
          expect(response.parsed_body).to eq("error" => "unauthorized")
        end
      end
    end

    get "Current HR user" do
      tags "Session"
      produces "application/json"
      description "Requires a session cookie."

      response "200", "signed in" do
        schema "$ref" => "#/components/schemas/Session"
        before { sign_in_hr }

        run_test! do |response|
          expect(response.parsed_body.fetch("user")).to include("email")
          expect(response.parsed_body.fetch("csrf_token")).to be_present
        end
      end

      response "401", "no session" do
        schema "$ref" => "#/components/schemas/Error"
        run_test!
      end
    end

    delete "Sign out" do
      tags "Session"
      produces "application/json"
      description "Always succeeds. Clears the session when one exists."

      response "200", "signed out" do
        schema "$ref" => "#/components/schemas/Logout"

        context "when a session exists" do
          before { sign_in_hr }

          run_test! do |response|
            expect(response.parsed_body.fetch("csrf_token")).to be_present
          end
        end

        context "when no session exists" do
          run_test!
        end
      end
    end
  end
end
