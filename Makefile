# command to list available commands with a preceding comment (requires "#:")
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

#: start server in production mode (serving both the API and frontend)
run-server-production:
	cd backend && STATIC_FILE_ROOT=dist/static CONFIG_PATH=../.env.development npm run start:server

#: run all tests
test-all:
	cd backend && npm run test
	cd frontend && npm run test
	npm run test

deploy-build-no-test: build
	@test -f .env.production || (echo "Production env for the frontend not found!" && exit 1)

	ssh -p $${SSH_PORT} $${SSH_USER}@$${SSH_ADDRESS} 'mkdir -p ~/apps/next-scaffolding'
	scp -P $${SSH_PORT} -r ./backend/dist $${SSH_USER}@$${SSH_ADDRESS}:~/apps/next-scaffolding
	scp -P $${SSH_PORT} ./backend/package*.json $${SSH_USER}@$${SSH_ADDRESS}:~/apps/next-scaffolding
	scp -P $${SSH_PORT} -r ./deployment $${SSH_USER}@$${SSH_ADDRESS}:~/apps

	@echo "To replace the old version you should run 'make deploy-upgrade' here or"
	@echo "run 'cd ~/apps/deployment && make update' on the deployment target"

#: Deploy the application to the deployment target
deploy-build: build test-all deploy-build-no-test

#: update the application on the deployment target - causes downtime
deploy-upgrade:
	ssh -p $${SSH_PORT} $${SSH_USER}@$${SSH_ADDRESS} 'cd ~/apps/deployment && make update'

#: connect to deploy target via ssh
deploy-ssh:
	ssh -p $${SSH_PORT} $${SSH_USER}@$${SSH_ADDRESS}

#: copy the production database to the local machine
scp-database-to-local:
	scp -P $${SSH_PORT} $${SSH_USER}@$${SSH_ADDRESS}:~/apps/scaffolding/production.db ./production.db

#: copy the local database to the deployment machine
scp-database-to-deploy:
	scp -P $${SSH_PORT} ./production.db $${SSH_USER}@$${SSH_ADDRESS}:~/apps/scaffolding/production.copy.db
