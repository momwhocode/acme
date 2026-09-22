namespace :directory do
  desc "Seed the FX matrix and 10k employees (COUNT, FORCE=1)"
  task seed: :environment do
    result = DirectorySeeder.call(
      count: ENV.fetch("COUNT", DirectorySeeder::DEFAULT_COUNT).to_i,
      force: ENV["FORCE"] == "1"
    )
    suffix = result[:skipped] ? " (already present)" : ""
    puts "Seeded #{result[:employees]} employees and #{result[:compensation_records]} compensation records#{suffix}."
  end

  desc "Import employees and compensation from a CSV (FILE=path/to.csv)"
  task import: :environment do
    result = DirectoryImporter.call(ENV["FILE"])
    puts "Imported #{result[:employees]} employees and #{result[:compensation_records]} compensation records."
  end
end
