# Deployment

## CRON

Aside from the application deployment there are some cron jobs which should be created.

The task jobs:

```txt
0 4 * * * cd /home/pi/apps/scaffolding && node dist/src/tasks/backup/task.js >> cron.log 2>&1
0 3 * * 1 cd /home/pi/apps/scaffolding && node dist/src/tasks/email_notification/task.js >> cron.log 2>&1
```

The job to update the dynamic DNS:

```txt
*/5 * * * * /home/pi/dyndns/dynv6.sh
```

The job to truncate large log files:

```txt
0 5 * * * echo "$(tail -n 10000 /home/pi/apps/scaffolding/app.log)" > /home/pi/apps/scaffolding/app.log
0 5 * * * echo "$(tail -n 10000 /home/pi/apps/scaffolding/cron.log)" > /home/pi/apps/scaffolding/cron.log
```
