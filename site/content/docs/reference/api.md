---
title: "API Reference"
weight: 1
---

## Generated Documentation

Full API documentation is auto-generated from source code and published on docs.rs:

**[docs.rs/celero](https://docs.rs/celero)** (available after crates.io publication)

## Local API Docs

Generate and browse API docs locally:

```bash
cargo doc --workspace --no-deps --open
```

## Key Types

### Builder

| Type | Description |
|------|-------------|
| `Celero` | Entry point — `Celero::new()` |
| `CeleroBuilder` | Builder for configuring the app |
| `CeleroApp` | Built application — call `.serve()` to start |

### Extractors

| Type | Description |
|------|-------------|
| `Path<T>` | Extract path parameters |
| `Query<T>` | Extract query string |
| `Json<T>` | Extract JSON body |
| `State<T>` | Extract shared state |
| `Db` | Extract database connection |
| `HeaderMap` | Extract all headers |

### Responses

| Type | Description |
|------|-------------|
| `Json<T>` | JSON response |
| `StatusCode` | HTTP status code |
| `(StatusCode, Json<T>)` | Status + JSON body |
| `Result<T, E>` | Ok response or error |
| `&str` / `String` | Plain text response |

### ORM

| Type | Description |
|------|-------------|
| `DbPool` | Database connection pool |
| `Db` | Database extractor for handlers |
| `DbError` | Database error with HTTP response mapping |
| `DatabaseConfig` | Pool configuration builder |
| `PaginationParams` | Pagination query parameters |
| `Paginated<T>` | Paginated response wrapper |
| `paginate()` | Helper for paginated queries |

### Middleware

| Type | Description |
|------|-------------|
| `Cors` | CORS middleware |
| `RequestId` | UUID request ID |
| `Logging` | Structured logging |
| `Compression` | Gzip compression |
| `Timeout` | Request timeout |
| `BearerAuth` | Static token auth |
| `JwtAuth<C>` | JWT authentication |
| `ApiKeyAuth` | API key authentication |

### Telemetry

| Type | Description |
|------|-------------|
| `TelemetryConfig` | Telemetry configuration builder |
| `LogFormat` | Log output format (Pretty/Compact/Json) |
| `TracingMiddleware` | OpenTelemetry span middleware |

### Testing

| Type | Description |
|------|-------------|
| `TestClient` | In-process HTTP client |
| `RequestBuilder` | Request configuration |
| `TestResponse` | Response with sync accessors |
