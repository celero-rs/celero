---
title: "Database (ORM)"
weight: 4
---

Celero integrates [SeaORM](https://www.sea-ql.org/SeaORM/) for database access, providing connection pooling, typed queries, pagination, and automatic error handling.

Supported databases: **SQLite**, **PostgreSQL**, **MySQL/MariaDB**.

## Setup

Enable the `orm` feature:

```toml
[dependencies]
celero = { version = "0.1", features = ["orm"] }
```

No additional dependencies needed — `celero` re-exports `sea_orm` and `sea_orm_migration`.

## Connecting to the Database

```rust
use celero::prelude::*;

#[tokio::main]
async fn main() {
    let db = DbPool::connect("sqlite://./app.db?mode=rwc")
        .await
        .expect("failed to connect");

    let app = Celero::new()
        .database(db)
        .routes(routes![...])
        .build();

    app.serve("0.0.0.0:3456").await.unwrap();
}
```

### Advanced Configuration

```rust
use std::time::Duration;

let db = DatabaseConfig::new("postgres://user:pass@localhost/mydb")
    .max_connections(20)
    .min_connections(5)
    .connect_timeout(Duration::from_secs(10))
    .idle_timeout(Duration::from_secs(300))
    .sqlx_logging(false)
    .connect()
    .await?;
```

## Defining Entities

Entities map to database tables using SeaORM derives:

```rust
use celero::prelude::*;
use celero::sea_orm;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Serialize, Deserialize, Schema)]
#[sea_orm(table_name = "users")]
#[schema(name = "User")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub name: String,
    #[sea_orm(unique)]
    pub email: String,
    pub created_at: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
```

> `use celero::sea_orm;` is required because SeaORM derive macros generate code with `sea_orm::` paths.

## The `Db` Extractor

Use `db: Db` in handler parameters to access the database:

```rust
#[api(get, path = "/users/{id}", tag = "users")]
async fn get_user(Path(id): Path<i32>, db: Db) -> Result<Json<user::Model>, DbError> {
    let user = user::Entity::find_by_id(id)
        .one(&*db)
        .await?
        .ok_or_else(|| DbError::NotFound(format!("User {id} not found")))?;
    Ok(Json(user))
}
```

`Db` implements `Deref<Target = DatabaseConnection>`, so you pass `&*db` to SeaORM query methods.

## CRUD Examples

### Create

```rust
#[api(post, path = "/users", tag = "users")]
async fn create_user(
    db: Db,
    Json(body): Json<CreateUser>,
) -> Result<(StatusCode, Json<user::Model>), DbError> {
    let model = user::ActiveModel {
        name: Set(body.name),
        email: Set(body.email),
        ..Default::default()
    };
    let user = model.insert(&*db).await?;
    Ok((StatusCode::CREATED, Json(user)))
}
```

### Read

```rust
#[api(get, path = "/users/{id}", tag = "users")]
async fn get_user(Path(id): Path<i32>, db: Db) -> Result<Json<user::Model>, DbError> {
    let user = user::Entity::find_by_id(id)
        .one(&*db)
        .await?
        .ok_or_else(|| DbError::NotFound(format!("User {id} not found")))?;
    Ok(Json(user))
}
```

### Update

```rust
#[api(put, path = "/users/{id}", tag = "users")]
async fn update_user(
    Path(id): Path<i32>,
    db: Db,
    Json(body): Json<UpdateUser>,
) -> Result<Json<user::Model>, DbError> {
    let existing = user::Entity::find_by_id(id)
        .one(&*db)
        .await?
        .ok_or_else(|| DbError::NotFound(format!("User {id} not found")))?;

    let mut active: user::ActiveModel = existing.into();
    if let Some(name) = body.name {
        active.name = Set(name);
    }
    let updated = active.update(&*db).await?;
    Ok(Json(updated))
}
```

### Delete

```rust
#[api(delete, path = "/users/{id}", tag = "users")]
async fn delete_user(Path(id): Path<i32>, db: Db) -> Result<StatusCode, DbError> {
    let result = user::Entity::delete_by_id(id).exec(&*db).await?;
    if result.rows_affected == 0 {
        return Err(DbError::NotFound(format!("User {id} not found")));
    }
    Ok(StatusCode::NO_CONTENT)
}
```

## Pagination

```rust
#[api(get, path = "/users", tag = "users")]
async fn list_users(
    db: Db,
    Query(params): Query<PaginationParams>,
) -> Result<Paginated<user::Model>, DbError> {
    paginate(user::Entity::find(), &db, params).await
}
```

### Query Parameters

| Parameter | Type | Default | Limits |
|-----------|------|---------|--------|
| `page` | `u64` | 1 | min 1 |
| `per_page` | `u64` | 20 | 1-100 |

### Response Format

```json
{
  "items": [
    { "id": 1, "name": "Alice", "email": "alice@example.com" }
  ],
  "page": 1,
  "per_page": 20,
  "total_pages": 3,
  "total_items": 42
}
```

### Pagination with Filters

```rust
#[api(get, path = "/users/{id}/posts", tag = "posts")]
async fn list_user_posts(
    Path(user_id): Path<i32>,
    db: Db,
    Query(params): Query<PaginationParams>,
) -> Result<Paginated<post::Model>, DbError> {
    paginate(
        post::Entity::find().filter(post::Column::UserId.eq(user_id)),
        &db,
        params,
    ).await
}
```

## Error Handling

`DbError` automatically converts SeaORM errors to HTTP responses:

| Error | HTTP Status | JSON Body |
|-------|-------------|-----------|
| `DbError::NotFound(msg)` | 404 | `{"error":"Not Found","message":"..."}` |
| `DbErr::RecordNotFound` | 404 | `{"error":"Not Found","message":"..."}` |
| `DbErr::ConnectionAcquire` | 503 | `{"error":"Service Unavailable","message":"..."}` |
| Other DB errors | 500 | `{"error":"Internal Server Error","message":"..."}` |

The `?` operator converts `sea_orm::DbErr` to `DbError` automatically.
