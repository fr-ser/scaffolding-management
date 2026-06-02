update:
	$(MAKE) prepare-next
	$(MAKE) stop-production
	$(MAKE) copy-production-state
	$(MAKE) activate-next
	pm2 start pm2.config.js
	pm2 save

update-with-migrations:
	$(MAKE) prepare-next
	$(MAKE) stop-production
	$(MAKE) backup-database
	$(MAKE) copy-production-state
	$(MAKE) activate-next
	$(MAKE) migrate
	pm2 start pm2.config.js
	pm2 save

prepare-next:
	cp -r ~/apps/scaffolding/node_modules ~/apps/next-scaffolding
	@# copy over the real images
	cp  ~/apps/scaffolding/dist/static/*.png ~/apps/next-scaffolding/dist/static
	cd ~/apps/next-scaffolding && npm install --omit=dev --no-audit

stop-production:
	pm2 kill

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
	cd ~/apps/scaffolding && CONFIG_PATH=.env ./node_modules/.bin/typeorm migration:run -d ./dist/src/db/dataSource.js

migrate-uat:
	cd ~/apps/uat-scaffolding && CONFIG_PATH=.env ./node_modules/.bin/typeorm migration:run -d ./dist/src/db/dataSource.js

backup-database:
	cd ~/apps/scaffolding && DB_PATH=$$(node -e "require('dotenv').config({ path: '.env' }); process.stdout.write(process.env.DB_PATH || '')") && test -n "$$DB_PATH" && cp "$$DB_PATH" "$$DB_PATH.before-migration-$$(date +%Y%m%d%H%M%S)"

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

	pm2 kill
	pm2 start pm2.config.js
	pm2 save
