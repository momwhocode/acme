module Api
  module V1
    class HealthController < BaseController
      def show
        render json: { status: "ok", app: "acme" }
      end
    end
  end
end
