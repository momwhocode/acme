require "rails_helper"
require "rake"

# Rake tasks have no class constant. This file covers lib/tasks/directory.rake.
# rubocop:disable RSpec/DescribeClass, RSpec/SpecFilePathFormat
RSpec.describe "directory rake tasks" do
  def restore_env(key, previous)
    if previous.nil?
      ENV.delete(key)
    else
      ENV[key] = previous
    end
  end

  describe "directory:seed" do
    before do
      Rails.application.load_tasks unless Rake::Task.task_defined?("directory:seed")
      Rake::Task["directory:seed"].reenable
    end

    it "passes COUNT and FORCE to the seeder" do
      previous_count = ENV["COUNT"]
      previous_force = ENV["FORCE"]
      ENV["COUNT"] = "25"
      ENV["FORCE"] = "1"
      allow(DirectorySeeder).to receive(:call).and_return(employees: 25, compensation_records: 40)

      expect { Rake::Task["directory:seed"].invoke }.to output(/Seeded 25 employees/).to_stdout
      expect(DirectorySeeder).to have_received(:call).with(count: 25, force: true)
    ensure
      restore_env("COUNT", previous_count)
      restore_env("FORCE", previous_force)
    end

    it "defaults COUNT and does not force" do
      previous_count = ENV["COUNT"]
      previous_force = ENV["FORCE"]
      ENV.delete("COUNT")
      ENV.delete("FORCE")
      allow(DirectorySeeder).to receive(:call).and_return(employees: 10, compensation_records: 12, skipped: true)

      expect { Rake::Task["directory:seed"].invoke }.to output(/already present/).to_stdout
      expect(DirectorySeeder).to have_received(:call).with(count: 10_000, force: false)
    ensure
      restore_env("COUNT", previous_count)
      restore_env("FORCE", previous_force)
    end
  end

  describe "directory:import" do
    before do
      Rails.application.load_tasks unless Rake::Task.task_defined?("directory:import")
      Rake::Task["directory:import"].reenable
    end

    it "passes FILE to the importer" do
      previous = ENV["FILE"]
      ENV["FILE"] = "tmp/employees.csv"
      allow(DirectoryImporter).to receive(:call).and_return(employees: 2, compensation_records: 3)

      expect { Rake::Task["directory:import"].invoke }.to output(/Imported 2 employees/).to_stdout
      expect(DirectoryImporter).to have_received(:call).with("tmp/employees.csv")
    ensure
      restore_env("FILE", previous)
    end
  end
end
# rubocop:enable RSpec/DescribeClass, RSpec/SpecFilePathFormat
