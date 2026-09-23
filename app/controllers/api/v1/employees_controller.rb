module Api
  module V1
    # Directory, hire lifecycle, CSV import/export.
    class EmployeesController < BaseController
      include ::Pagy::Backend
      include ActionController::DataStreaming

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
        audit!("onboard", employee)
        render_success(employee_payload(employee, record), status: :created)
      end

      def update
        employee = EmployeeUpdater.call(employee: Employee.find(params[:id]), params: employee_update_params)
        audit!("update", employee, employee_update_params.to_h)
        render_success(EmployeeProfile.call(employee))
      end

      def offboard
        employee = EmployeeOffboarder.call(employee: Employee.find(params[:id]), left_on: params[:left_on])
        audit!("offboard", employee, { left_on: employee.left_on })
        render_success({ employee: employee.as_directory_json })
      end

      def rehire
        employee = EmployeeRehirer.call(employee: Employee.find(params[:id]))
        audit!("rehire", employee)
        render_success(EmployeeProfile.call(employee))
      end

      def destroy
        employee = Employee.find(params[:id])
        audit!("destroy", employee, { email: employee.email })
        EmployeeDestroyer.call(employee: employee)
        render_success({})
      end

      def import
        result = DirectoryImporter.call(import_file)
        audit!("import", current_user, result)
        render_success(result)
      end

      def export
        query = DirectoryQuery.new(params)
        send_data DirectoryExporter.call(query.relation),
                  filename: "employees.csv",
                  type: "text/csv"
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
          *EmployeeOnboarder::EMPLOYEE_KEYS,
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
