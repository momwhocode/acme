# Removes one pay row. The hire must keep at least one compensation record.

class CompensationDestroyer
  class Error < AppError; end

  def self.call(record:)
    raise Error.t(:cannot_delete_only_pay_record) if record.employee.compensation_records.count <= 1

    record.destroy!
  end
end
