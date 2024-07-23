update:
	pm2 kill
	
	cp -r /home/pi/apps/scaffolding/node_modules /home/pi/apps/next-scaffolding
	cp -r /home/pi/apps/scaffolding/.env /home/pi/apps/next-scaffolding
	cp  /home/pi/apps/scaffolding/*.db /home/pi/apps/next-scaffolding
	cd /home/pi/apps/next-scaffolding && npm install --omit=dev --no-audit

	rm -rf /home/pi/apps/backup-scaffolding
	mv /home/pi/apps/scaffolding /home/pi/apps/backup-scaffolding
	mv /home/pi/apps/next-scaffolding /home/pi/apps/scaffolding

	pm2 start pm2.config.js
	pm2 save

revert:
	rm -rf /home/pi/apps/next-scaffolding
	mv /home/pi/apps/scaffolding /home/pi/apps/next-scaffolding
	mv /home/pi/apps/backup-scaffolding /home/pi/apps/scaffolding

	pm2 kill
	pm2 start pm2.config.js
	pm2 save
