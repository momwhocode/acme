module Api
  module V1
    # Public liveness. No session.
    class HealthController < BaseController
      skip_before_action :require_login!

      def show
        render_success({ status: "ok", app: "acme" })
      end
    end
  end
end
