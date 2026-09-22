# ACME Salary Management

A web app for what ACME pays its 10,000 employees across multiple countries. It replaces the current spreadsheets and lets the HR manager answer questions about how the org pays people without exporting anything.

One Rails application serves both `/api/*` JSON and the compiled React UI — one codebase, one deploy, one URL.

## Product

**Persona:** HR manager (single org, ACME).

The app is the source of truth for compensation: who is paid, how much, in which currency and employment type, and how that has changed over time. Analytics and an AI chat answer payroll questions in place.

## Scope

### In scope

1. **Employee directory** — Server-paginated, searchable, and filterable by country, department, employment type, and status. Built to stay fast at 10k rows.
2. **Employee profile** — Current compensation plus a full effective-dated change history timeline.
3. **Compensation management** — Add or edit an employee; record a comp change (raise, promotion) as a new effective-dated record; onboard hires; mark leavers.
4. **Multi-currency, multi-type engine** — Supports full-time, part-time, contractor, freelancer, and intern. Every record is normalised to an annualised amount and to a base reporting currency (USD) for cross-country comparison.
5. **Analytics dashboard** — Total annualised payroll cost (USD), headcount mix, average and median compensation, breakdowns by country, department, and type. Currency toggle (local ↔ USD). An AI chat answers questions in plain language — for example, "what is the total payout this month allowing for employees who have left."
6. **CSV import** — Bring old records in from the spreadsheets the HR team is migrating off.
7. **Seed data** — 10,000 realistic employees across countries, currencies, and types, so the app can be demonstrated at full scale.
8. **HR login** — One HR manager account. Cookie session, no signup, no RBAC.

### Out of scope

| Left out | Why |
| --- | --- |
| Payroll runs, payslips, tax, statutory deductions, disbursement | The brief is to manage salary data and answer questions, not to pay people. Payroll is a separate, compliance-heavy product. |
| Benefits, equity, expenses, time and attendance | Adjacent HRIS modules; none are needed to answer "how do we pay people." |
| Approval workflows and notifications | Orthogonal to the core data model; parked as a clear extension point. |
| Multi-tenancy | Single org (ACME). Avoids premature abstraction. |
| Full RBAC | One persona (HR manager). Access control is a first-class production concern; a real build would gate salary visibility by role. |
| Live FX in tests / default path | Seeds stay deterministic. `FX_SOURCE=live` is opt-in Frankfurter/ECB; CI and specs never hit the network. |
| Pay bands and compa-ratio | High-value pay-equity feature, but a stretch. The data model leaves room (level field) so it is additive later. |

## Tech stack

| Layer | Choice |
| --- | --- |
| Backend | Ruby on Rails 7.2 (unified app: HTML + `/api/v1` JSON) |
| API docs | OpenAPI 3 + Swagger UI (`/api-docs`, rswag) |
| Database | PostgreSQL (`pg_trgm` for directory search) |
| Pagination | Pagy (server-side, counted) |
| Frontend | React via Vite (`vite_rails`) |
| Components | April System, documented in Storybook |
| Testing | RSpec + FactoryBot |
| Lint / security | RuboCop (Rails, RSpec, FactoryBot, Performance), Brakeman |
| Deployment | AWS, Nginx reverse proxy, Capistrano. CI runs quality checks and specs on every push and pull request; deploy follows a successful merge. |

## Setup

```sh
bin/setup
bin/dev
```

`bin/setup` seeds the FX matrix and 10,000 employees (`insert_all`). Re-run or import a spreadsheet:

```sh
bin/rails db:seed
FORCE=1 COUNT=10000 bin/rails directory:seed
bin/rails directory:import FILE=tmp/employees.csv
```

CSV columns: `first_name,last_name,email,country,department,employment_type,status,level,started_on,left_on,base_amount,currency,pay_period,hours_per_week,effective_date,change_reason`. Repeat email for each compensation change. Invalid rows fail the import; existing emails are skipped. Import does not write FX rates.

- App: http://localhost:3000 — sign in as `hr@acme.test` / `whiteaeroplane`
- API: http://localhost:3000/api/v1/health
- Swagger: http://localhost:3000/api-docs — OpenAPI for every `/api/v1` path and response. Refresh with `bin/rails rswag`. Use the session endpoint first so Try it out can reuse the cookie.
- Envelope: success `{ "data": ..., "meta": ... }`, error `{ "error": { "code", "message", "details?" } }`. Session CSRF is `meta.csrf_token`. Directory paging is `meta.pagination`.
- Directory: `GET /api/v1/employees?page=1&per_page=25&country=GB&department=engineering&type=full-time&status=active&q=ada` (HR session)
- Onboard: `POST /api/v1/employees` with nested `compensation`
- Raise / promotion: `POST /api/v1/employees/:id/compensation_records` (optional `level`)
- Offboard: `PATCH /api/v1/employees/:id/offboard` with `left_on`
- Storybook: `npm run storybook` → http://localhost:6006

Production must set `HR_PASSWORD` (and optionally `HR_EMAIL`) before the first seed. The default password is development/test only.

FX rates live in `exchange_rates`. The seed catalog is the current snapshot (`Date.current`). Do not edit `SEED_RATES` when the market moves — append a dated snapshot:

```sh
bin/rails fx:sync                 # replay seed catalog
FX_SOURCE=live bin/rails fx:sync  # Frankfurter / ECB
FX_ON=2024-06-01 bin/rails fx:sync
```

`CurrencyNormalizer` uses the latest row on or before `as_of`. Host cron (after the ECB publish, 06:15 UTC):

```
15 6 * * * cd /path/to/acme && FX_SOURCE=live bin/rails fx:sync
```

## Test and lint

```sh
bundle exec rspec
bin/rubocop
npm test
npm run lint
```
