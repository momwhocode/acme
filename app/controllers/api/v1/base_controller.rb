module Api
  module V1
    class BaseController < ActionController::API
      include ActionController::Cookies
      include ActionController::RequestForgeryProtection

      protect_from_forgery with: :exception
      self.allow_forgery_protection = ActionController::Base.allow_forgery_protection
      before_action :require_login!

      rescue_from ActionController::InvalidAuthenticityToken do
        render json: { error: "unauthorized" }, status: :unprocessable_entity
      end

      rescue_from ActiveRecord::RecordNotFound do
        render json: { error: "not found" }, status: :not_found
      end

      private

      def render_validation(record)
        render json: { error: "validation failed", errors: record.errors.messages },
               status: :unprocessable_content
      end

      def current_user
        return @current_user if defined?(@current_user)

        @current_user = User.find_by(id: session[:user_id])
      end

      def require_login!
        return if current_user

        render json: { error: "unauthorized" }, status: :unauthorized
      end
    end
  end
end
