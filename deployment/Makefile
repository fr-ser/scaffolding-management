.PHONY: *

update: prepare-next stop-production copy-production-state activate-next
	pm2 start pm2.config.js
	pm2 save

update-with-migrations: prepare-next stop-production backup-database copy-production-state activate-next migrate
	pm2 start pm2.config.js
	pm2 save

prepare-next:
	mkdir -p ~/apps/next-scaffolding/node_modules
	cp -a ~/apps/scaffolding/node_modules/. ~/apps/next-scaffolding/node_modules
	@# copy over the real images
	cp  ~/apps/scaffolding/dist/static/*.png ~/apps/next-scaffolding/dist/static
	cd ~/apps/next-scaffolding && npm install --omit=dev --no-audit

stop-production:
	pm2 delete scaffolding || true

copy-production-state:
	@# copy over the production configuration
	cp -r ~/apps/scaffolding/.env ~/apps/next-scaffolding
	@# copy over the database
	cp  ~/apps/scaffolding/*.db ~/apps/next-scaffolding

activate-next:
	rm -rf ~/apps/backup-scaffolding
	mv ~/apps/scaffolding ~/apps/backup-scaffolding
	mv ~/apps/next-scaffolding ~/apps/scaffolding

update-uat:
	cd ~/apps/uat-scaffolding && npm install --omit=dev --no-audit
	pm2 restart uat-scaffolding || pm2 start pm2.uat.config.js
	pm2 save

migrate:
	cd ~/apps/scaffolding && CONFIG_PATH=.env ./node_modules/.bin/typeorm migration:run --dataSource ./dist/src/db/dataSource.js

migrate-uat:
	cd ~/apps/uat-scaffolding && CONFIG_PATH=.env ./node_modules/.bin/typeorm migration:run --dataSource ./dist/src/db/dataSource.js

backup-database:
	cd ~/apps/scaffolding && DB_PATH=$$(node -e "const fs = require('fs'); const dotenv = require('dotenv'); const parsed = dotenv.parse(fs.readFileSync('.env')); process.stdout.write(parsed.DB_PATH || '')") && test -n "$$DB_PATH" && cp "$$DB_PATH" "$$DB_PATH.before-migration-$$(date +%Y%m%d%H%M%S)"

start-uat:
	pm2 start pm2.uat.config.js
	pm2 save

stop-uat:
	pm2 stop uat-scaffolding
	pm2 save

revert:
	rm -rf ~/apps/next-scaffolding
	mv ~/apps/scaffolding ~/apps/next-scaffolding
	mv ~/apps/backup-scaffolding ~/apps/scaffolding

	pm2 delete scaffolding || true
	pm2 start pm2.config.js
	pm2 save
