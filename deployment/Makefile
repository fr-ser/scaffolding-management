update:
	cp -r ~/apps/scaffolding/node_modules ~/apps/next-scaffolding
	@# copy over the production configuration
	cp  ~/apps/scaffolding/*.db ~/apps/next-scaffolding
	@# copy over the real images
	cp  ~/apps/scaffolding/dist/static/*.png ~/apps/next-scaffolding/dist/static
	cd ~/apps/next-scaffolding && npm install --omit=dev --no-audit

	pm2 kill
	cp -r ~/apps/scaffolding/.env ~/apps/next-scaffolding
	@# copy over the database

	rm -rf ~/apps/backup-scaffolding
	mv ~/apps/scaffolding ~/apps/backup-scaffolding
	mv ~/apps/next-scaffolding ~/apps/scaffolding

	pm2 start pm2.config.js
	pm2 save

revert:
	rm -rf ~/apps/next-scaffolding
	mv ~/apps/scaffolding ~/apps/next-scaffolding
	mv ~/apps/backup-scaffolding ~/apps/scaffolding

	pm2 kill
	pm2 start pm2.config.js
	pm2 save
