# AvoPanel — Deployment & Upgrade Guide

AvoPanel is the **AvoCloud fork** of [Jexpanel / Jexactyl](https://github.com/Jexactyl/Jexactyl) — same panel, with a bug-fix sweep on top. The procedure mirrors the [official Jexpanel upgrade docs](https://docs.jexpanel.com/docs/upgrade/) so you can follow the same muscle memory.

Repository: `https://github.com/AvoCloud-net/avopanel`
Branch: `fix/sweep-2026-05`
Tag (initial release): `v4.0.1-avopanel.1`

---

## Table of Contents

1. [Backup First](#1-backup-first)
2. [Upgrade from Jexpanel v4.x to AvoPanel](#2-upgrade-from-jexpanel-v4x-to-avopanel) — one-time switch
3. [Upgrade AvoPanel → AvoPanel](#3-upgrade-avopanel--avopanel) — recurring
4. [Fresh Install](#4-fresh-install)
5. [Docker Install / Upgrade](#5-docker-install--upgrade)
6. [Rollback](#6-rollback)
7. [Troubleshooting](#7-troubleshooting)
8. [Changelog](#8-changelog)

---

## 1. Backup First

Run **all three** before you change anything on the server.

```bash
# 1.1 Database dump
mysqldump -u root -p panel > ~/backup-panel-$(date +%F).sql
ls -lh ~/backup-panel-*.sql              # confirm non-empty

# 1.2 Files (.env, storage/, public/, current git HEAD)
PANEL_DIR=/var/www/jexactyl              # or /var/www/pterodactyl
tar -czf ~/backup-panel-files-$(date +%F).tar.gz \
    -C "$PANEL_DIR" .env storage public

# 1.3 Pin current code revision (only if PANEL_DIR is a git checkout)
cd "$PANEL_DIR" && git rev-parse HEAD > ~/backup-panel-commit-$(date +%F).txt
```

---

## 2. Upgrade from Jexpanel v4.x to AvoPanel

Use this once, to switch an existing **Jexpanel v4.x** install over to AvoPanel. Works in-place — no reinstall, no DB drop.

### 2.1 Enable Maintenance Mode

```bash
php /var/www/jexactyl/artisan down
```

### 2.2 Download and Extract AvoPanel

```bash
cd /var/www/jexactyl
curl -Lo panel.tar.gz https://github.com/AvoCloud-net/avopanel/releases/download/v4.0.1-avopanel.1/avopanel-4.0.1-avopanel.1.tar.gz
tar --strip-components=1 -xzvf panel.tar.gz
chmod -R 755 storage/* bootstrap/cache/
```

> The release tarball ships with `public/build/` pre-built — no `pnpm install` or `pnpm build` is needed on the server. `--strip-components=1` drops the top-level `avopanel-4.0.1-1/` directory so files land directly in `/var/www/jexactyl`.

### 2.3 Update Dependencies

```bash
composer install --no-dev --optimize-autoloader
```

### 2.4 Clear Backend Cache

```bash
php artisan optimize:clear
```

### 2.5 Migrate Database Changes

```bash
php artisan migrate --seed --force
```

> AvoPanel's migration guard (commit `be0b6b2a1`) handles the upstream `SQLSTATE[42S22] Unknown column 'node'` failure automatically. If migrate still complains, see [Troubleshooting → migration deadlock](#migration-deadlock).

### 2.6 Set Webserver Permissions

For NGINX/Apache (non-CentOS):
```bash
chown -R www-data:www-data /var/www/jexactyl/*
```

For NGINX on CentOS:
```bash
chown -R nginx:nginx /var/www/jexactyl/*
```

For Apache on CentOS:
```bash
chown -R apache:apache /var/www/jexactyl/*
```

### 2.7 Exit Maintenance Mode

```bash
php artisan up
```

### 2.8 Verify

- Login → dashboard loads, no 500.
- Click into a server → CPU/RAM graphs render.
- Edit a file in the file manager → save → **no error toast** (this was the recursive-`returnNoContent` bug).
- Free-tier server within 7 days of renewal → **Renew** button works.
- Console tab → switch away and back → no blank gap at the top.

That's it. From here on use [section 3](#3-upgrade-avopanel--avopanel) for future upgrades.

---

## 3. Upgrade AvoPanel → AvoPanel

For every subsequent AvoPanel release. Identical to upstream Jexpanel's flow — only the URL changes.

```bash
# 3.1 Maintenance
php /var/www/jexactyl/artisan down

# 3.2 Download
cd /var/www/jexactyl
curl -Lo panel.tar.gz https://github.com/AvoCloud-net/avopanel/releases/latest/download/avopanel.tar.gz
tar --strip-components=1 -xzvf panel.tar.gz
chmod -R 755 storage/* bootstrap/cache/

# 3.3 Dependencies
composer install --no-dev --optimize-autoloader

# 3.4 Cache clear
php artisan optimize:clear

# 3.5 Migrate
php artisan migrate --seed --force

# 3.6 Permissions  (pick the matching line)
chown -R www-data:www-data /var/www/jexactyl/*

# 3.7 Up
php artisan up
```

`releases/latest/download/avopanel.tar.gz` always resolves to the newest tagged release — keep that URL in scripts.

---

## 4. Fresh Install

Use this on a clean server with no existing panel.

### 4.1 Server Requirements

- Ubuntu 22.04 / 24.04, Debian 12, RHEL 9, or Fedora 40+.
- PHP 8.3+ with extensions: `bcmath`, `curl`, `gd`, `mbstring`, `mysql`, `pdo`, `tokenizer`, `xml`, `zip`, `sodium`, `intl`.
- MariaDB 10.6+ or MySQL 8.0+.
- nginx 1.22+.
- Redis (for sessions and queue).
- Composer 2.x.
- A live Wings daemon — see Pterodactyl Wings docs.

### 4.2 Database

```sql
CREATE DATABASE panel;
CREATE USER 'pterodactyl'@'127.0.0.1' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON panel.* TO 'pterodactyl'@'127.0.0.1' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

### 4.3 Download and Extract

```bash
sudo mkdir -p /var/www/jexactyl
cd /var/www/jexactyl
sudo curl -Lo panel.tar.gz https://github.com/AvoCloud-net/avopanel/releases/latest/download/avopanel.tar.gz
sudo tar --strip-components=1 -xzvf panel.tar.gz
sudo chmod -R 755 storage/* bootstrap/cache
```

### 4.4 Install Dependencies

```bash
sudo cp .env.example .env
sudo composer install --no-dev --optimize-autoloader
sudo php artisan key:generate --force
```

### 4.5 Configure

```bash
sudo php artisan p:environment:setup       # interactive
sudo php artisan p:environment:database    # interactive
sudo php artisan p:environment:mail        # interactive
```

### 4.6 Migrate

```bash
sudo php artisan migrate --seed --force
```

### 4.7 Create Admin User

```bash
sudo php artisan p:user:make
```

### 4.8 Webserver

Drop the standard Pterodactyl nginx config (see [official panel install docs](https://pterodactyl.io/panel/1.0/webserver_configuration.html)) — AvoPanel uses the same paths.

### 4.9 Permissions, Cron, Queue

```bash
sudo chown -R www-data:www-data /var/www/jexactyl/*

# Cron
sudo crontab -e
# add this line:
* * * * * php /var/www/jexactyl/artisan schedule:run >> /dev/null 2>&1
```

Queue worker as systemd unit `/etc/systemd/system/pteroq.service`:

```ini
[Unit]
Description=AvoPanel Queue Worker
After=redis-server.service

[Service]
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /var/www/jexactyl/artisan queue:work --queue=high,standard,low --sleep=3 --tries=3
StartLimitInterval=180
StartLimitBurst=30
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now redis-server pteroq
```

### 4.10 Verify

Open `https://<your-domain>/` and log in with the admin user from 4.7.

---

## 5. Docker Install / Upgrade

### 5.1 Fresh Docker install

```bash
sudo mkdir -p /srv/avopanel && cd /srv/avopanel
curl -Lo avopanel.tar.gz https://github.com/AvoCloud-net/avopanel/releases/latest/download/avopanel.tar.gz
tar --strip-components=1 -xzvf avopanel.tar.gz
cp docker-compose.example.yml docker-compose.yml
# edit docker-compose.yml — set APP_URL, MYSQL_PASSWORD, MAIL_FROM, LE_EMAIL
docker compose up -d
docker compose exec panel php artisan p:user:make
```

### 5.2 Upgrade an existing Docker install

```bash
cd /srv/avopanel
docker compose stop panel
mv avopanel.tar.gz avopanel.tar.gz.bak 2>/dev/null
curl -Lo avopanel.tar.gz https://github.com/AvoCloud-net/avopanel/releases/latest/download/avopanel.tar.gz
tar --strip-components=1 -xzvf avopanel.tar.gz
docker compose build panel
docker compose up -d panel
docker compose exec panel php artisan migrate --seed --force
docker compose exec panel php artisan optimize:clear
```

---

## 6. Rollback

### 6.1 Same-day rollback (no new data written)

```bash
cd /var/www/jexactyl
php artisan down
mysql -u root -p panel < ~/backup-panel-$(date +%F).sql
rm -rf app bootstrap config database public resources routes storage vendor
tar -xzvf ~/backup-panel-files-$(date +%F).tar.gz
# re-fetch the prior release tarball or restore from your VCS
composer install --no-dev --optimize-autoloader
php artisan up
```

### 6.2 Late rollback (users wrote new rows)

AvoPanel migrations are **additive-only** — they never drop columns or destroy data. A pure code rollback is safe; **skip the `mysql ... < backup` step** to preserve the user activity since the upgrade.

---

## 7. Troubleshooting

### migration deadlock

```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'node' in 'servers'
```

Confirm you're really on AvoPanel: `git log -1` should show one of the fix commits, or check `composer show jexactyl/*` for an unexpected version. If you are and it still happens, force-mark the migration as run:

```sql
INSERT INTO migrations (migration, batch) VALUES
  ('2016_10_23_193809_fix_servers_column_types_for_foreign_keys', 999);
```

Then `php artisan migrate --force` again.

### "File saved successfully" toast missing / error toast on save

Verify commit `85e8315ea fix(api): stop recursive self-call in returnNoContent` is in the deployed code:

```bash
grep -n "HTTP_NO_CONTENT" app/Http/Controllers/Api/Application/ApplicationApiController.php
```

Expect a line with `new Response('', Response::HTTP_NO_CONTENT)`. If missing, the tarball was the wrong one — re-download.

### Free-server renew button errors

Verify the fix is present:

```bash
grep -n "isFuture" app/Http/Controllers/Api/Client/Billing/FreeProductController.php
```

If the line `if ($server->renewal_date && $server->renewal_date->isFuture() && $server->renewal_date->diffInDays(now()) > 7)` is present, clear caches:

```bash
php artisan config:clear && php artisan config:cache && php artisan route:clear && php artisan route:cache
```

### `composer audit` shows phpseclib advisory

Old `composer.lock` cached on disk. Force-refresh:

```bash
rm composer.lock
composer install --no-dev --optimize-autoloader
```

…then re-extract `composer.lock` from the release tarball if you want the pinned versions back.

### 502 / blank page after upgrade

PHP-FPM didn't reload. `sudo systemctl reload php8.3-fpm` (adjust version) and check `/var/log/nginx/error.log`.

---

## 8. Changelog

### v4.0.1-avopanel.1 (2026-05-20)

Initial AvoCloud fork release. Forked from Jexpanel `v4.0.1`. All commits live on branch `fix/sweep-2026-05`.

| Commit | Scope | Description |
|---|---|---|
| `be0b6b2a1` | migrations | guard legacy servers-column rename against fresh schema (fixes upstream #573 migration crash) |
| `5b7d1cefc` | api | pass ServerTransformer instance to getIncludesForTransformer (fixes #573 dashboard 500) |
| `8061ab2ad` | stats | invalidate stale non-array cache before transform (fixes #573 stats 500) |
| `abaaff66a` | console | refit xterm on container resize and expand toggle (fixes #421) |
| `1d12e561d` | databases-state | import Database from definitions instead of phantom route |
| `b61ee0363` | billing | emit free/paid suspension days end-to-end |
| `963538cfd` | tickets | replace `toReversed` with copy + `reverse` |
| `0b0fd92db` | admin-eggs | restore `configFrom`/`copyScriptFrom`/`scriptIsPrivileged` on Egg |
| `fe90e1c59` | select-field | migrate to react-select v5 API |
| `e8d6f6fa7` | typecheck | plug nullable/undefined gaps in 4 components |
| `8a69a42a1` | security | bump phpseclib (CVE-2026-44167 high, CVE-2026-40194 low) |
| `85e8315ea` | api | **stop recursive self-call in `returnNoContent`** — file-save false-error fix |
| `fb26d0357` | billing | **allow free-server renewal** + clear loading state |
| `079bcd737` | typecheck | clear remaining Formik and component-typing drift |
| `1ff68c74b` | docs | initial DEPLOY.md (this file's first draft) |

CI gates: `tsc --noEmit` 0 errors, `phpstan analyse` 0 errors, `eslint` clean, `composer audit` 0 advisories.
