# Scaffolding Management

This app should provide basic functionalities to manage a very specific scaffolding business.
The functionality basically includes:

- client management
- invoice management

## Development

For most development tasks the `Makefile` can be used. You can run `make` to see the available commands.

### Requirements

The following tools are required to use the development setup

- bash like terminal (Windows is not supported as a development environment - try using WSL if you must use Windows)
- make
- nodejs (use a version manager like [asdf](https://asdf-vm.com/) or manually conform to the version in `.tool-versions`)
- npm

### Setup

After the tools above are installed you can run `make install` to install all dependencies.

Then run `make start-backend` and `make start-frontend` in different terminals.
Now you can visit the URL shown in the frontend command to visit the page.

For the credentials see the backend README.

### Testing

The backend and frontend have independent tests.

In the overall repo you can also run e2e and unit tests, though.

Run `make test-all` to run all available tests.
