---
title: "celero migrate"
weight: 6
---

Apply pending database migrations.

## Usage

```bash
celero migrate [OPTIONS]
```

## Options

| Flag | Description |
|------|-------------|
| `--database-url <URL>` | Override database URL |
| `--status` | Show migration status without applying |

## Examples

```bash
# Apply all pending migrations
celero migrate

# Show status
celero migrate --status

# With explicit database URL
celero migrate --status --database-url "sqlite://./test.db"
```

## How It Works

`celero migrate` is fully automatic (Django-style):

1. Detects project layout (flat or multi-app)
2. Generates `src/bin/migrate.rs` — a minimal runner binary
3. Adds `[[bin]]` to `Cargo.toml` if not present
4. Ensures `src/lib.rs` exports the migration module
5. Runs `cargo run --bin migrate` — compiles and applies migrations

The generated files are created once and maintained by the CLI.

## Output

When there are pending migrations:
```
=> Running migrations...

2 migrations applied successfully.
```

When up to date:
```
=> Running migrations...

No pending migrations.
```

## Status Output

```bash
$ celero migrate --status

Migration Status:
  [X] m20260211_000001_create_users     (applied 2026-02-11 10:30:00)
  [X] m20260211_000002_create_posts     (applied 2026-02-11 10:30:01)
  [ ] m20260211_000003_add_bio          (pending)

1 pending migration. Run `celero migrate` to apply.
```
