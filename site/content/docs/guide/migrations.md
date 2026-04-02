---
title: "Migrations"
weight: 5
---

Celero provides Django-style migration commands that automatically generate migration files by comparing your SeaORM entities with the current database schema.

## Quick Start

### 1. Define your entities

```rust
#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Serialize, Deserialize, Schema)]
#[sea_orm(table_name = "users")]
#[schema(name = "User")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub name: String,
    pub email: String,
}
```

### 2. Generate migrations

```bash
celero makemigrations
```

### 3. Apply migrations

```bash
celero migrate
```

### 4. Check status

```bash
celero migrate --status
```

For full CLI reference, see [celero makemigrations](../cli/makemigrations.md) and [celero migrate](../cli/migrate.md).

## Type Mapping

| Rust Type | SQL Column Type |
|-----------|----------------|
| `i32`, `u32` | INTEGER |
| `i64`, `u64` | BIGINT |
| `f32` | FLOAT |
| `f64` | DOUBLE |
| `String` | VARCHAR |
| `String` + `column_type="Text"` | TEXT |
| `bool` | BOOLEAN |
| `Option<T>` | T NULLABLE |
| `Uuid` | UUID |
| `DateTime` | DATETIME |
| `Vec<u8>` | BINARY |
| `serde_json::Value` | JSON |

## SeaORM Attributes

| Attribute | Migration Effect |
|-----------|-----------------|
| `#[sea_orm(primary_key)]` | `.primary_key().auto_increment()` |
| `#[sea_orm(primary_key, auto_increment = false)]` | `.primary_key()` without auto-increment |
| `#[sea_orm(column_type = "Text")]` | Column type override |
| `#[sea_orm(unique)]` | `.unique_key()` |
| `#[sea_orm(nullable)]` | `.null()` |

## Relations and Foreign Keys

```rust
#[derive(DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::user::Entity",
        from = "Column::UserId",
        to = "super::user::Column::Id"
    )]
    User,
}
```

This generates a foreign key constraint with `ON DELETE CASCADE`.

## Database Support

| Database | CREATE TABLE | ADD COLUMN | ALTER COLUMN |
|----------|-------------|------------|--------------|
| SQLite | Yes | Yes | No (SQLite limitation) |
| PostgreSQL | Yes | Yes | Yes |

## Limitations

| Limitation | Workaround |
|------------|------------|
| No auto-drop tables | Write a manual migration |
| No auto-drop columns | Write a manual migration |
| No rename tables/columns | Write a manual migration |
| No ALTER COLUMN on SQLite | Use PostgreSQL or manual table rebuild |
| No data migrations | Use `--empty` and write custom logic |
