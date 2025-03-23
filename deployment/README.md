# Deployment

## CRON

Aside from the application deployment there are some cron jobs which should be created.

The daily jobs:

```txt
0 4 * * * cd /home/pi/apps/scaffolding && node dist/src/tasks/backup/task.js >> cron.log 2>&1
```

The job to update the dynamic DNS:

```txt
*/5 * * * * /home/pi/dyndns/dynv6.sh
```

The job to truncate large log files:

```txt
0 5 * * * echo "$(tail -n 10000 /home/pi/apps/scaffolding/app.log)" > /home/pi/apps/scaffolding/app.log
```
