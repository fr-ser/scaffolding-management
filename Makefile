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

deploy-no-test: build
	@test -f .env.production || (echo "Production env for the frontend not found!" && exit 1)

	ssh -p $${PI_SSH_PORT} pi@$${PI_SSH_ADDRESS} 'mkdir -p /home/pi/apps/next-scaffolding'
	scp -P $${PI_SSH_PORT} -r ./backend/dist pi@$${PI_SSH_ADDRESS}:/home/pi/apps/next-scaffolding
	scp -P $${PI_SSH_PORT} ./backend/package*.json pi@$${PI_SSH_ADDRESS}:/home/pi/apps/next-scaffolding
	scp -P $${PI_SSH_PORT} -r ./deployment pi@$${PI_SSH_ADDRESS}:/home/pi/apps

	@echo "To replace the old version you should run 'make upgrade-on-raspberry' here or"
	@echo "run 'cd /home/pi/apps/deployment && make update' on the raspberry"

#: Deploy the application to the raspberry pi
deploy: build test-all deploy-no-test

#: update the application on the raspberry pi - causes downtime
upgrade-on-raspberry:
	ssh -p $${PI_SSH_PORT} pi@$${PI_SSH_ADDRESS} 'cd /home/pi/apps/deployment && make update'

#: connect to raspberry pi via ssh
ssh-raspberry:
	ssh -p $${PI_SSH_PORT} pi@$${PI_SSH_ADDRESS}
