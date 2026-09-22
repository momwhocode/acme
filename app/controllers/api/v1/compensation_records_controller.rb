module Api
  module V1
    class CompensationRecordsController < BaseController
      def create
        record, employee = CompensationAppender.call(
          employee: Employee.find(params[:employee_id]),
          params: compensation_params
        )
        render_success(
          {
            compensation_record: record.as_api_json,
            employee: employee.as_directory_json
          },
          status: :created
        )
      end

      private

      def compensation_params
        params.permit(:level, *CompensationRecord::ATTR_KEYS)
      end
    end
  end
end
