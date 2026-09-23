# frozen_string_literal: true

# Capistrano: nginx → Puma. Only a developer who can SSH as deploy can run
# `bundle exec cap production deploy` from their machine. Secrets stay local
# and in /var/www/acme/shared — this file never uploads keys or passwords.

lock "~> 3.20.0"

# net-ssh dies on hashed/unknown host-key lines in ~/.ssh/known_hosts.
require "sshkit/backends/netssh"
SSHKit::Backend::Netssh::KnownHostsKeys.class_eval do
  alias_method :original_parse_key, :parse_key

  def parse_key(*args)
    original_parse_key(*args)
  rescue NotImplementedError, ArgumentError, TypeError
    nil
  end
end

set :application, "acme"
set :repo_url, "git@github.com:momwhocode/acme.git"
set :deploy_to, "/var/www/acme"
set :pty, false
set :keep_releases, 3

append :linked_files, "config/database.yml", "config/master.key"
append :linked_dirs, "log", "tmp/pids", "tmp/cache", "tmp/sockets", "vendor/bundle",
                     "public/system", "storage"

namespace :deploy do
  desc "Create shared directories. Linked secrets must already exist on the server."
  task :setup_shared do
    on roles(:app) do
      execute :mkdir, "-p",
              "#{shared_path}/config",
              "#{shared_path}/log",
              "#{shared_path}/tmp/pids",
              "#{shared_path}/tmp/cache",
              "#{shared_path}/tmp/sockets",
              "#{shared_path}/public/system",
              "#{shared_path}/storage",
              "#{shared_path}/vendor/bundle"

      missing = %w[config/database.yml config/master.key].reject { |rel|
        test("[ -f #{shared_path}/#{rel} ]")
      }
      unless missing.empty?
        raise "Put these on the server (do not commit them): #{missing.map { |rel| "#{shared_path}/#{rel}" }.join(", ")}"
      end
    end
  end

  namespace :assets do
    desc "Install JS deps, precompile, then drop node_modules"
    task :precompile do
      on roles(:app) do
        within release_path do
          with rails_env: :production do
            execute :npm, "ci", "--no-audit", "--no-fund"
            execute :bundle, "exec rails assets:precompile"
            execute :rm, "-rf", "node_modules"
          end
        end
      end
    end
  end

  desc "Restart Puma"
  task :restart_puma do
    on roles(:app) do
      execute :sudo, :systemctl, :restart, "acme-puma"
    end
  end
end

before "deploy:check:linked_files", "deploy:setup_shared"
before "deploy:migrate", "deploy:assets:precompile"
after "deploy:published", "deploy:restart_puma"
