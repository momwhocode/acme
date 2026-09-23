require "securerandom"

# High-volume demo data. Uses insert_all so 10k employees stay fast.
class DirectorySeeder
  BATCH_SIZE = 1_000
  DEFAULT_COUNT = 10_000

  COUNTRY_CURRENCY = {
    "US" => "USD",
    "GB" => "GBP",
    "DE" => "EUR",
    "FR" => "EUR",
    "IE" => "EUR",
    "NL" => "EUR",
    "IN" => "INR"
  }.freeze

  COUNTRIES = COUNTRY_CURRENCY.keys.freeze
  DEPARTMENTS = %w[engineering product design sales marketing finance people operations legal support].freeze
  LEVELS = %w[IC1 IC2 IC3 IC4 IC5 IC6 M1 M2 M3].freeze
  CHANGE_REASONS = %w[raise promotion adjustment].freeze

  def self.call(...)
    new(...).call
  end

  def initialize(count: DEFAULT_COUNT, force: false, rng: Random.new)
    @count = [ count.to_i, 0 ].max
    @force = force
    @rng = rng
    @now = Time.current
    @today = Date.current
  end

  def call
    previous_random = Faker::Config.random
    Faker::Config.random = @rng
    ExchangeRate.seed!
    reset! if @force
    return already_seeded_result if Employee.exists?

    employees, compensations = generate
    persist(employees, compensations)
    { employees: employees.size, compensation_records: compensations.size }
  ensure
    Faker::Config.random = previous_random
  end

  private

  def already_seeded_result
    { employees: Employee.count, compensation_records: CompensationRecord.count, skipped: true }
  end

  def reset!
    Employee.delete_all
  end

  def generate
    employees = []
    compensations = []

    @count.times do |index|
      employee = employee_row(index)
      employees << employee
      compensations.concat(compensation_rows(employee, index))
    end

    [ employees, compensations ]
  end

  def persist(employees, compensations)
    ActiveRecord::Base.transaction do
      employees.each_slice(BATCH_SIZE) { |batch| Employee.insert_all!(batch) }
      compensations.each_slice(BATCH_SIZE) { |batch| CompensationRecord.insert_all!(batch) }
    end
  end

  def employee_row(index)
    first = Faker::Name.first_name
    last = Faker::Name.last_name
    country = COUNTRIES.sample(random: @rng)
    employment_type = employment_type_for(index)
    started_on = start_date_for
    status, left_on = tenure_for(started_on, index)

    {
      id: SecureRandom.uuid,
      first_name: first,
      last_name: last,
      email: "#{slug(first)}.#{slug(last)}.#{index}@acme.test",
      country: country,
      department: DEPARTMENTS.sample(random: @rng),
      employment_type: employment_type,
      status: status,
      level: level_for(employment_type),
      started_on: started_on,
      left_on: left_on,
      created_at: @now,
      updated_at: @now
    }
  end

  def compensation_rows(employee, index)
    currency = COUNTRY_CURRENCY.fetch(employee[:country])
    pay_period = pay_period_for(employee[:employment_type], index)
    hours = hours_for(pay_period, employee[:employment_type])
    last_day = [ employee[:left_on], @today ].compact.min
    dates = history_dates(employee[:started_on], last_day)

    dates.each_with_index.map do |date, step|
      {
        id: SecureRandom.uuid,
        employee_id: employee[:id],
        base_amount: amount_for(pay_period, hours, currency, employee[:level], step),
        currency: currency,
        pay_period: pay_period,
        hours_per_week: hours,
        effective_date: date,
        change_reason: step.zero? ? "hire" : CHANGE_REASONS.sample(random: @rng),
        created_at: @now,
        updated_at: @now
      }
    end
  end

  def employment_type_for(index)
    case index % 20
    when 0 then "intern"
    when 1, 2 then "freelancer"
    when 3, 4 then "contractor"
    when 5, 6 then "part-time"
    else "full-time"
    end
  end

  def tenure_for(started_on, index)
    if index % 7 == 0
      [ "left", Faker::Date.between(from: started_on, to: @today) ]
    elsif index % 23 == 0
      [ "active", Faker::Date.forward(days: 180) ]
    else
      [ "active", nil ]
    end
  end

  def start_date_for
    Faker::Date.between(from: Date.new(2016, 1, 1), to: @today - 30)
  end

  def level_for(employment_type)
    return if %w[intern contractor freelancer].include?(employment_type)

    LEVELS.sample(random: @rng)
  end

  def pay_period_for(employment_type, key)
    case employment_type
    when "contractor" then "daily"
    when "intern" then "monthly"
    when "freelancer" then key.even? ? "hourly" : "daily"
    when "part-time" then key.even? ? "hourly" : "monthly"
    else key % 10 == 0 ? "monthly" : "annual"
    end
  end

  def hours_for(pay_period, employment_type)
    return unless pay_period == "hourly"

    employment_type == "part-time" ? 24 : 32
  end

  def history_dates(started_on, last_day)
    dates = [ started_on ]
    cursor = started_on.next_year
    extras = @rng.rand(4)
    extras.times do
      break if cursor > last_day

      dates << cursor
      cursor = cursor.next_year
    end
    dates
  end

  def amount_for(pay_period, hours, currency, level, step)
    annual_usd = (45_000 + (LEVELS.index(level) || 0) * 12_000) * (1 + (step * 0.08))
    annual_local = (annual_usd / usd_rate(currency)).round(2)

    case pay_period
    when "monthly" then (annual_local / 12).round(2)
    when "daily" then (annual_local / CurrencyNormalizer::WORKING_DAYS_PER_YEAR).round(2)
    when "hourly" then (annual_local / (hours * CurrencyNormalizer::WEEKS_PER_YEAR)).round(2)
    else annual_local
    end
  end

  def usd_rate(currency)
    row = ExchangeRate::SEED_RATES.find { |quote| quote[:from_currency] == currency }
    BigDecimal(row.fetch(:rate))
  end

  def slug(name)
    name.to_s.downcase.gsub(/[^a-z0-9]+/, "").presence || "employee"
  end
end
