class CompensationCorrector
  class Error < AppError; end

  def self.call(...)
    new(...).call
  end

  def initialize(record:, params:)
    @record = record
    @params = params.to_h.with_indifferent_access
  end

  def call
    attrs = @params.slice(*CompensationRecord::ATTR_KEYS)
    raise Error, "no compensation fields to update" if attrs.empty?

    @record.update!(attrs)
    @record
  end
end
