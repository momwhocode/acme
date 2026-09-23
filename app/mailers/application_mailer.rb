# Rails mailer base. No product mailers yet.

class ApplicationMailer < ActionMailer::Base
  default from: "from@example.com"
  layout "mailer"
end
