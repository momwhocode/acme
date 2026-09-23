# HR login, FX matrix, then 10k employees. Idempotent unless directory:seed[count,force].
#   HR account: credentials hr.email / hr.password (defaults: hr@acme.test / whiteaeroplane)
#   bin/rails "directory:seed[10000,force]"
#   bin/rails "directory:import[tmp/employees.csv]"
#
# `db:prepare` runs this when it creates a database. Specs build their own rows;
# seeding test would leak HR, pay bands, and 10k hires past transactional fixtures.
return if Rails.env.test?

User.seed_hr!
ExchangeRate.seed!
PayBand.seed!
DirectorySeeder.call
