# Ops entry points for demo data. `db:seed` calls the same services.

namespace :directory do
  desc "Seed the FX matrix and employees (bin/rails \"directory:seed[25,force]\")"
  task :seed, [ :count, :force ] => :environment do |_task, args|
    result = DirectorySeeder.call(
      count: (args[:count].presence || DirectorySeeder::DEFAULT_COUNT).to_i,
      force: args[:force].to_s.match?(/\A(1|force|true)\z/i)
    )
    suffix = result[:skipped] ? " (already present)" : ""
    puts "Seeded #{result[:employees]} employees and #{result[:compensation_records]} compensation records#{suffix}."
  end

  desc "Import employees and compensation from a CSV (bin/rails \"directory:import[tmp/employees.csv]\")"
  task :import, [ :file ] => :environment do |_task, args|
    result = DirectoryImporter.call(args[:file])
    puts "Imported #{result[:employees]} employees and #{result[:compensation_records]} compensation records."
  end
end
