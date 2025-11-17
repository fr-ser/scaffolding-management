# Deployment

## Environment

When the environment files need to be updated it has to be done in two places:

- `.env.production` - local

  - This needs to be done inside the repository before building the frontend
  - The variables are interpolated into the frontend code itself

- `.env` - raspberry
  - This needs to be done on the raspberry pi before restarting the backend

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
