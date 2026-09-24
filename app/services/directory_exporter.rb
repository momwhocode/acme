require "csv"

# CSV of the current directory query — same filters as the listing, no pagination.

class DirectoryExporter
  HEADERS = %w[
    Name Email Department Country Type Status Level Job\ Title Pay Started End\ Date Manager
  ].freeze

  def self.call(employees)
    new(employees).call
  end

  def initialize(employees)
    @employees = employees
  end

  def call
    rows = DirectoryPayload.employees(@employees)
    CSV.generate do |csv|
      csv << HEADERS
      rows.each do |employee|
        csv << [
          "#{employee[:first_name]} #{employee[:last_name]}".strip,
          employee[:email],
          employee[:department],
          employee[:country],
          employee[:employment_type],
          employee[:status],
          employee[:level],
          employee[:job_title],
          employee.dig(:current_compensation, :annualised_usd),
          employee[:started_on],
          employee[:left_on],
          employee[:manager_name]
        ]
      end
    end
  end
end
