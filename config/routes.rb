Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  get "api-docs", to: "api_docs#index", as: :api_docs
  get "api-docs/index.html", to: "api_docs#index"
  get "api-docs/v1/swagger.yaml", to: "api_docs#openapi", as: :api_docs_openapi

  namespace :api do
    namespace :v1 do
      get "health", to: "health#show"
      resource :session, only: %i[show create destroy]
      resources :employees, only: %i[index create] do
        resources :compensation_records, only: %i[create]
        member { patch :offboard }
      end
    end
  end

  root "pages#home"
  get "*path", to: "pages#home", constraints: ->(req) {
    !req.path.start_with?("/api/", "/api-docs", "/up", "/rails")
  }
end
