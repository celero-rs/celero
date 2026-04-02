---
title: "Testing"
weight: 6
---

Celero provides an in-process test client that calls your service directly without network I/O. Tests are fast, deterministic, and don't require TCP ports.

## Setup

```toml
[dev-dependencies]
celero = { version = "0.1.0", features = ["testing"] }
```

## Basic Test

```rust
use celero::prelude::*;

#[tokio::test]
async fn test_hello() {
    let app = Celero::new()
        .get("/hello", || async { "Hello, World!" })
        .build();

    let client = TestClient::new(app);
    let resp = client.get("/hello").send().await;

    assert_eq!(resp.status(), StatusCode::OK);
    assert_eq!(resp.text(), "Hello, World!");
}
```

## TestClient API

```rust
let client = TestClient::new(app);

// HTTP methods
let resp = client.get("/path").send().await;
let resp = client.post("/path").send().await;
let resp = client.put("/path").send().await;
let resp = client.delete("/path").send().await;
let resp = client.patch("/path").send().await;
```

The client is reusable — make multiple requests from the same client.

## RequestBuilder

Configure requests before sending:

```rust
client.post("/users")
    .header("x-custom", "value")
    .json(&user)
    .send()
    .await;
```

| Method | Description |
|--------|-------------|
| `.header(name, value)` | Add a header |
| `.body(bytes)` | Set raw body |
| `.json(&value)` | Serialize as JSON + set Content-Type |
| `.send()` | Send the request (async) |

## TestResponse

All accessors are **synchronous** (body is fully buffered):

```rust
let resp = client.get("/users/42").send().await;

resp.status()           // -> StatusCode
resp.headers()          // -> &HeaderMap
resp.header("x-req-id") // -> Option<&str>
resp.text()             // -> &str
resp.bytes()            // -> &Bytes
resp.json::<User>()     // -> User (panics on failure)
```

## Testing with Middleware

Middleware is active after `.build()`:

```rust
#[tokio::test]
async fn test_cors() {
    let app = Celero::new()
        .middleware(Cors::permissive())
        .get("/api", || async { "ok" })
        .build();

    let client = TestClient::new(app);
    let resp = client
        .get("/api")
        .header("origin", "http://example.com")
        .send()
        .await;

    assert_eq!(resp.header("access-control-allow-origin"), Some("*"));
}
```

## Testing JSON

```rust
#[tokio::test]
async fn test_json_roundtrip() {
    let app = Celero::new()
        .routes(routes![create_user])
        .build();

    let client = TestClient::new(app);
    let user = User { id: 1, name: "Alice".to_string() };

    let resp = client.post("/users").json(&user).send().await;

    assert_eq!(resp.status(), StatusCode::CREATED);
    let created: User = resp.json();
    assert_eq!(created, user);
}
```

## App Factory Pattern

Avoid duplication by creating a shared app builder:

```rust
fn test_app() -> CeleroApp {
    Celero::new()
        .title("Test API")
        .middleware(Cors::permissive())
        .routes(routes![hello, get_user, create_user])
        .swagger("/docs")
        .build()
}

#[tokio::test]
async fn test_a() {
    let client = TestClient::new(test_app());
    // ...
}
```

## Running Tests

```bash
cargo test --workspace                    # All tests
cargo test -p my-api                      # Specific package
cargo test -p my-api -- test_create_user  # Single test
cargo test -p my-api -- --nocapture       # With stdout
```

> **Note:** Do not use `.telemetry()` in test apps — it installs a global subscriber that can only be initialized once. Parallel tests would panic.
