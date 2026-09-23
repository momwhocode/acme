# frozen_string_literal: true

set :stage, :production
set :branch, "main"

server "15.252.167.21", user: "deploy", roles: %w[web app db]
set :rails_env, :production
set :ssh_options, {
  forward_agent: true,
  auth_methods: %w[publickey]
}

set :bundle_gemfile, -> { release_path.join("Gemfile") }
set :bundle_dir, -> { shared_path.join("vendor/bundle") }
set :bundle_flags, ""
set :bundle_without, %w[development test].join(" ")
set :bundle_binstubs, nil

namespace :bundler do
  task :config_deployment do
    on roles(fetch(:bundle_roles)) do
      within release_path do
        execute :bundle, "config set --local deployment true"
        execute :bundle, "config set --local path #{fetch(:bundle_dir)}"
      end
    end
  end
end

before "bundler:install", "bundler:config_deployment"

fetch(:default_env).merge!(
  rails_env: :production,
  PATH: "/usr/local/bin:/usr/bin:/bin"
)

# Optional laptop-only SSH key path. Never commit this file.
local = File.expand_path("local.rb", __dir__)
load local if File.exist?(local)
