module Api
  module V1
    # Cookie session. Logout stays public so an expired cookie can still clear the client.
    class SessionsController < BaseController
      skip_before_action :require_login!, only: %i[create destroy]

      def show
        render_success({ user: current_user.as_session_json }, meta: csrf_meta)
      end

      def create
        user = User.authenticate_by(email: email, password: password)
        unless user
          render_error(code: "invalid_credentials", message: "Invalid email or password", status: :unauthorized)
          return
        end

        reset_session
        session[:user_id] = user.id
        render_success({ user: user.as_session_json }, status: :created, meta: csrf_meta)
      end

      def destroy
        reset_session
        render_success({}, meta: csrf_meta)
      end

      private

      def email
        params[:email].to_s.strip.downcase
      end

      def password
        params[:password].to_s
      end

      def csrf_meta
        { csrf_token: form_authenticity_token }
      end
    end
  end
end
