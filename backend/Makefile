.PHONY: *

help: ## Show help
	@echo "Available commands:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-25s\033[0m %s\n", $$1, $$2}'

generate-pdf-snapshots: ## regenerate PDF test snapshots
	npm run build && CONFIG_PATH=../.env.development node ./dist/src/tests/pdf/generate-snapshot-pdfs.js

db-seed: ## seed the development database
	npm run build && CONFIG_PATH=../.env.development npx ts-node -r tsconfig-paths/register scripts/seed-local-data.ts

db-seed-overwrite: ## seed the development database, overwriting existing data
	npm run build && CONFIG_PATH=../.env.development npx ts-node -r tsconfig-paths/register scripts/seed-local-data.ts --overwrite

task-prepared-orders-email: ## run the prepared orders email task
	npm run build && CONFIG_PATH=../.env.development node ./dist/src/tasks/prepared_orders_mail/task.js

task-overdue-email: ## run the overdue email task
	npm run build && CONFIG_PATH=../.env.development node ./dist/src/tasks/overdue_email/task.js

task-backup: ## run the backup task
	npm run build && CONFIG_PATH=../.env.development node ./dist/src/tasks/backup/task.js
