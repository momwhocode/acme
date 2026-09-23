module Api
  module V1
    class AnalyticsController < BaseController
      def show
        render_success(AnalyticsQuery.call)
      end

      def ask
        render_success(AnalyticsAsker.call(question: params[:question]))
      end
    end
  end
end
