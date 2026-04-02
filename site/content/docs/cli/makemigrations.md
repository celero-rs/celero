---
title: "celero makemigrations"
weight: 5
---

Auto-generate database migration files by comparing SeaORM entities with the current database schema.

## Usage

```bash
celero makemigrations [OPTIONS]
```

## Options

| Flag | Description |
|------|-------------|
| `--database-url <URL>` | Override database URL |
| `--name <NAME>` | Custom suffix for the migration file name |
| `--dry-run` | Preview changes without writing files |
| `--empty` | Create an empty migration scaffold |

## Examples

```bash
# Auto-generate migrations
celero makemigrations

# Preview without writing
celero makemigrations --dry-run

# Custom migration name
celero makemigrations --name add_bio_column

# Empty migration for custom logic
celero makemigrations --empty --name seed_data

# Explicit database URL
celero makemigrations --database-url "postgres://user:pass@localhost/mydb"
```

## How It Works

1. Scans for SeaORM entity files (`DeriveEntityModel`)
2. Connects to the database and introspects the current schema
3. Computes the diff between entities and schema
4. Generates migration file(s) with the required changes
5. Updates `migration/mod.rs` with the new migration

## Output Example

```
Detecting project layout...
  Layout: flat
Scanning for entities...
  Found: 1 entity
    users (4 columns)
Connecting to database...
  sqlite://./app.db?mode=rwc
Introspecting current schema...
  0 tables (empty database)
Computing changes...

Migrations to create:

  create_users:
    + Table "users"
      + id: Integer (PK, auto_increment)
      + name: String (NOT NULL)
      + email: String (NOT NULL)
      + created_at: String (NOT NULL)

  Generated: src/migration/m20260211_000001_create_users.rs
  Updated: src/migration/mod.rs

Done!
```

## Project Layout Detection

The command auto-detects the project layout:

- **Flat** — entities in `src/entities/`, migrations in `src/migration/`
- **Multi-app** — entities in `src/apps/*/entities/`, migrations per-app in `src/apps/*/migrations/`

Detection is based on the presence of `src/apps/`.

## Prerequisites

- `orm` feature enabled in `Cargo.toml`
- `DATABASE_URL` set via `.env`, environment variable, or `--database-url` flag
