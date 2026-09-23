module Api
  module V1
    class AnalyticsController < BaseController
      def show
        render_success(
          AnalyticsQuery.call(
            as_of: as_of_date,
            country: params[:country],
            department: params[:department],
            type: params[:type],
            level: params[:level]
          )
        )
      end

      private

      def as_of_date
        return Date.current if params[:as_of].blank?

        Date.iso8601(params[:as_of].to_s)
      rescue Date::Error, ArgumentError
        raise AppError, "as_of is invalid"
      end
    end
  end
end
