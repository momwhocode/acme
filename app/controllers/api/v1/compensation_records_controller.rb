module Api
  module V1
    # Append, correct, or delete effective-dated pay rows.
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
        # Destroy first so a last-row rejection never leaves an audit for a pay row that still exists.
        CompensationDestroyer.call(record: record)
        audit!("destroy", record, { employee_id: record.employee_id })
        render_success({})
      end

      private

      def compensation_record
        Employee.find(params[:employee_id]).compensation_records.find(params[:id])
      end

      def compensation_params
        params.permit(:level, *CompensationRecord::ATTR_KEYS)
      end
    end
  end
end
