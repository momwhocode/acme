# Current FX snapshot for Date.current. Safe to re-run.
# To append today's market rates without editing SEED_RATES:
#   FX_SOURCE=live bin/rails fx:sync
ExchangeRate.seed!
