module Api
  module V1
    class CompensationRecordsController < BaseController
      def create
        record, employee = CompensationAppender.call(
          employee: Employee.find(params[:employee_id]),
          params: compensation_params
        )
        render json: {
          compensation_record: record.as_api_json,
          employee: employee.as_directory_json
        }, status: :created
      rescue CompensationAppender::Error => e
        render json: { error: e.message }, status: :unprocessable_content
      rescue ActiveRecord::RecordInvalid => e
        render_validation(e.record)
      end

      private

      def compensation_params
        params.permit(:level, *CompensationRecord::ATTR_KEYS)
      end
    end
  end
end
