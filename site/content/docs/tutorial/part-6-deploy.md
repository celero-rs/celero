---
title: "Part 6: Deployment"
weight: 6
---

## Build for Production

```bash
celero build
```

Output:
```
Release binary: target/release/blog
Binary size:    4.2 MB
```

A single, statically-linked binary with no runtime dependencies.

## Docker

Create a `Dockerfile`:

```dockerfile
FROM rust:1.75-slim AS builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/blog /usr/local/bin/blog
EXPOSE 3456
CMD ["blog"]
```

```bash
docker build -t blog-api .
docker run -p 3456:3456 -e DATABASE_URL="sqlite:///data/blog.db?mode=rwc" blog-api
```

## Integration Tests

Create `tests/api_tests.rs`:

```rust
use celero::prelude::*;
use blog::entities::{category, post};
use blog::handlers::{categories, posts};
use blog::migration::Migrator;

async fn setup() -> TestClient {
    let db = DbPool::connect("sqlite::memory:").await.unwrap();
    db.run_migrations::<Migrator>().await.unwrap();

    let app = Celero::new()
        .title("Blog Test")
        .database(db)
        .routes(routes![
            categories::list_categories,
            categories::create_category,
            posts::list_posts,
            posts::get_post,
            posts::create_post,
            posts::update_post,
            posts::delete_post,
        ])
        .build();

    TestClient::new(app)
}

#[tokio::test]
async fn test_create_and_list() {
    let client = setup().await;

    let resp = client
        .post("/categories")
        .json(&json!({"name": "Rust"}))
        .send()
        .await;
    assert_eq!(resp.status(), StatusCode::CREATED);

    let resp = client
        .post("/posts")
        .json(&json!({
            "title": "Hello Rust",
            "content": "My first post",
            "category_id": 1
        }))
        .send()
        .await;
    assert_eq!(resp.status(), StatusCode::CREATED);

    let resp = client.get("/posts?category_id=1").send().await;
    let body: JsonValue = resp.json();
    assert_eq!(body["total_items"], 1);
}

#[tokio::test]
async fn test_crud_lifecycle() {
    let client = setup().await;

    client.post("/categories").json(&json!({"name": "Blog"})).send().await;

    // Create
    let resp = client.post("/posts").json(&json!({
        "title": "Draft", "content": "WIP", "category_id": 1
    })).send().await;
    assert_eq!(resp.status(), StatusCode::CREATED);

    // Read
    let resp = client.get("/posts/1").send().await;
    assert_eq!(resp.status(), StatusCode::OK);

    // Update
    let resp = client.put("/posts/1")
        .json(&json!({"title": "Published"}))
        .send().await;
    assert_eq!(resp.status(), StatusCode::OK);
    assert_eq!(resp.json::<JsonValue>()["title"], "Published");

    // Delete
    let resp = client.delete("/posts/1").send().await;
    assert_eq!(resp.status(), StatusCode::NO_CONTENT);

    // Verify deleted
    let resp = client.get("/posts/1").send().await;
    assert_eq!(resp.status(), StatusCode::NOT_FOUND);
}
```

Run tests:

```bash
cargo test
```

## Summary

You've built a complete Blog API with:

| Feature | Implementation |
|---------|---------------|
| Entity models | `#[derive(DeriveEntityModel, Schema)]` |
| Relationships | `has_many` / `belongs_to` |
| Input DTOs | `#[derive(Deserialize, Schema)]` |
| Handlers | `#[api(method, path, tag)]` |
| Filtering | `.filter(Column::X.eq(value))` |
| Pagination | `paginate(query, &db, params)` |
| Migrations | `MigratorTrait` |
| Testing | `TestClient` with SQLite in-memory |
| Auth | `JwtAuth` / `BearerAuth` / `ApiKeyAuth` |
| Deployment | Single binary, Docker |

Explore the [User Guide](../guide/routing.md) for more detailed documentation on each feature.
