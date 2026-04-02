---
title: "Part 5: Authentication"
weight: 5
---

Let's protect our API with authentication.

## JWT Authentication

Add JWT middleware to `src/main.rs`:

```rust
#[derive(Debug, Clone, Deserialize)]
struct Claims {
    sub: String,
    exp: u64,
    role: String,
}

#[tokio::main]
async fn main() {
    // ... db setup ...

    let jwt_secret = std::env::var("JWT_SECRET")
        .unwrap_or_else(|_| "my-dev-secret".into());

    let jwt_config = JwtConfig::new(&jwt_secret)
        .algorithm(Algorithm::HS256);

    let app = Celero::new()
        .title("Blog API")
        .version("0.1.0")
        .database(db)
        .middleware(Cors::permissive())
        .middleware(RequestId)
        .middleware(Timeout::from_secs(30))
        .middleware(JwtAuth::<Claims>::new(jwt_config))
        .routes(routes![...])
        .swagger("/docs")
        .build();

    app.serve("0.0.0.0:3456").await.unwrap();
}
```

Add to `.env`:

```env
JWT_SECRET=my-super-secret-key-change-in-production
```

## Simpler Alternatives

### API Key

```rust
.middleware(ApiKeyAuth::header("x-api-key", "my-secret-key"))
```

### Bearer Token

```rust
.middleware(BearerAuth::new("my-static-token"))
```

## Making Authenticated Requests

```bash
# JWT
curl -H "Authorization: Bearer <your-jwt-token>" http://localhost:3456/posts

# API Key
curl -H "x-api-key: my-secret-key" http://localhost:3456/posts

# Bearer
curl -H "Authorization: Bearer my-static-token" http://localhost:3456/posts
```

## Middleware Order

Auth should be the **last** middleware (closest to handlers):

```rust
.middleware(Cors::permissive())     // 1. CORS (preflight first)
.middleware(RequestId)              // 2. Request ID
.middleware(Logging::new())         // 3. Logging (log auth failures)
.middleware(Timeout::from_secs(30)) // 4. Timeout
.middleware(JwtAuth::<C>::new(cfg)) // 5. Auth (last)
```

Next: [Part 6: Deployment ->](part-6-deploy.md)
