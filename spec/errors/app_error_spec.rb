require "rails_helper"

RSpec.describe AppError do
  it "is the base for API domain errors" do
    expect([
      DirectoryQuery::Error,
      EmployeeOnboarder::Error,
      EmployeeOffboarder::Error,
      CompensationAppender::Error
    ]).to all(be < described_class)
  end

  it "is not used by seed and FX jobs" do
    expect([
      DirectoryImporter::Error,
      CurrencyNormalizer::Error,
      Fx::Sync::Error,
      Fx::FrankfurterSource::Error
    ]).to all(satisfy { |klass| !(klass < described_class) })
  end
end
