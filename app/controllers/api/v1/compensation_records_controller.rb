module Api
  module V1
    class CompensationRecordsController < BaseController
      def create
        record, employee = CompensationAppender.call(
          employee: Employee.find(params[:employee_id]),
          params: compensation_params
        )
        audit!("create", record, { employee_id: employee.id })
        render_success(
          {
            compensation_record: record.as_api_json,
            employee: employee.as_directory_json
          },
          status: :created
        )
      end

      def update
        record = compensation_record
        CompensationCorrector.call(record: record, params: compensation_params)
        audit!("update", record)
        render_success({ compensation_record: CompensationPayload.call(record.reload) })
      end

      def destroy
        record = compensation_record
        raise AppError, "cannot delete the only pay record" if record.employee.compensation_records.count <= 1

        audit!("destroy", record, { employee_id: record.employee_id })
        record.destroy!
        render_success({})
      end

      private

      def compensation_record
        Employee.find(params[:employee_id]).compensation_records.find(params[:id])
      end

      def audit!(action, record, payload = {})
        AuditRecorder.record(actor: current_user, action: action, record: record, payload: payload)
      end

      def compensation_params
        params.permit(:level, *CompensationRecord::ATTR_KEYS)
      end
    end
  end
end
