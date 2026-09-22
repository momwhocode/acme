module Api
  module V1
    class EmployeesController < BaseController
      include Pagy::Backend

      def index
        query = DirectoryQuery.new(params)
        pager, records = pagy(query.relation, limit: query.limit, page: query.page)

        render_success(
          { employees: DirectoryPayload.employees(records) },
          meta: { pagination: pagination_json(pager), facets: DirectoryPayload.facets }
        )
      end

      def show
        render_success(EmployeeProfile.call(Employee.find(params[:id])))
      end

      def create
        employee, record = EmployeeOnboarder.call(employee_params)
        render_success(employee_payload(employee, record), status: :created)
      end

      def offboard
        employee = EmployeeOffboarder.call(employee: Employee.find(params[:id]), left_on: params[:left_on])
        render_success({ employee: employee.as_directory_json })
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
