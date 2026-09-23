# HR login, FX matrix, then 10k employees. Idempotent unless directory:seed[count,force].
#   HR account: credentials hr.email / hr.password (defaults: hr@acme.test / whiteaeroplane)
#   bin/rails "directory:seed[10000,force]"
#   bin/rails "directory:import[tmp/employees.csv]"
User.seed_hr!
ExchangeRate.seed!
PayBand.seed!
DirectorySeeder.call
