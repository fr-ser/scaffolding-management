# Deployment

## Environment

When the environment files need to be updated it has to be done in two places:

- `.env.production` - local
  - This needs to be done inside the repository before building the frontend
  - The variables are interpolated into the frontend code itself

- `.env` - remote
  - This needs to be done on the remote before restarting the backend

## CRON

Aside from the application deployment there are some cron jobs which should be created.

The task jobs:

```txt
0 4 * * * cd ~/apps/scaffolding && /root/.nvm/versions/node/v22.18.0/bin/node dist/src/tasks/backup/task.js >> cron.log 2>&1
0 3 * * 1 cd ~/apps/scaffolding && /root/.nvm/versions/node/v22.18.0/bin/node dist/src/tasks/overdue_email/task.js >> cron.log 2>&1
0 5 1,15 * * cd ~/apps/scaffolding && /root/.nvm/versions/node/v22.18.0/bin/node dist/src/tasks/prepared_orders_mail/task.js >> cron.log 2>&1
```

The job to truncate large log files:

```txt
0 5 * * * echo "$(tail -n 10000 ~/apps/scaffolding/app.log)" > ~/apps/scaffolding/app.log
0 5 * * * echo "$(tail -n 10000 ~/apps/scaffolding/cron.log)" > ~/apps/scaffolding/cron.log
```

The job to renew certificates:

```txt
0 2 * * 1 certbot renew --webroot -w ~/apps/scaffolding/dist/static/
```

## UAT Environment

The UAT environment is a parallel instance of the application used for testing. It lives in `~/apps/uat-scaffolding` and is managed by its own PM2 configuration.

### Management

- **Start**: `cd ~/apps/deployment && make start-uat`
- **Stop**: `cd ~/apps/deployment && make stop-uat`
- **Update**: Managed via the root Makefile's `make uat-deploy` target, which invokes `make update-uat` on the server.

### Configuration

UAT uses its own `.env` file and `data.db` database, which are persistent across updates.

#### One-Time Setup

To initialize the UAT environment for the first time:

1. Create the directory on the remote machine:

   ```bash
   ssh -p ${SSH_PORT} ${SSH_USER}@${SSH_ADDRESS} 'mkdir -p ~/apps/uat-scaffolding'
   ```

2. Upload the development configuration as the initial UAT config:

   ```bash
   scp -P ${SSH_PORT} .env.development ${SSH_USER}@${SSH_ADDRESS}:~/apps/uat-scaffolding/.env
   ```

3. You can now edit `~/apps/uat-scaffolding/.env` on the server to change the port or database name if needed.

   Changing the `STATIC_FILE_ROOT` to `./dist/static` makes sense for example.
