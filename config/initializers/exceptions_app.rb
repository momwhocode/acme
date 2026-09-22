Rails.application.config.exceptions_app = lambda do |env|
  original = env["action_dispatch.original_path"].to_s
  if original.start_with?("/api")
    Api::V1::ErrorsController.action(:show).call(env)
  else
    ActionDispatch::PublicExceptions.new(Rails.public_path).call(env)
  end
end
