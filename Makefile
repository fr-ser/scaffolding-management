# Top-level Makefile
.PHONY: *

help: ## Show help
	@echo "Available commands:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-25s\033[0m %s\n", $$1, $$2}'

install-all: ## install all the dependencies for both BE and FE
	npm install
	cd backend && npm install
	cd frontend && npm install

start-be: ## start BE locally
	cd backend && npm run dev

start-fe: ## start FE locally
	cd frontend && npm run dev

build-all: ## build backend and frontend for production
	cd backend && rm -rf dist && npm run build
	cd frontend && npm run build -- $(BUILD_ARGS)
	rm -rf backend/dist/static
	cp -r frontend/dist backend/dist/static

lint-all: ## run linting across root, backend, and frontend
	npm run lint
	cd backend && npm run lint
	cd frontend && npm run lint

format-all: ## format files across root, backend, and frontend
	npm run format
	cd backend && npm run format
	cd frontend && npm run format

test-all: ## run all tests across all levels
	cd backend && npm run test
	cd frontend && npm run test
	npm run test
	npm run test:e2e

test-e2e-dev: ## run playwright UI tests against the running development instance
	PLAYWRIGHT_BACKEND_PORT=3001 npm run test:e2e -- --ui


deploy-ssh: ## connect to deploy target via ssh
	ssh -p $${SSH_PORT} $${SSH_USER}@$${SSH_ADDRESS}

deploy-database-to-local: ## copy the production database to the local machine
	scp -P $${SSH_PORT} $${SSH_USER}@$${SSH_ADDRESS}:~/apps/scaffolding/production.db ./production.db

deploy-database-to-remote: ## copy the local database to the deployment machine
	scp -P $${SSH_PORT} ./production.db $${SSH_USER}@$${SSH_ADDRESS}:~/apps/scaffolding/production.copy.db

# Internal deployment steps
deploy-build-no-test: build-all
	@test -f .env.production || (echo "Production env for the frontend not found!" && exit 1)
	ssh -p $${SSH_PORT} $${SSH_USER}@$${SSH_ADDRESS} 'mkdir -p ~/apps/next-scaffolding'
	scp -P $${SSH_PORT} -r ./backend/dist $${SSH_USER}@$${SSH_ADDRESS}:~/apps/next-scaffolding
	scp -P $${SSH_PORT} ./backend/package*.json $${SSH_USER}@$${SSH_ADDRESS}:~/apps/next-scaffolding
	scp -P $${SSH_PORT} -r ./deployment $${SSH_USER}@$${SSH_ADDRESS}:~/apps
	@echo "To replace the old version you should run 'make deploy-upgrade' here or"
	@echo "run 'cd ~/apps/deployment && make update' on the deployment target"

deploy-build: test-all deploy-build-no-test ## Build, test, and upload to production machine

deploy-upgrade: ## update the application on the deployment target - causes downtime
	ssh -p $${SSH_PORT} $${SSH_USER}@$${SSH_ADDRESS} 'cd ~/apps/deployment && make update'

uat-deploy: uat-build-no-test ## Build and upload to UAT machine
	ssh -p $${SSH_PORT} $${SSH_USER}@$${SSH_ADDRESS} 'mkdir -p ~/apps/uat-scaffolding'
	scp -P $${SSH_PORT} -r ./backend/dist $${SSH_USER}@$${SSH_ADDRESS}:~/apps/uat-scaffolding
	scp -P $${SSH_PORT} ./backend/package*.json $${SSH_USER}@$${SSH_ADDRESS}:~/apps/uat-scaffolding
	scp -P $${SSH_PORT} -r ./deployment $${SSH_USER}@$${SSH_ADDRESS}:~/apps
	ssh -p $${SSH_PORT} $${SSH_USER}@$${SSH_ADDRESS} 'cd ~/apps/deployment && make update-uat'

uat-build-no-test:
	$(MAKE) build-all BUILD_ARGS="--mode development"
	@test -f .env.development || (echo "Development env for the UAT not found!" && exit 1)

uat-start: ## Start UAT on the server
	ssh -p $${SSH_PORT} $${SSH_USER}@$${SSH_ADDRESS} 'cd ~/apps/deployment && make start-uat'

uat-stop: ## Stop UAT on the server
	ssh -p $${SSH_PORT} $${SSH_USER}@$${SSH_ADDRESS} 'cd ~/apps/deployment && make stop-uat'
