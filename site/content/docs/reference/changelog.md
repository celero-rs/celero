---
title: "Changelog"
weight: 3
---

## v0.1.0 — Initial Release

### Phase 1: Core Framework
- HTTP server on Tokio + Hyper 1.x
- `matchit` router with `{param}` path syntax
- Type-safe extractors: `Path`, `Query`, `Json`, `State`, `HeaderMap`
- Multiple response types: `Json<T>`, `StatusCode`, `String`, tuples

### Phase 2: Proc Macros
- `#[api]` macro for declarative route definitions
- `routes![]` macro for batch registration with module path support

### Phase 3: OpenAPI
- Automatic OpenAPI 3.1 specification generation
- `#[derive(Schema)]` with field-level attributes
- `CeleroSchema` trait for manual implementations
- Built-in Swagger UI via CDN

### Phase 4: Middleware
- `Middleware` trait with `BoxRoute` composition
- CORS (permissive + builder pattern)
- RequestId (UUID v4)
- Logging (structured with tracing)
- Compression (gzip with min_size)
- Timeout (configurable with 408 response)
- BearerAuth, JwtAuth, ApiKeyAuth

### Phase 5: Telemetry
- OpenTelemetry integration via extension trait
- TelemetryConfig builder (service name, log level, format, OTLP endpoint)
- TracingMiddleware with OTel semantic conventions
- OTLP gRPC export (Jaeger, Grafana Tempo, etc.)
- Log formats: Pretty, Compact, Json

### Phase 6: ORM
- SeaORM integration with `Db` extractor
- `DbPool` connection management
- `DatabaseConfig` builder with pool options
- `DbError` with automatic HTTP response mapping
- `Paginated<T>` + `PaginationParams` + `paginate()` helper
- `OrmExt` extension trait

### Phase 7: CLI
- `celero new` — interactive project scaffolding
- `celero add` — app module generation with automatic wiring
- `celero dev` — hot reload with cargo-watch + systemfd
- `celero build` — release build with size report
- `celero makemigrations` — auto-generate migrations via DB introspection
- `celero migrate` — apply pending migrations (Django-style)
