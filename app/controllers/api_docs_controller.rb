class ApiDocsController < ActionController::Base
  layout false

  def index
  end

  def openapi
    send_file Rails.root.join("swagger/v1/swagger.yaml"),
              type: "application/yaml",
              disposition: "inline"
  end
end
