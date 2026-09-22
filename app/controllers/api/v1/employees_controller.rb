module Api
  module V1
    class EmployeesController < BaseController
      include Pagy::Backend

      def index
        query = DirectoryQuery.new(params)
        pager, records = pagy(query.relation, limit: query.limit, page: query.page)

        render json: {
          employees: records.map(&:as_directory_json),
          pagination: pagination_json(pager)
        }
      rescue DirectoryQuery::Error => e
        render json: { error: e.message }, status: :unprocessable_content
      end

      def create
        employee, record = EmployeeOnboarder.call(employee_params)
        render json: employee_payload(employee, record), status: :created
      rescue EmployeeOnboarder::Error => e
        render json: { error: e.message }, status: :unprocessable_content
      rescue ActiveRecord::RecordInvalid => e
        render_validation(e.record)
      end

      def offboard
        employee = EmployeeOffboarder.call(employee: Employee.find(params[:id]), left_on: params[:left_on])
        render json: { employee: employee.as_directory_json }
      rescue EmployeeOffboarder::Error => e
        render json: { error: e.message }, status: :unprocessable_content
      rescue ActiveRecord::RecordInvalid => e
        render_validation(e.record)
      end

      private

      def pagination_json(pager)
        {
          page: pager.page,
          pages: pager.pages,
          count: pager.count,
          limit: pager.limit
        }
      end

      def employee_payload(employee, record)
        {
          employee: employee.as_directory_json,
          compensation_record: record.as_api_json
        }
      end

      def employee_params
        params.permit(
          :first_name, :last_name, :email, :country, :department,
          :employment_type, :level, :started_on,
          compensation: CompensationRecord::ATTR_KEYS
        )
      end
    end
  end
end
