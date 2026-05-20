# Deployment & Migration Guide — Jexpanel (forked)

Local fork of [Jexactyl/Jexactyl](https://github.com/Jexactyl/Jexactyl), branch `fix/sweep-2026-05`. Contains bug fixes documented in [`CHANGELOG-FORK.md`](#changelog) below.

This guide covers:

1. **Migrate** an existing upstream install (Jexactyl/Jexpanel) to this fork — no data loss.
2. **Fresh install** of this fork.
3. **Rollback** if something breaks.

> **WARNING:** Always take a full backup before migrating. See [Backup](#backup) first.

---

## Prerequisites

- Existing Wings daemon(s) — untouched by this migration; the fork only changes the Panel.
- SSH access to the Panel server.
- MariaDB / MySQL credentials for the panel DB (`.env` → `DB_*`).
- One of:
  - **Bare-metal install** at `/var/www/pterodactyl` (or `/var/www/jexactyl`).
  - **Docker** via `docker-compose.example.yml`.

---

## Backup

Do **all three** before touching anything.

```bash
# 1. Database
mysqldump -u root -p panel > ~/backup-panel-$(date +%F).sql

# 2. Files (incl. .env, storage/, public/)
PANEL_DIR=/var/www/pterodactyl     # adjust
tar -czf ~/backup-panel-files-$(date +%F).tar.gz \
    -C "$PANEL_DIR" .env storage public

# 3. Snapshot the current git HEAD so you can pin-rollback
cd "$PANEL_DIR" && git rev-parse HEAD > ~/backup-panel-commit-$(date +%F).txt
```

Verify the dump is non-empty (`ls -lh ~/backup-panel-*.sql`) before proceeding.

---

## Path A — Migrate Existing Install (Bare-Metal)

### A.1 Put Panel into maintenance mode

```bash
cd /var/www/pterodactyl
php artisan down --message="Upgrading. Back in 5 minutes." --retry=60
```

### A.2 Add this fork as a remote and fetch

The upstream install is already a git repo. Add our fork as a new remote — we **don't** replace `origin`, so you can always pull upstream releases later.

```bash
# from inside /var/www/pterodactyl
git remote add fork <YOUR-FORK-URL>          # e.g. git@github.com:<you>/jexpanel-fork.git
git fetch fork
```

If you didn't push the fork to a remote yet: see [Path C — Pushing the Fork](#path-c).

### A.3 Stash any local edits and switch branch

```bash
git status                                    # confirm what's modified
git stash push -m "pre-fork-migration"        # save local changes
git checkout -b fix/sweep-2026-05 fork/fix/sweep-2026-05
```

Re-apply your local edits with `git stash pop` **only** if you know they don't conflict with the fix commits. Otherwise leave them stashed and reconcile by hand later.

### A.4 Reinstall dependencies

```bash
composer install --no-dev --optimize-autoloader
npm i -g pnpm                                 # or: corepack enable
pnpm install --frozen-lockfile
pnpm build                                    # produces public/build/
```

### A.5 Run migrations

The fork's migration guard (commit `be0b6b2a1`) makes the legacy `servers` column-rename migration idempotent, so this is safe on both fresh and legacy schemas.

```bash
php artisan migrate --force
```

If migrate complains about a specific previously-failed migration, see [Troubleshooting → migration deadlock](#migration-deadlock).

### A.6 Rebuild caches & permissions

```bash
php artisan config:clear
php artisan view:clear
php artisan route:clear
php artisan cache:clear

php artisan config:cache
php artisan view:cache
php artisan route:cache

# Permissions — adjust user if not nginx
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

### A.7 Restart services

```bash
sudo systemctl restart php8.3-fpm nginx
sudo systemctl restart pteroq.service        # queue worker
```

### A.8 Take Panel out of maintenance

```bash
php artisan up
```

### A.9 Verify

- Login → dashboard loads without 500.
- Click into a server → resource graphs render (fixes `StatsTransformer` cache bug).
- Edit a file in the file manager → save → expect success toast, no error.
- On a free-tier server within 7 days of renewal → "Renew" button works.
- Tab-switch in/out of the Console → no blank gap at the top.

---

## Path B — Migrate Docker Install

Same idea, but performed against the bind-mounted source directory.

### B.1 Stop the panel container only (keep DB + cache running so they're queryable)

```bash
cd /srv/jexpanel
docker compose stop panel cache
```

### B.2 Backup

```bash
docker compose exec -T database mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" \
    panel > ~/backup-panel-$(date +%F).sql
tar -czf ~/backup-srv-$(date +%F).tar.gz /srv/jexpanel
```

### B.3 Pull fork source

The upstream image rebuilds from the repo. Clone the fork **next to** the compose file and point compose at it.

```bash
git clone -b fix/sweep-2026-05 <YOUR-FORK-URL> /srv/jexpanel/src
```

Edit `docker-compose.example.yml` (or your `docker-compose.yml`):

```yaml
services:
  panel:
    # image: ghcr.io/jexactyl/jexactyl:latest          # remove this line
    build:
      context: /srv/jexpanel/src                       # add these two lines
      dockerfile: Dockerfile
```

### B.4 Build and start

```bash
docker compose build panel
docker compose up -d panel cache
```

Migrations run inside the entrypoint. Tail logs:

```bash
docker compose logs -f panel
```

### B.5 Verify (same checks as A.9)

---

## Path C — Pushing the Fork

If you haven't pushed `fix/sweep-2026-05` to a remote yet, you need to before any server can pull it.

Options:

**(C1) Push to a private GitHub repo:**

```bash
# locally — in the dev clone
gh repo create <you>/jexpanel-fork --private --source=. --remote=fork
git push -u fork fix/sweep-2026-05
```

**(C2) Use a bare git server over SSH:**

```bash
# on the panel server
git init --bare /srv/git/jexpanel-fork.git
# locally
git remote add fork ssh://user@panel-server/srv/git/jexpanel-fork.git
git push -u fork fix/sweep-2026-05
```

**(C3) Skip remotes — rsync the working tree:**

```bash
# from local dev clone
rsync -a --delete --exclude node_modules --exclude vendor \
    ./ user@panel-server:/var/www/pterodactyl-fork/
# then on server:  cd /var/www/pterodactyl-fork && composer install ... && pnpm install ...
```

C3 loses git history on the server but skips remote setup.

---

## Rollback

If anything goes wrong after A.5 (migrations) — these are the rollback steps.

### Same-day rollback (no users have written new data)

```bash
cd /var/www/pterodactyl
php artisan down

# Restore DB
mysql -u root -p panel < ~/backup-panel-$(date +%F).sql

# Restore git state
git checkout main                                          # or: $(cat ~/backup-panel-commit-*.txt)
composer install --no-dev --optimize-autoloader
pnpm install --frozen-lockfile && pnpm build

php artisan up
```

### Late rollback (users wrote new rows)

The fork's migrations are **additive only** (idempotent guard on legacy migration, no schema drops). Code rollback should work without DB rollback. Restore `git checkout main` + asset rebuild only. Skip the `mysql -u root -p panel < …` step.

---

## Troubleshooting

### migration deadlock

If you see:

```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'node' in 'servers'
```

…during `migrate`, this fork already fixes it. Confirm you actually checked out `fix/sweep-2026-05` (`git log -1 --oneline` should show one of the fork commits). If you did, and it still happens, manually mark the bad migration as already run:

```sql
INSERT INTO migrations (migration, batch) VALUES
  ('2016_10_23_193809_fix_servers_column_types_for_foreign_keys', 999);
```

…then re-run `php artisan migrate --force`.

### File save shows error but file is saved

That's the original upstream bug. Confirm commit `85e8315ea fix(api): stop recursive self-call in returnNoContent` is in your `git log`. If yes and the error persists, clear `bootstrap/cache/*.php` and the route cache:

```bash
php artisan optimize:clear && php artisan optimize
```

### Free-server renew button errors out

Confirm commit `fb26d0357 fix(billing): allow free-server renewal …` is in `git log`. Then clear config cache:

```bash
php artisan config:clear && php artisan config:cache
```

### `composer audit` shows phpseclib advisory

You're on an older `composer.lock`. The fork bumps phpseclib (commit `8a69a42a1`); re-run `composer install` against this branch's lockfile.

---

## Changelog (Fork-Only Commits)

| Commit | Scope | Description |
|---|---|---|
| `be0b6b2a1` | migrations | guard legacy servers-column rename against fresh schema |
| `5b7d1cefc` | api | pass ServerTransformer instance to getIncludesForTransformer |
| `8061ab2ad` | stats | invalidate stale non-array cache before transform |
| `abaaff66a` | console | refit xterm on container resize and expand toggle |
| `1d12e561d` | databases-state | import Database from definitions instead of phantom route |
| `b61ee0363` | billing | emit free/paid suspension days end-to-end |
| `963538cfd` | tickets | replace `toReversed` with copy + `reverse` |
| `0b0fd92db` | admin-eggs | restore `configFrom`/`copyScriptFrom`/`scriptIsPrivileged` on Egg |
| `fe90e1c59` | select-field | migrate to react-select v5 API |
| `e8d6f6fa7` | typecheck | plug nullable/undefined gaps in 4 components |
| `8a69a42a1` | security | bump phpseclib (CVE-2026-44167 high, CVE-2026-40194 low) |
| `85e8315ea` | api | stop recursive self-call in `returnNoContent` |
| `fb26d0357` | billing | allow free-server renewal and clear loading state |
| `079bcd737` | typecheck | clear remaining Formik and component-typing drift |

`tsc --noEmit`, `phpstan analyse`, `eslint`, `composer audit` all clean on this branch.

---

## Pulling Future Upstream Changes

When Jexactyl/Jexactyl ships a new release on `develop`, merge it into the fork branch:

```bash
git fetch upstream
git checkout fix/sweep-2026-05
git merge upstream/develop                    # resolve conflicts
pnpm install && composer install
pnpm exec tsc --noEmit                        # confirm fixes still hold
./vendor/bin/phpstan analyse --memory-limit=2G
git push fork fix/sweep-2026-05
```

If upstream incorporates any of the fork commits, drop the corresponding local commit during the merge.
