class AnalyticsAsker
  class Error < AppError; end

  MAX_QUESTION = 255

  def self.call(...)
    new(...).call
  end

  def initialize(question:, as_of: Date.current)
    @question = question.to_s.strip
    @as_of = as_of
  end

  def call
    raise Error, "question is required" if @question.blank?
    raise Error, "question is too long" if @question.length > MAX_QUESTION

    snapshot = AnalyticsQuery.call(as_of: @as_of)
    { question: @question, answer: answer_for(snapshot) }
  end

  private

  def answer_for(snapshot)
    text = @question.downcase
    return monthly_answer(snapshot) if text.match?(/month|payout|left|leaver/)
    return average_answer(snapshot) if text.match?(/average|mean/)
    return median_answer(snapshot) if text.match?(/median/)
    return mix_answer(snapshot, :by_department, :department, "department") if text.match?(/department/)
    return mix_answer(snapshot, :by_country, :country, "country") if text.match?(/country/)
    return mix_answer(snapshot, :by_type, :employment_type, "type") if text.match?(/type|contractor|intern/)
    return headcount_answer(snapshot) if text.match?(/headcount|how many|people/)
    return payroll_answer(snapshot) if text.match?(/payroll|total|annual|cost/)

    help_answer
  end

  def payroll_answer(snapshot)
    "Active annualised payroll is #{usd(snapshot[:annualised_usd])} USD."
  end

  def average_answer(snapshot)
    "Average active compensation is #{usd(snapshot[:average_usd])} USD annualised."
  end

  def median_answer(snapshot)
    "Median active compensation is #{usd(snapshot[:median_usd])} USD annualised."
  end

  def headcount_answer(snapshot)
    "There are #{snapshot[:headcount]} active employees on payroll."
  end

  def mix_answer(snapshot, key, label_key, noun)
    rows = snapshot.fetch(key)
    return "No active #{noun} mix is on file." if rows.empty?

    summary = rows.map { |row| "#{row[label_key]} #{row[:headcount]} (#{usd(row[:payroll_usd])} USD)" }.join(", ")
    "Active headcount by #{noun}: #{summary}."
  end

  def monthly_answer(snapshot)
    "Estimated payout this month is #{usd(snapshot[:monthly_usd])} USD, " \
      "including people who left during the month and excluding earlier leavers."
  end

  def help_answer
    "I can answer payroll, average or median pay, headcount mix by type, department or country, " \
      "and this month's payout including leavers."
  end

  def usd(value)
    ActiveSupport::NumberHelper.number_to_currency(value || 0, unit: "", precision: 0).strip
  end
end
