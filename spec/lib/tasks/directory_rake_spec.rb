require "rails_helper"
require "rake"

# Rake tasks have no class constant. This file covers lib/tasks/directory.rake.
# rubocop:disable RSpec/DescribeClass, RSpec/SpecFilePathFormat
RSpec.describe "directory rake tasks" do
  describe "directory:seed" do
    before do
      Rails.application.load_tasks unless Rake::Task.task_defined?("directory:seed")
      Rake::Task["directory:seed"].reenable
    end

    it "passes count and force arguments to the seeder" do
      allow(DirectorySeeder).to receive(:call).and_return(employees: 25, compensation_records: 40)

      expect { Rake::Task["directory:seed"].invoke("25", "force") }.to output(/Seeded 25 employees/).to_stdout
      expect(DirectorySeeder).to have_received(:call).with(count: 25, force: true)
    end

    it "defaults count and does not force" do
      allow(DirectorySeeder).to receive(:call).and_return(employees: 10, compensation_records: 12, skipped: true)

      expect { Rake::Task["directory:seed"].invoke }.to output(/already present/).to_stdout
      expect(DirectorySeeder).to have_received(:call).with(count: 10_000, force: false)
    end
  end

  describe "directory:import" do
    before do
      Rails.application.load_tasks unless Rake::Task.task_defined?("directory:import")
      Rake::Task["directory:import"].reenable
    end

    it "passes the file argument to the importer" do
      allow(DirectoryImporter).to receive(:call).and_return(employees: 2, compensation_records: 3)

      expect { Rake::Task["directory:import"].invoke("tmp/employees.csv") }.to output(/Imported 2 employees/).to_stdout
      expect(DirectoryImporter).to have_received(:call).with("tmp/employees.csv")
    end
  end
end
# rubocop:enable RSpec/DescribeClass, RSpec/SpecFilePathFormat
