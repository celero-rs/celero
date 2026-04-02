---
title: "vs Other Frameworks"
weight: 2
---

## Feature Comparison

| Feature | Celero | Actix-web | Axum | Loco | FastAPI |
|---------|--------|-----------|------|------|---------|
| Language | Rust | Rust | Rust | Rust | Python |
| Auto OpenAPI | **Yes** | No* | No* | No* | **Yes** |
| Built-in Swagger UI | **Yes** | No | No | No | **Yes** |
| ORM Integration | **SeaORM** | None | None | SeaORM | SQLAlchemy |
| CLI Scaffolding | **Yes** | No | No | **Yes** | No |
| Auto Migrations | **Yes** | No | No | **Yes** | No |
| Middleware | **Built-in** | Built-in | Tower | Built-in | Starlette |
| Telemetry | **Built-in** | Manual | Manual | Built-in | Manual |
| Testing | **Built-in** | Built-in | Built-in | Built-in | TestClient |
| Type Safety | **Compile-time** | Compile-time | Compile-time | Compile-time | Runtime |

*Available through third-party crates (utoipa, aide)

## When to Choose Celero

**Choose Celero when you want:**
- FastAPI-like developer experience in Rust
- Automatic OpenAPI docs without extra setup
- Built-in database integration with auto-migrations
- CLI scaffolding for rapid project setup
- High performance with predictable latency

**Consider alternatives when you need:**
- Maximum ecosystem maturity -> Actix-web or Axum
- Python ecosystem integration -> FastAPI
- Rails-like full-stack framework -> Loco
- Minimal framework, maximum control -> Axum

## Celero vs FastAPI

Celero is directly inspired by FastAPI and replicates its key DX features:

| Feature | Celero | FastAPI |
|---------|--------|---------|
| Route declaration | `#[api(get, path = "/users")]` | `@app.get("/users")` |
| Path params | `Path(id): Path<i64>` | `id: int` |
| Query params | `Query(q): Query<Filters>` | `q: Filters = Depends()` |
| Request body | `Json(body): Json<T>` | `body: T` |
| Response model | Return type analysis | `response_model=T` |
| OpenAPI | Automatic | Automatic |
| Swagger UI | `.swagger("/docs")` | `/docs` (default) |
| Throughput | ~200K req/s | ~100K req/s |
| p99 Latency | ~1.8ms | ~11ms |

## Celero vs Actix-web

| Feature | Celero | Actix-web |
|---------|--------|-----------|
| OpenAPI | Automatic via `#[api]` | Manual (utoipa) |
| ORM | Built-in SeaORM | BYO |
| CLI | `celero new`, `celero add` | None |
| Middleware | Type-erased (`BoxRoute`) | Generic (type changes) |
| Throughput | ~197K req/s | ~184K req/s |
| Ecosystem | New | Mature |

## Celero vs Axum

| Feature | Celero | Axum |
|---------|--------|------|
| OpenAPI | Automatic | Manual (aide/utoipa) |
| ORM | Built-in SeaORM | BYO |
| CLI | Full scaffolding | None |
| Routing | `#[api]` macro | Function-based |
| Architecture | Batteries-included | Minimal |
| Built on | Hyper 1.x | Hyper 1.x + Tower |

## Celero vs Loco

| Feature | Celero | Loco |
|---------|--------|------|
| Inspiration | FastAPI | Rails |
| OpenAPI | Automatic | Manual |
| Scaffold | `celero new` | `loco new` |
| Migrations | Auto-generate from entities | Manual |
| Background jobs | Not built-in | Built-in |
| Mailers | Not built-in | Built-in |
| Throughput | ~197K req/s | ~168K req/s |
