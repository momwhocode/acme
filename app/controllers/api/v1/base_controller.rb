module Api
  module V1
    # Cookie-session JSON API. Health and login skip require_login!.
    class BaseController < ActionController::API
      include ActionController::Cookies
      include ActionController::RequestForgeryProtection
      include ExceptionHandler

      protect_from_forgery with: :exception
      self.allow_forgery_protection = ActionController::Base.allow_forgery_protection
      before_action :require_login!

      private

      def current_user
        return @current_user if defined?(@current_user)

        @current_user = User.find_by(id: session[:user_id])
      end

      def require_login!
        return if current_user

        render_error(code: "unauthorized", message: "unauthorized", status: :unauthorized)
      end

      def audit!(action, record, payload = {})
        AuditRecorder.record(actor: current_user, action: action, record: record, payload: payload)
      end
    end
  end
end
