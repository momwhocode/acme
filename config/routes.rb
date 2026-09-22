Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      get "health", to: "health#show"
      resource :session, only: %i[show create destroy]
    end
  end

  root "pages#home"
  get "*path", to: "pages#home", constraints: ->(req) { !req.path.start_with?("/api", "/up", "/rails") }
end
