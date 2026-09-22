# FX matrix + 10k employees. Idempotent unless FORCE=1.
#   FORCE=1 bin/rails directory:seed
#   bin/rails directory:import FILE=tmp/employees.csv
DirectorySeeder.call
