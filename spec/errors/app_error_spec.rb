require "rails_helper"

RSpec.describe AppError do
  it "is the base for API domain errors" do
    expect([
      DirectoryQuery::Error,
      DirectoryImporter::Error,
      EmployeeOnboarder::Error,
      EmployeeOffboarder::Error,
      EmployeeRehirer::Error,
      CompensationAppender::Error,
      CompensationCorrector::Error,
      CompensationDestroyer::Error
    ]).to all(be < described_class)
  end

  it "is not used by seed and FX jobs" do
    expect([
      CurrencyNormalizer::Error,
      Fx::Sync::Error,
      Fx::FrankfurterSource::Error
    ]).to all(satisfy { |klass| !(klass < described_class) })
  end
end
