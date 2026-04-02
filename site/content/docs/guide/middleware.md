---
title: "Middleware"
weight: 2
---

Celero provides a pipeline of middleware components that process requests before they reach your handlers and responses before they're sent to the client.

## Adding Middleware

```rust
let app = Celero::new()
    .middleware(Cors::permissive())
    .middleware(RequestId)
    .middleware(Logging::new())
    .middleware(Timeout::from_secs(30))
    .routes(routes![...])
    .build();
```

Middleware is applied in the order you add it. The first middleware added is the outermost (processes the request first, sees the response last):

```
Request -> CORS -> RequestId -> Logging -> Timeout -> Handler
Response <- CORS <- RequestId <- Logging <- Timeout <- Handler
```

## Available Middleware

### RequestId

Assigns a UUID v4 to every request via the `X-Request-Id` header:

```rust
.middleware(RequestId)
```

- Preserves existing `X-Request-Id` headers from the client
- Adds the ID to both the request (for downstream handlers) and the response

### CORS

Cross-Origin Resource Sharing with automatic preflight handling:

```rust
// Permissive (development)
.middleware(Cors::permissive())

// Configured (production)
.middleware(
    Cors::new()
        .allow_origins(vec!["https://example.com"])
        .allow_methods(vec!["GET", "POST", "PUT", "DELETE"])
        .allow_headers(vec!["content-type", "authorization"])
        .expose_headers(vec!["x-request-id"])
        .max_age(3600)
        .allow_credentials(true)
)
```

`Cors::permissive()` allows all origins, methods, and headers — suitable for development only.

> When `allow_credentials(true)` is set, `Access-Control-Allow-Origin` cannot be `*` — the actual request origin is reflected instead.

### Logging

Structured request logging using `tracing`:

```rust
.middleware(Logging::new())
```

Logs: `http.method`, `http.path`, `http.version`, `http.status_code`, `http.latency_ms`

> Requires a `tracing` subscriber to be active. If using telemetry, use `TracingMiddleware` instead (added automatically by `.telemetry()`).

### Compression

Gzip compression for responses:

```rust
// Default: compress bodies > 256 bytes
.middleware(Compression::gzip())

// Custom minimum size
.middleware(Compression::gzip().min_size(1024))
```

Only compresses when the client sends `Accept-Encoding: gzip`.

### Timeout

Limits request processing time:

```rust
.middleware(Timeout::from_secs(30))
```

Returns `408 Request Timeout` as JSON if the handler exceeds the limit.

### BearerAuth

Static bearer token authentication:

```rust
.middleware(BearerAuth::new("my-secret-token"))
```

Validates `Authorization: Bearer <token>` header. Returns `401 Unauthorized` on mismatch.

### JwtAuth

JWT authentication with claims decoding and validation:

```rust
#[derive(Debug, Clone, Deserialize)]
struct MyClaims {
    sub: String,
    exp: u64,
    role: String,
}

let config = JwtConfig::new("my-hmac-secret")
    .algorithm(Algorithm::HS256)
    .audience("my-api".to_string())
    .issuer("auth-server".to_string());

.middleware(JwtAuth::<MyClaims>::new(config))
```

Decoded claims are injected into request extensions, accessible via `request.extensions().get::<MyClaims>()`.

Automatic validations: expiration (`exp`), not-before (`nbf`).

### ApiKeyAuth

API key authentication via header or query parameter:

```rust
// Header-based
.middleware(ApiKeyAuth::header("x-api-key", "my-secret-key"))

// Query parameter-based
.middleware(ApiKeyAuth::query("api_key", "my-secret-key"))
```

## Recommended Order

For a typical production application:

```rust
Celero::new()
    .middleware(Cors::new().allow_origins(vec!["https://app.example.com"]))
    .middleware(RequestId)
    .middleware(Logging::new())
    .middleware(Compression::gzip())
    .middleware(Timeout::from_secs(30))
    .middleware(JwtAuth::<Claims>::new(jwt_config))
    .routes(routes![...])
    .build();
```

**Why this order:**
1. **CORS** — handle preflight OPTIONS before auth blocks the request
2. **RequestId** — assign ID before logging so it appears in logs
3. **Logging** — log everything that follows (including auth errors)
4. **Compression** — compress responses on the way out
5. **Timeout** — limit handler execution time
6. **Auth** — last barrier before the handler

## Writing Custom Middleware

See [Custom Middleware](../advanced/custom-middleware.md) for a detailed guide.
