---
title: "Performance"
weight: 1
---

Celero is designed for high throughput and low, predictable latency.

## Benchmark Results

On Apple Silicon (M-series), 256 concurrent connections, 10 seconds per run, 3 runs averaged:

### Throughput (requests/sec)

| Endpoint | Celero | Actix-web | Loco | FastAPI |
|----------|--------|-----------|------|---------|
| `GET /health` | **197,827** | 182,058 | 168,992 | 102,207 |
| `GET /json` | **196,766** | 184,562 | 169,416 | 101,239 |
| `GET /users/{id}` | **195,517** | 186,867 | 155,303 | 85,271 |

### Tail Latency (p99, ms)

| Endpoint | Celero | Actix-web | Loco | FastAPI |
|----------|--------|-----------|------|---------|
| `GET /health` | **1.78** | 3.55 | 4.11 | 11.66 |
| `GET /json` | **1.84** | 2.71 | 3.86 | 10.30 |
| `GET /users/{id}` | **1.91** | 2.77 | 5.06 | 10.64 |

See [Benchmarks](../comparison/benchmarks/) for full methodology and per-run details.

## Why Is Celero Fast?

### Minimal Allocations

- Static string methods and paths (zero-copy where possible)
- SmallVec for path parameters (inline for common cases)
- Pre-allocated JSON serialization buffers
- No unnecessary boxing in the hot path

### Efficient Routing

- `matchit` router with O(n) path matching (no regex)
- Direct method dispatch without intermediate collections
- Route lookup returns handler references, not clones

### Hyper 1.x

Built on Hyper 1.x with Tokio:
- Zero-copy HTTP parsing
- Efficient connection handling
- TCP_NODELAY enabled by default

## Performance Tips

### Production Builds

Always compile with `--release`:

```bash
celero build
```

### Database Connection Pool

Configure the pool size for your workload:

```rust
let db = DatabaseConfig::new(&db_url)
    .max_connections(20)
    .min_connections(5)
    .connect()
    .await?;
```

### Middleware Overhead

Each middleware adds a small overhead. Only use what you need:
- `Compression` buffers the entire response — skip for large responses
- `Logging` and `TracingMiddleware` should not both be active
- Auth middleware adds token parsing overhead per request

### Log-Only Telemetry

If you don't need distributed tracing in production:

```rust
.telemetry(
    TelemetryConfig::new("my-service")
        .enable_traces(false)
        .log_format(LogFormat::Json)
)
```
