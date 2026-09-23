# Removes one pay row. The hire must keep at least one compensation record.

class CompensationDestroyer
  class Error < AppError; end

  def self.call(record:)
    raise Error, "cannot delete the only pay record" if record.employee.compensation_records.count <= 1

    record.destroy!
  end
end
