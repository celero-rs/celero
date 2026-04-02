---
title: "Error Handling"
weight: 8
---

Celero uses Rust's `Result` type for error handling in handlers. Errors are automatically converted to JSON HTTP responses.

## Using Result in Handlers

```rust
#[api(get, path = "/users/{id}", tag = "users")]
async fn get_user(
    Path(id): Path<i32>,
    db: Db,
) -> Result<Json<user::Model>, DbError> {
    let user = user::Entity::find_by_id(id)
        .one(&*db)
        .await?                    // DbErr -> DbError via From trait
        .ok_or_else(|| DbError::NotFound(format!("User {id} not found")))?;
    Ok(Json(user))
}
```

## DbError

When using the `orm` feature, `DbError` provides automatic error-to-response mapping:

| Error | HTTP Status | JSON Response |
|-------|-------------|---------------|
| `DbError::NotFound(msg)` | 404 Not Found | `{"error":"Not Found","message":"..."}` |
| `DbErr::RecordNotFound` | 404 Not Found | `{"error":"Not Found","message":"..."}` |
| `DbErr::ConnectionAcquire` | 503 Service Unavailable | `{"error":"Service Unavailable","message":"Database unavailable"}` |
| Other DB errors | 500 Internal Server Error | `{"error":"Internal Server Error","message":"Internal database error"}` |

The `?` operator converts `sea_orm::DbErr` into `DbError` automatically:

```rust
// This works because DbError implements From<sea_orm::DbErr>
let users = user::Entity::find().all(&*db).await?;
```

## StatusCode as Response

For simple cases, return `StatusCode` directly:

```rust
#[api(delete, path = "/users/{id}")]
async fn delete_user(Path(id): Path<i32>, db: Db) -> Result<StatusCode, DbError> {
    let result = user::Entity::delete_by_id(id).exec(&*db).await?;
    if result.rows_affected == 0 {
        return Err(DbError::NotFound(format!("User {id} not found")));
    }
    Ok(StatusCode::NO_CONTENT)
}
```

## Custom Error Types

For application-specific errors, implement `IntoResponse`:

```rust
enum AppError {
    NotFound(String),
    BadRequest(String),
    Internal(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response<Body> {
        let (status, message) = match self {
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, msg),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
            AppError::Internal(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
        };

        let body = serde_json::json!({
            "error": status.canonical_reason().unwrap_or("Error"),
            "message": message,
        });

        Response::builder()
            .status(status)
            .header("content-type", "application/json")
            .body(Body::from(serde_json::to_string(&body).unwrap()))
            .unwrap()
    }
}
```

## Common Patterns

### Chaining with `ok_or_else`

```rust
let user = user::Entity::find_by_id(id)
    .one(&*db)
    .await?
    .ok_or_else(|| DbError::NotFound(format!("User {id} not found")))?;
```

### Early Return on Validation

```rust
#[api(post, path = "/users")]
async fn create_user(
    db: Db,
    Json(body): Json<CreateUser>,
) -> Result<(StatusCode, Json<user::Model>), DbError> {
    if body.name.is_empty() {
        return Err(DbError::NotFound("Name cannot be empty".into()));
    }
    // ...
}
```
