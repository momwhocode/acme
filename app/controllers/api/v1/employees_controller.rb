module Api
  module V1
    class EmployeesController < BaseController
      include ::Pagy::Backend

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

      def update
        employee = EmployeeUpdater.call(employee: Employee.find(params[:id]), params: employee_update_params)
        render_success(EmployeeProfile.call(employee))
      end

      def offboard
        employee = EmployeeOffboarder.call(employee: Employee.find(params[:id]), left_on: params[:left_on])
        render_success({ employee: employee.as_directory_json })
      end

      def import
        render_success(DirectoryImporter.call(import_file))
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
          *EmployeeUpdater::ATTR_KEYS,
          compensation: CompensationRecord::ATTR_KEYS
        )
      end

      def employee_update_params
        params.permit(*EmployeeUpdater::ATTR_KEYS)
      end

      def import_file
        file = params[:file]
        raise AppError, "file is required" if file.blank?

        name = file.respond_to?(:original_filename) ? file.original_filename : file.to_s
        raise AppError, "upload a CSV file" unless File.extname(name.to_s).downcase == ".csv"

        file
      end
    end
  end
end
