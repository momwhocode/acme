# Acme

Rails 7.2 unified app: PostgreSQL API plus a React frontend bundled with Vite.

## Stack

- Ruby 3.3 / Rails 7.2
- PostgreSQL
- React via Vite (`vite_rails`)
- April System design system + Storybook
- RSpec, FactoryBot (`spec/factories`)
- RuboCop (Rails, RSpec, FactoryBot, Performance)

## Setup

```sh
bin/setup
bin/dev
```

- App: http://localhost:3000
- API: http://localhost:3000/api/v1/health
- Storybook: `npm run storybook` → http://localhost:6006

## Test and lint

```sh
bundle exec rspec
bin/rubocop
```
