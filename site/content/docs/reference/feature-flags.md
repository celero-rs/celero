---
title: "Feature Flags"
weight: 2
---

Celero uses Cargo feature flags to keep the dependency tree minimal. Only enable what you need.

## Available Features

| Feature | Default | Description | Dependencies Added |
|---------|---------|-------------|--------------------|
| `json` | **Yes** | JSON serialization/deserialization | `serde_json` |
| `middleware` | **Yes** | Middleware pipeline (CORS, auth, compression, etc.) | `uuid`, `flate2`, `jsonwebtoken` |
| `orm` | No | SeaORM integration (DbPool, Db extractor, pagination) | `sea-orm`, `sea-orm-migration` |
| `telemetry` | No | OpenTelemetry (traces, structured logging, OTLP) | `opentelemetry`, `tonic`, `tracing-opentelemetry` |
| `testing` | No | In-process TestClient for integration tests | — |
| `hot-reload` | No | `listenfd` support for `systemfd` + `cargo-watch` | `listenfd` |

## Common Configurations

### Minimal API (default features)

```toml
[dependencies]
celero = "0.1"
```

Includes JSON and middleware.

### API with Database

```toml
[dependencies]
celero = { version = "0.1", features = ["orm"] }
```

### Full-Featured

```toml
[dependencies]
celero = { version = "0.1", features = ["orm", "telemetry"] }
```

### Development Dependencies

```toml
[dev-dependencies]
celero = { version = "0.1", features = ["testing"] }
```

## Feature Interactions

- `orm` enables the `Db` extractor, `DbPool`, pagination, and `DbError`
- `telemetry` enables `.telemetry()` on the builder and `TracingMiddleware`
- `testing` enables `TestClient`, `RequestBuilder`, and `TestResponse`
- `hot-reload` enables socket inheritance via `listenfd`
- Features are independent and can be combined freely
