# command to list available commands with a preceeding comment (requires "#:")
help: 
	@ echo '  Usage:'
	@ echo '    make <target>'
	@ echo ''
	@ echo '  Targets:'
	@grep -B1 -E "^[a-zA-Z0-9_-]+\:([^\=]|$$)" Makefile \
		| grep -v -- -- \
		| sed 'N;s/\n/###/' \
		| sed -n 's/^#: \(.*\)###\(.*\):.*/\2:###\1/p' \
		| column -t -s '###'

#: installs dependencies (backend and frontend)
install:
	cd backend && npm install
	cd frontend && npm install
	npm install

#: start the backend
start-backend:
	cd backend && npm run dev

#: start the frontend
start-frontend:
	cd frontend && npm run dev

#: build all assets for production mode
build:
	cd backend && rm -rf dist && npm run build
	cd frontend && npm run build

#: start application in production mode (both backend and frontend)
run-production:
	cd backend && STATIC_FILE_ROOT=dist/static CONFIG_PATH=local.env npm run run

#: run all tests
test-all:
	cd backend && npm run test
	cd frontend && npm run test
	npm run test
