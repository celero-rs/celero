---
title: "Telemetry & Observability"
weight: 7
---

The `celero-telemetry` crate provides batteries-included observability:

- **Structured logging** — Pretty, Compact, or JSON output
- **Distributed tracing** — OpenTelemetry spans per request
- **OTLP export** — send traces via gRPC to Jaeger, Grafana Tempo, Datadog, etc.

## Setup

Enable the `telemetry` feature:

```toml
[dependencies]
celero = { version = "0.1", features = ["telemetry"] }
```

## Basic Usage

```rust
use celero::prelude::*;

#[tokio::main]
async fn main() {
    let app = Celero::new()
        .telemetry(TelemetryConfig::new("my-service"))
        .middleware(Cors::permissive())
        .middleware(RequestId)
        .routes(routes![...])
        .build();

    app.serve("0.0.0.0:3456").await.unwrap();
}
```

`.telemetry()` does three things:
1. Installs the global `tracing` subscriber (fmt layer + level filter)
2. If traces are enabled, creates the OTLP exporter and tracing-to-OpenTelemetry bridge
3. Adds `TracingMiddleware` to the middleware chain (spans per request)

## Configuration

```rust
TelemetryConfig::new("my-service")
    .otlp_endpoint("http://otel-collector:4317")  // default: localhost:4317
    .enable_traces(true)                            // default: true
    .log_level(tracing::Level::DEBUG)               // default: INFO
    .log_format(LogFormat::Json)                    // default: Pretty
```

| Method | Default | Description |
|--------|---------|-------------|
| `new(name)` | — | Service name (appears as `service.name` in traces) |
| `.otlp_endpoint(url)` | `localhost:4317` | gRPC endpoint for OTLP collector |
| `.enable_traces(bool)` | `true` | Set `false` for console-only logging |
| `.log_level(Level)` | `INFO` | Minimum log level |
| `.log_format(format)` | `Pretty` | Console output format |

### Log Formats

| Format | Use Case |
|--------|----------|
| `Pretty` | Local development (colored, multi-line) |
| `Compact` | Development, CI (one line per event) |
| `Json` | Production (structured log aggregation) |

### Override with RUST_LOG

```bash
RUST_LOG=warn cargo run
RUST_LOG=my_app=debug,info cargo run
RUST_LOG=celero=trace cargo run
```

## Log-Only Mode

If you don't need distributed tracing:

```rust
.telemetry(
    TelemetryConfig::new("my-service")
        .enable_traces(false)
        .log_format(LogFormat::Compact)
)
```

No gRPC connection, no runtime dependency on a collector.

## TracingMiddleware

Automatically added by `.telemetry()`. Creates an OpenTelemetry span per request with semantic convention fields:

| Field | Description |
|-------|-------------|
| `http.request.method` | HTTP method |
| `url.path` | Request path |
| `http.response.status_code` | Response status code |
| `http.latency_ms` | Latency in milliseconds |
| `otel.kind` | Always `"server"` |

5xx responses emit a WARN event.

## Collector Setup

### Jaeger (quickest)

```bash
docker run -d --name jaeger \
  -p 4317:4317 \
  -p 16686:16686 \
  jaegertracing/all-in-one:latest
```

- OTLP gRPC: `http://localhost:4317`
- UI: `http://localhost:16686`

### Grafana Tempo

```yaml
# docker-compose.yml
services:
  tempo:
    image: grafana/tempo:latest
    command: ["-config.file=/etc/tempo.yaml"]
    ports:
      - "4317:4317"
      - "3200:3200"
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
```

## Important Notes

- Call `.telemetry()` **before** other middleware in the builder
- `TracingMiddleware` replaces `Logging` — using both produces duplicate output
- Do **not** use `.telemetry()` in test apps (global subscriber conflict)
