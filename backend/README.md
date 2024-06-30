# Backend

## Development

Run `npm run db_seed` to get a local database with some data.

- If you want to update the seed you need to delete the current database first.
  The database should be at `backend/data.db`.

Run `npm run dev` to start the backend.

<!-- TODO: add unit tests -->
Run `npm run test` to run all tests.

### Authorization

The backend uses basic auth and the users and their passwords are defined in the environment file.
