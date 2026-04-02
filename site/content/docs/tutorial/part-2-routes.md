---
title: "Part 2: Defining Routes"
weight: 2
---

Before we add the database, let's understand how routing works by creating simple handlers.

## Your First Handler

Create `src/handlers/categories.rs`:

```rust
use celero::prelude::*;

#[derive(Serialize, Deserialize, Schema)]
pub struct Category {
    pub id: i32,
    pub name: String,
}

#[api(get, path = "/categories", tag = "categories", summary = "List categories")]
pub async fn list_categories() -> Json<Vec<Category>> {
    Json(vec![
        Category { id: 1, name: "Rust".into() },
        Category { id: 2, name: "Python".into() },
    ])
}
```

## Register Routes

Update `src/handlers/mod.rs`:

```rust
pub mod categories;
```

Update `src/main.rs`:

```rust
use celero::prelude::*;

mod handlers;
use handlers::categories;

#[tokio::main]
async fn main() {
    let app = Celero::new()
        .title("Blog API")
        .version("0.1.0")
        .middleware(Cors::permissive())
        .routes(routes![categories::list_categories])
        .swagger("/docs")
        .build();

    app.serve("0.0.0.0:3456").await.unwrap();
}
```

## Try It

```bash
cargo run
```

Open [http://localhost:3456/docs](http://localhost:3456/docs) — you'll see the Swagger UI with your endpoint.

```bash
curl http://localhost:3456/categories
# [{"id":1,"name":"Rust"},{"id":2,"name":"Python"}]
```

## Key Concepts

- `#[api(get, path = "/categories")]` — declares a GET endpoint
- `tag` — groups endpoints in Swagger UI
- `summary` — short description shown in Swagger UI
- `Json<T>` — serializes the return value as JSON
- `#[derive(Schema)]` — generates OpenAPI schema for the type
- `routes![...]` — registers handlers and collects their OpenAPI metadata

Next: [Part 3: Adding a Database ->](part-3-database.md)
