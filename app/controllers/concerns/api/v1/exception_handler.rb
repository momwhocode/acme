module Api
  module V1
    # Shared JSON envelope. Unexpected exceptions never leak the message.
    module ExceptionHandler
      extend ActiveSupport::Concern

      included do
        rescue_from StandardError, with: :handle_internal_error
        rescue_from AppError, with: :handle_app_error
        rescue_from ActiveRecord::RecordInvalid, with: :handle_record_invalid
        rescue_from ActiveRecord::RecordNotUnique, with: :handle_conflict
        rescue_from ActiveRecord::RecordNotFound, with: :handle_not_found
        rescue_from ActionController::ParameterMissing, with: :handle_parameter_missing
        rescue_from ActionController::BadRequest, with: :handle_bad_request
        rescue_from ActionDispatch::Http::Parameters::ParseError, with: :handle_parse_error
        rescue_from ActionController::RoutingError, with: :handle_not_found
        rescue_from AbstractController::ActionNotFound, with: :handle_not_found
        rescue_from ActionController::InvalidAuthenticityToken, with: :handle_invalid_token
      end

      private

      def render_success(data, status: :ok, meta: nil)
        payload = { data: data }
        payload[:meta] = meta if meta.present?
        render json: payload, status: status
      end

      def render_error(code:, message:, status:, details: nil)
        error = { code: code, message: message }
        error[:details] = details if details.present?
        render json: { error: error }, status: status
      end

      def render_validation(record)
        render_error(
          code: "validation_failed",
          message: "validation failed",
          details: record.errors.messages,
          status: :unprocessable_content
        )
      end

      def handle_app_error(exception)
        render_error(code: "invalid_request", message: exception.message, status: :unprocessable_content)
      end

      def handle_record_invalid(exception)
        render_validation(exception.record)
      end

      def handle_conflict(_exception)
        render_error(code: "conflict", message: "already exists", status: :conflict)
      end

      def handle_not_found(_exception)
        render_error(code: "not_found", message: "not found", status: :not_found)
      end

      def handle_parameter_missing(exception)
        render_error(code: "invalid_request", message: exception.message, status: :unprocessable_content)
      end

      def handle_bad_request(_exception)
        render_error(code: "invalid_request", message: "bad request", status: :bad_request)
      end

      def handle_parse_error(_exception)
        render_error(code: "invalid_request", message: "invalid json", status: :bad_request)
      end

      def handle_invalid_token(_exception)
        render_error(code: "invalid_token", message: "unauthorized", status: :unprocessable_content)
      end

      def handle_internal_error(exception)
        Rails.logger.error("[api] #{exception.class}: #{exception.message}")
        Rails.logger.error(exception.backtrace&.first(8)&.join("\n"))
        render_error(code: "internal_error", message: "internal error", status: :internal_server_error)
      end
    end
  end
end
