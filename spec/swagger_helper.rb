require "rails_helper"

RSpec.configure do |config|
  config.openapi_root = Rails.root.join("swagger").to_s
  config.openapi_format = :yaml
  config.openapi_specs = {
    "v1/swagger.yaml" => {
      openapi: "3.0.1",
      info: {
        title: "ACME Salary Management API",
        version: "v1",
        description: <<~TEXT
          JSON API for the HR manager. Cookie session after `POST /api/v1/session`.
          Mutating requests need `X-CSRF-Token` from the session payload when CSRF is on.
          Health and these docs are public. Everything else requires a signed-in HR session.
        TEXT
      },
      servers: [
        { url: "http://localhost:3000", description: "Local development" }
      ],
      tags: [
        { name: "Health", description: "Liveness. No session." },
        { name: "Session", description: "HR login, current user, logout." },
        { name: "Employees", description: "Directory, onboard, and offboard." },
        { name: "Compensation", description: "Effective-dated raises and promotions." }
      ],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: :apiKey,
            in: :cookie,
            name: "_acme_session",
            description: "Set by POST /api/v1/session. Swagger UI reuses it on the same origin."
          },
          csrfToken: {
            type: :apiKey,
            in: :header,
            name: "X-CSRF-Token",
            description: "csrf_token from the session response. Required when CSRF protection is on."
          }
        },
        schemas: {
          Error: {
            type: :object,
            required: %w[error],
            properties: {
              error: { type: :string }
            }
          },
          ValidationError: {
            type: :object,
            required: %w[error],
            properties: {
              error: { type: :string, example: "validation failed" },
              errors: {
                type: :object,
                additionalProperties: {
                  type: :array,
                  items: { type: :string }
                }
              }
            }
          },
          User: {
            type: :object,
            required: %w[id email first_name last_name],
            properties: {
              id: { type: :string, format: :uuid },
              email: { type: :string, format: :email },
              first_name: { type: :string },
              last_name: { type: :string }
            }
          },
          Session: {
            type: :object,
            required: %w[user csrf_token],
            properties: {
              user: { "$ref" => "#/components/schemas/User" },
              csrf_token: { type: :string }
            }
          },
          Logout: {
            type: :object,
            required: %w[csrf_token],
            properties: {
              csrf_token: { type: :string }
            }
          },
          Health: {
            type: :object,
            required: %w[status app],
            properties: {
              status: { type: :string, example: "ok" },
              app: { type: :string, example: "acme" }
            }
          },
          Employee: {
            type: :object,
            required: %w[
              id first_name last_name email country department
              employment_type status started_on
            ],
            properties: {
              id: { type: :string, format: :uuid },
              first_name: { type: :string },
              last_name: { type: :string },
              email: { type: :string, format: :email },
              country: { type: :string, minLength: 2, maxLength: 2, example: "GB" },
              department: { type: :string, example: "engineering" },
              employment_type: { type: :string, enum: %w[full-time part-time contractor freelancer intern] },
              status: { type: :string, enum: %w[active left] },
              level: { type: :string, nullable: true },
              started_on: { type: :string, format: :date },
              left_on: { type: :string, format: :date, nullable: true }
            }
          },
          Decimal: {
            description: "Rails may serialize decimals as a number or a string.",
            oneOf: [
              { type: :string },
              { type: :number }
            ]
          },
          CompensationRecord: {
            type: :object,
            required: %w[id employee_id base_amount currency pay_period effective_date],
            properties: {
              id: { type: :string, format: :uuid },
              employee_id: { type: :string, format: :uuid },
              base_amount: { "$ref" => "#/components/schemas/Decimal" },
              currency: { type: :string, enum: %w[USD EUR GBP INR] },
              pay_period: { type: :string, enum: %w[hourly daily monthly annual] },
              hours_per_week: { "$ref" => "#/components/schemas/Decimal", nullable: true },
              effective_date: { type: :string, format: :date },
              change_reason: { type: :string, nullable: true }
            }
          },
          Pagination: {
            type: :object,
            required: %w[page pages count limit],
            properties: {
              page: { type: :integer },
              pages: { type: :integer },
              count: { type: :integer },
              limit: { type: :integer }
            }
          },
          DirectoryPage: {
            type: :object,
            required: %w[employees pagination],
            properties: {
              employees: { type: :array, items: { "$ref" => "#/components/schemas/Employee" } },
              pagination: { "$ref" => "#/components/schemas/Pagination" }
            }
          },
          HireResponse: {
            type: :object,
            required: %w[employee compensation_record],
            properties: {
              employee: { "$ref" => "#/components/schemas/Employee" },
              compensation_record: { "$ref" => "#/components/schemas/CompensationRecord" }
            }
          },
          CompensationChangeResponse: {
            type: :object,
            required: %w[compensation_record employee],
            properties: {
              compensation_record: { "$ref" => "#/components/schemas/CompensationRecord" },
              employee: { "$ref" => "#/components/schemas/Employee" }
            }
          },
          OffboardResponse: {
            type: :object,
            required: %w[employee],
            properties: {
              employee: { "$ref" => "#/components/schemas/Employee" }
            }
          },
          CompensationInput: {
            type: :object,
            required: %w[base_amount currency pay_period],
            properties: {
              base_amount: { type: :number, minimum: 0, example: 80_000 },
              currency: { type: :string, enum: %w[USD EUR GBP INR] },
              pay_period: { type: :string, enum: %w[hourly daily monthly annual] },
              hours_per_week: { type: :number, exclusiveMinimum: 0, maximum: 168 },
              effective_date: { type: :string, format: :date },
              change_reason: { type: :string, maxLength: 255 }
            }
          },
          OnboardRequest: {
            type: :object,
            required: %w[first_name last_name email country department employment_type started_on compensation],
            properties: {
              first_name: { type: :string, example: "Ada" },
              last_name: { type: :string, example: "Lovelace" },
              email: { type: :string, format: :email, example: "ada@acme.test" },
              country: { type: :string, example: "GB" },
              department: { type: :string, example: "engineering" },
              employment_type: { type: :string, enum: %w[full-time part-time contractor freelancer intern] },
              level: { type: :string, example: "IC2" },
              started_on: { type: :string, format: :date, example: "2024-01-01" },
              compensation: { "$ref" => "#/components/schemas/CompensationInput" }
            }
          },
          CompensationChangeRequest: {
            allOf: [
              { "$ref" => "#/components/schemas/CompensationInput" },
              {
                type: :object,
                properties: {
                  effective_date: { type: :string, format: :date, example: "2025-04-01" },
                  change_reason: { type: :string, example: "promotion" },
                  level: { type: :string, example: "IC3" }
                }
              }
            ]
          },
          OffboardRequest: {
            type: :object,
            required: %w[left_on],
            properties: {
              left_on: { type: :string, format: :date, example: "2025-06-01" }
            }
          },
          LoginRequest: {
            type: :object,
            required: %w[email password],
            properties: {
              email: { type: :string, format: :email, example: "hr@acme.test" },
              password: { type: :string, format: :password, minLength: 8, maxLength: 72 }
            }
          }
        }
      }
    }
  }
end
