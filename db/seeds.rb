# HR login, FX matrix, then 10k employees. Idempotent unless FORCE=1.
#   HR_EMAIL / HR_PASSWORD for the manager account (defaults: hr@acme.test / whiteaeroplane)
#   FORCE=1 bin/rails directory:seed
#   bin/rails directory:import FILE=tmp/employees.csv
User.seed_hr!
DirectorySeeder.call
