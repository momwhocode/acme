module Api
  module V1
    class SessionsController < BaseController
      skip_before_action :require_login!, only: %i[create destroy]

      def show
        render json: session_payload(current_user)
      end

      def create
        user = User.authenticate_by(email: email, password: password)
        unless user
          render json: { error: "Invalid email or password" }, status: :unauthorized
          return
        end

        reset_session
        session[:user_id] = user.id
        render json: session_payload(user), status: :created
      end

      def destroy
        reset_session
        render json: { csrf_token: form_authenticity_token }
      end

      private

      def email
        params[:email].to_s.strip.downcase
      end

      def password
        params[:password].to_s
      end

      def session_payload(user)
        { user: user.as_session_json, csrf_token: form_authenticity_token }
      end
    end
  end
end
