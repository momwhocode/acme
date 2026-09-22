module ApiEnvelope
  def api_data
    response.parsed_body.fetch("data")
  end

  def api_meta
    response.parsed_body.fetch("meta")
  end

  def api_error
    response.parsed_body.fetch("error")
  end
end

RSpec.configure do |config|
  config.include ApiEnvelope, type: :request
end
