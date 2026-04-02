---
title: Introduction
weight: 1
---

**High-performance, API-first Rust web framework for microservices** — inspired by FastAPI.

Celero combines the ergonomic developer experience of FastAPI (decorator routing, automatic OpenAPI docs, typed models) with the performance and type-safety of Rust.

## Why Celero?

- **FastAPI-like DX** — Declarative `#[api]` macros, automatic OpenAPI 3.1 generation, built-in Swagger UI
- **Rust performance** — ~200K req/sec, sub-2ms p99 latency, zero-cost abstractions
- **Batteries included** — ORM, middleware, telemetry, testing, CLI scaffolding
- **Type-safe** — Compile-time route validation, typed extractors, `#![forbid(unsafe_code)]`

## At a Glance

```rust
use celero::prelude::*;

#[derive(Serialize, Deserialize, Schema)]
struct User {
    id: i64,
    name: String,
    email: String,
}

#[api(get, path = "/users/{id}", tag = "users")]
async fn get_user(Path(id): Path<i64>) -> Json<User> {
    Json(User {
        id,
        name: "Alice".into(),
        email: "alice@example.com".into(),
    })
}

#[tokio::main]
async fn main() {
    let app = Celero::new()
        .title("My API")
        .version("1.0.0")
        .middleware(Cors::permissive())
        .routes(routes![get_user])
        .swagger("/docs")
        .build();

    app.serve("0.0.0.0:3456").await.unwrap();
}
```

Visit `http://localhost:3456/docs` for the interactive Swagger UI.

## Feature Highlights

| Feature | Description |
|---------|-------------|
| `#[api]` macro | Declarative routing with automatic OpenAPI metadata |
| Swagger UI | Built-in interactive API documentation |
| Type-safe extractors | `Path`, `Query`, `Json`, `Db`, `State` |
| Middleware pipeline | CORS, JWT/Bearer/API key auth, compression, timeout, logging |
| SeaORM integration | Connection pool, pagination, auto-migrations |
| OpenTelemetry | Structured logging, distributed tracing, OTLP export |
| Test client | In-process testing with zero network I/O |
| CLI | Project scaffolding, app modules, hot reload, migrations |

## Architecture

Celero is organized as a multi-crate workspace:

| Crate | Role |
|-------|------|
| `celero` | Facade — re-exports everything |
| `celero-core` | Server, router, extractors, responses, OpenAPI |
| `celero-macros` | Proc macros (`#[api]`, `routes![]`, `#[derive(Schema)]`) |
| `celero-openapi` | `CeleroSchema` trait + primitive impls |
| `celero-middleware` | CORS, auth, compression, timeout, logging, request ID |
| `celero-orm` | SeaORM integration (DbPool, Db extractor, pagination) |
| `celero-telemetry` | OpenTelemetry integration |
| `celero-testing` | In-process test client |
| `celero-cli` | CLI tool for scaffolding and migrations |
