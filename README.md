# ACME Salary Management

HR app for what ACME pays ~10,000 people across countries. It replaces the spreadsheets: hire, pay history, leave, rehire, import/export, and a Home snapshot of cost and mix — without exporting first.

One Rails app serves `/api/v1` JSON and the React UI. Product decisions live in [`REQUIREMENTS.docx`](REQUIREMENTS.docx).

**Persona:** one HR manager. Cookie session. No signup, no roles.

## What ships

- **Home** — as-of snapshot vs last month: annualised cost, headcount, median, contingent ratio, type donut, level bars, spend, onboarding / offboarding / contracts tracker. Local (INR compact) or USD.
- **Employee Directory** — paginated list; filters; search; show/hide columns; CSV import/export. URL + `localStorage` hold the session (no named saved views).
- **Profile** — modal over the directory. Shared fields with onboard/edit. Activity History. Correct pay on the timeline.
- **Pay** — annual or hourly on new writes. Effective-dated history. Daily/monthly still **display** on old rows.
- **Lifecycle** — Onboard, Edit Record, Start Offboarding, Rehire, Delete.

Not in product: payroll/payslips, pay bands, approvals, SSO, Docker/Kamal. See REQUIREMENTS §4.

## Setup

```sh
bin/setup
bin/dev
```

- App: http://127.0.0.1:3000 — `hr@acme.test` / `whiteaeroplane` (non-prod only)
- Health: http://127.0.0.1:3000/api/v1/health
- Swagger: http://127.0.0.1:3000/api-docs — `bin/rails rswag` regenerates the YAML; do not hand-edit it. Sign in via the session endpoint first so Try it out can reuse the cookie.
- Storybook: `npm run storybook` → http://localhost:6006 (April DS; not CI)

`bin/setup` runs `db:prepare` and `db:seed` (HR, FX matrix, 10k employees). Re-seed or import:

```sh
bin/rails db:seed
bin/rails "directory:seed[10000,force]"
bin/rails "directory:import[tmp/employees.csv]"
```

## CSV

**Import** (Employee Directory → Import, or `POST /api/v1/employees/import`, max 5 MB). Template: `/templates/acme-employees.csv`.

```
first_name,last_name,email,country,department,employment_type,status,level,job_title,started_on,left_on,base_amount,currency,pay_period,hours_per_week,effective_date,change_reason
```

`job_title` is a required **column**; cells may be blank. Repeat email for each pay change. Existing emails are upserted. Invalid rows fail the whole file. Import does not write FX.

**Export** is a display dump of the current filters — not that template. Headers: Name, Email, Department, Country, Type, Status, Level, Job Title, Pay (annualised USD), Started, End Date, Manager. Remap before re-importing.

## API (short)

Envelope: success `{ "data", "meta?" }`, error `{ "error": { "code", "message", "details?" } }`. CSRF is `meta.csrf_token` after `POST /api/v1/session`.

| Action | Request |
| --- | --- |
| Directory | `GET /api/v1/employees?page=1&per_page=25&status=active&level=L2&q=ada` |
| Onboard | `POST /api/v1/employees` with nested `compensation` (`pay_period`: `annual` or `hourly`) |
| Raise | `POST /api/v1/employees/:id/compensation_records` (optional `level`) |
| Offboard | `PATCH /api/v1/employees/:id/offboard` with `left_on` — UI: Start Offboarding |
| Rehire / delete | `PATCH …/rehire` · `DELETE /api/v1/employees/:id` |
| Import / export | `POST …/import` (`file`) · `GET …/export` |

## Credentials

`bin/rails credentials:edit` — not ENV. Production must set `hr.password` before the first seed.

```yaml
hr:
  email: hr@acme.test
  password:           # required in production
fx:
  source: seed        # or live (Frankfurter / ECB)
database:
  password:
api:
  url:                # empty = same-origin /api
force_ssl: false      # true after nginx has a certificate
```

FX lives in `exchange_rates`. Seed quotes are the current snapshot. Do not edit `SEED_RATES` when the market moves — append a dated row:

```sh
bin/rails fx:sync
bin/rails "fx:sync[2024-06-01]"
```

Lookups use the latest quote on or before `as_of`. Optional host cron (`config/deploy/crontab` — Capistrano does not install it):

```
15 6 * * * deploy /bin/bash -lc 'cd /var/www/acme/current && /usr/local/bin/bundle exec rails fx:sync'
```

## Test and lint

```sh
bin/rails db:create db:schema:load   # CI path — not db:prepare (that seeds)
bundle exec rspec
bin/rubocop
bin/brakeman --no-pager
npm test
npm run lint
```

GitHub Actions on `main` push/PR: lint + specs (`.github/workflows/ci.yml`). No deploy job.

## Deploy

Capistrano → nginx → Puma on `15.252.167.21` (`deploy` user). GitHub never deploys. Secrets stay on the laptop and in `/var/www/acme/shared`.

First box (root): `sudo bash config/deploy/bootstrap.sh`

Then copy gitignored secrets:

```sh
scp config/master.key deploy@15.252.167.21:/var/www/acme/shared/config/master.key
scp config/deploy/templates/database.yml deploy@15.252.167.21:/var/www/acme/shared/config/database.yml
# set the database password in that server file; chmod 600 both
```

Install nginx (`config/nginx/acme.conf`), systemd (`config/systemd/acme-puma.service`), and cron by hand. Then from a machine that can SSH as `deploy`:

```sh
bundle exec cap production deploy
```
