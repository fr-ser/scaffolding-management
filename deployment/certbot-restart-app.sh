#!/bin/bash
# Certbot deploy hook: restarts the production app after a certificate renewal.
# Install by symlinking (or copying) this file into
# /etc/letsencrypt/renewal-hooks/deploy/ on the remote host, then chmod +x it.
# Certbot only runs deploy hooks when a certificate is actually renewed, so
# this does not fire on the no-op weeks of the `certbot renew` cron job.
pm2 restart scaffolding
