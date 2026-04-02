---
title: "Routing & Handlers"
weight: 1
---

## Defining Routes

Use the `#[api]` macro to define HTTP endpoints:

```rust
use celero::prelude::*;

#[api(get, path = "/hello")]
async fn hello() -> &'static str {
    "Hello, World!"
}
```

### HTTP Methods

The first argument specifies the HTTP method:

```rust
#[api(get, path = "/users")]
#[api(post, path = "/users")]
#[api(put, path = "/users/{id}")]
#[api(delete, path = "/users/{id}")]
#[api(patch, path = "/users/{id}")]
```

### Path Parameters

Use `{param}` syntax in the path, matching FastAPI's convention:

```rust
#[api(get, path = "/users/{id}")]
async fn get_user(Path(id): Path<i64>) -> Json<User> {
    // id is extracted from the URL
}

#[api(get, path = "/users/{user_id}/posts/{post_id}")]
async fn get_post(
    Path((user_id, post_id)): Path<(i64, i64)>,
) -> Json<Post> {
    // multiple path params as tuple
}
```

### OpenAPI Metadata

Add `tag` and `summary` for Swagger UI organization:

```rust
#[api(get, path = "/users/{id}", tag = "users", summary = "Get user by ID")]
async fn get_user(Path(id): Path<i64>) -> Json<User> {
    // ...
}
```

Doc comments become the `description` in the OpenAPI spec:

```rust
/// Retrieves a user by their unique identifier.
///
/// Returns 404 if the user does not exist.
#[api(get, path = "/users/{id}", tag = "users", summary = "Get user")]
async fn get_user(Path(id): Path<i64>) -> Result<Json<User>, DbError> {
    // ...
}
```

## Extractors

Extractors pull data from the incoming request. They appear as handler function parameters.

### Path

Extracts segments from the URL path:

```rust
#[api(get, path = "/users/{id}")]
async fn get_user(Path(id): Path<i64>) -> Json<User> { ... }
```

### Query

Extracts query string parameters:

```rust
#[derive(Deserialize, Schema)]
struct Filters {
    page: Option<u64>,
    per_page: Option<u64>,
    search: Option<String>,
}

#[api(get, path = "/users")]
async fn list_users(Query(filters): Query<Filters>) -> Json<Vec<User>> { ... }
```

Request: `GET /users?page=2&search=alice`

### Json

Extracts and deserializes a JSON request body:

```rust
#[derive(Deserialize, Schema)]
struct CreateUser {
    name: String,
    email: String,
}

#[api(post, path = "/users")]
async fn create_user(Json(body): Json<CreateUser>) -> (StatusCode, Json<User>) { ... }
```

### State

Accesses shared application state:

```rust
#[api(get, path = "/config")]
async fn get_config(State(config): State<AppConfig>) -> Json<AppConfig> { ... }
```

### Db

Accesses the database connection (requires `orm` feature):

```rust
#[api(get, path = "/users/{id}")]
async fn get_user(Path(id): Path<i64>, db: Db) -> Result<Json<User>, DbError> {
    let user = user::Entity::find_by_id(id).one(&*db).await?;
    // ...
}
```

## Responses

### JSON Response

```rust
#[api(get, path = "/user")]
async fn get_user() -> Json<User> {
    Json(User { id: 1, name: "Alice".into() })
}
```

### Status Code + JSON

```rust
#[api(post, path = "/users")]
async fn create_user(Json(body): Json<CreateUser>) -> (StatusCode, Json<User>) {
    (StatusCode::CREATED, Json(user))
}
```

### Plain Text

```rust
#[api(get, path = "/health")]
async fn health() -> &'static str {
    "ok"
}
```

### Result Type

```rust
#[api(get, path = "/users/{id}")]
async fn get_user(
    Path(id): Path<i64>,
    db: Db,
) -> Result<Json<User>, DbError> {
    let user = user::Entity::find_by_id(id)
        .one(&*db)
        .await?
        .ok_or_else(|| DbError::NotFound(format!("User {id} not found")))?;
    Ok(Json(user))
}
```

## Registering Routes

### With `routes![]` macro

```rust
let app = Celero::new()
    .routes(routes![get_user, create_user, delete_user])
    .build();
```

With module paths:

```rust
.routes(routes![users::list, users::create, posts::list])
```

### With inline closures

For simple cases:

```rust
let app = Celero::new()
    .get("/health", || async { "ok" })
    .build();
```

### With route collection functions

In app-based projects, each module exposes a `routes()` function:

```rust
// src/apps/users/handlers/mod.rs
pub fn routes() -> Vec<RouteDefinition<DbPool>> {
    routes![list_users, create_user, get_user, update_user, delete_user]
}
```
