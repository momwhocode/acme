module Api
  module V1
    class HealthController < BaseController
      skip_before_action :require_login!

      def show
        render json: { status: "ok", app: "acme" }
      end
    end
  end
end
