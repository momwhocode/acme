module RequestAuth
  def sign_in_hr(password: "password")
    user = create(:user, password: password)
    post "/api/v1/session", params: { email: user.email, password: password }, as: :json
    user
  end
end

RSpec.configure do |config|
  config.include RequestAuth, type: :request
end
