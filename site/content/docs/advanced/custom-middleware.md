---
title: "Custom Middleware"
weight: 2
---

You can create your own middleware by implementing the `Middleware` trait.

## The Middleware Trait

```rust
pub type BoxRoute = tower::util::BoxCloneService<
    Request<Body>, Response<Body>, Infallible
>;

pub trait Middleware: Send + Sync + 'static {
    fn wrap(&self, inner: BoxRoute) -> BoxRoute;
}
```

Each middleware receives the inner service as a `BoxRoute` and returns a new `BoxRoute` that wraps it.

## Step-by-Step Example

### 1. Define the Middleware Struct

```rust
use celero::middleware::{BoxRoute, Middleware};

pub struct RateLimiter {
    max_per_second: u64,
}

impl RateLimiter {
    pub fn new(max_per_second: u64) -> Self {
        Self { max_per_second }
    }
}
```

### 2. Implement the Middleware Trait

```rust
impl Middleware for RateLimiter {
    fn wrap(&self, inner: BoxRoute) -> BoxRoute {
        BoxRoute::new(RateLimiterService {
            inner,
            max_per_second: self.max_per_second,
        })
    }
}
```

### 3. Create the Service

```rust
use celero::Body;
use http::{Request, Response, StatusCode};
use std::convert::Infallible;
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};

#[derive(Clone)]
struct RateLimiterService {
    inner: BoxRoute,
    max_per_second: u64,
}

impl tower_service::Service<Request<Body>> for RateLimiterService {
    type Response = Response<Body>;
    type Error = Infallible;
    type Future = Pin<Box<dyn Future<Output = Result<Response<Body>, Infallible>> + Send>>;

    fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, req: Request<Body>) -> Self::Future {
        let fut = self.inner.call(req);

        Box::pin(async move {
            let response = fut.await?;
            Ok(response)
        })
    }
}
```

### 4. Use It

```rust
let app = Celero::new()
    .middleware(RateLimiter::new(100))
    .routes(routes![...])
    .build();
```

## Requirements

| Requirement | Reason |
|-------------|--------|
| `Clone` | Required by `BoxCloneService` |
| `Send + 'static` | Required for async runtime |
| `Future: Send + 'static` | Required for async runtime |
| `Error = Infallible` | Errors must be converted to HTTP responses |

## Common Patterns

### Adding Response Headers

```rust
fn call(&mut self, req: Request<Body>) -> Self::Future {
    let fut = self.inner.call(req);
    Box::pin(async move {
        let mut response = fut.await?;
        response.headers_mut().insert(
            "x-custom-header",
            "value".parse().unwrap(),
        );
        Ok(response)
    })
}
```

### Short-Circuiting

```rust
fn call(&mut self, req: Request<Body>) -> Self::Future {
    if some_condition(&req) {
        return Box::pin(async {
            Ok(Response::builder()
                .status(StatusCode::FORBIDDEN)
                .body(Body::from("Forbidden"))
                .unwrap())
        });
    }
    let fut = self.inner.call(req);
    Box::pin(async move { fut.await })
}
```

### Measuring Timing

```rust
fn call(&mut self, req: Request<Body>) -> Self::Future {
    let start = std::time::Instant::now();
    let fut = self.inner.call(req);
    Box::pin(async move {
        let response = fut.await?;
        let elapsed = start.elapsed();
        tracing::info!(latency_ms = elapsed.as_millis(), "request completed");
        Ok(response)
    })
}
```
