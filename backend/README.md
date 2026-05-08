# Backend

## Development

Run `make db-seed` to get a local database with some data.
Run `make db-seed-overwrite` to reseed and overwrite existing data.

Run `npm run dev` to start the backend.

Run `npm run test` to run all tests.

### Authorization

The backend uses basic auth and the users and their passwords are defined in the environment file.

## Tasks

The backend contains a "main" service, which is the backend server.

However, there are also "tasks", which are executed as cron jobs in this repository.

### Configuration variables

The required configuration is provided by the `local.env` file.

If, however, for development purposes you want to use different ones (i.e. to send a real email when working on the email task), you can use environment variables.

A very nice tool for that is [direnv](https://direnv.net/).

## PDF Test Snapshots

Run `make generate-pdf-snapshots` to regenerate the PDF snapshots used by backend tests.

## One-off Scripts

To run a one-off TypeScript script in the backend context (e.g. a data fix or manual migration):

```bash
cd backend && npm run build && CONFIG_PATH=../.env.development npx ts-node -r tsconfig-paths/register scripts/your-script.ts
```

## Migrations

In order to create migrations use the following command:
`CONFIG_PATH=local.env NODE_OPTIONS='-r tsconfig-paths/register' npx typeorm-ts-node-commonjs migration:generate ./src/migrations/update-post-table -d ./src/db/dataSource.ts`.

In order to run migrations use:
`CONFIG_PATH=local.env NODE_OPTIONS='-r tsconfig-paths/register' npx typeorm-ts-node-commonjs migration:run -d ./src/db/dataSource.ts`.
