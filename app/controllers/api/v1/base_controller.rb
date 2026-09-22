module Api
  module V1
    class BaseController < ActionController::API
      include ActionController::Cookies
      include ActionController::RequestForgeryProtection

      protect_from_forgery with: :exception
      self.allow_forgery_protection = ActionController::Base.allow_forgery_protection
      before_action :require_login!

      rescue_from ActionController::InvalidAuthenticityToken do
        render_error(code: "invalid_token", message: "unauthorized", status: :unprocessable_entity)
      end

      rescue_from ActiveRecord::RecordNotFound do
        render_error(code: "not_found", message: "not found", status: :not_found)
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

      def render_request_error(message, status: :unprocessable_content)
        render_error(code: "invalid_request", message: message, status: status)
      end

      def current_user
        return @current_user if defined?(@current_user)

        @current_user = User.find_by(id: session[:user_id])
      end

      def require_login!
        return if current_user

        render_error(code: "unauthorized", message: "unauthorized", status: :unauthorized)
      end
    end
  end
end
