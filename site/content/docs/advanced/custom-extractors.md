---
title: "Custom Extractors"
weight: 3
---

Extractors pull data from incoming requests. You can create custom extractors by implementing `FromRequestParts` or `FromRequest`.

## FromRequestParts

Use for extractors that only need headers, extensions, or other metadata (not the body):

```rust
use celero::prelude::*;
use http::request::Parts;

struct CurrentUser {
    id: i64,
    role: String,
}

impl<S> FromRequestParts<S> for CurrentUser
where
    S: Send + Sync,
{
    type Rejection = (StatusCode, &'static str);

    async fn from_request_parts(
        parts: &mut Parts,
        _state: &S,
    ) -> Result<Self, Self::Rejection> {
        let claims = parts
            .extensions
            .get::<MyClaims>()
            .ok_or((StatusCode::UNAUTHORIZED, "Not authenticated"))?;

        Ok(CurrentUser {
            id: claims.sub.parse().unwrap_or(0),
            role: claims.role.clone(),
        })
    }
}
```

Use it in handlers:

```rust
#[api(get, path = "/profile", tag = "users")]
async fn profile(user: CurrentUser) -> Json<UserProfile> {
    // user is extracted automatically
}
```

## FromRequest

Use for extractors that need access to the request body:

```rust
use celero::prelude::*;

struct XmlBody<T>(T);

impl<S, T> FromRequest<S> for XmlBody<T>
where
    S: Send + Sync,
    T: DeserializeOwned,
{
    type Rejection = (StatusCode, String);

    async fn from_request(
        req: Request<Body>,
        _state: &S,
    ) -> Result<Self, Self::Rejection> {
        let body = hyper::body::to_bytes(req.into_body())
            .await
            .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;

        let value: T = quick_xml::de::from_reader(body.as_ref())
            .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;

        Ok(XmlBody(value))
    }
}
```

> **Note:** `FromRequest` consumes the body, so only one body extractor can be used per handler.

## Extractor Ordering

In a handler, extractors are applied left to right:

```rust
async fn handler(
    user: CurrentUser,       // FromRequestParts (1st)
    Path(id): Path<i64>,     // FromRequestParts (2nd)
    Json(body): Json<Data>,  // FromRequest - body (last)
) -> Result<Json<Response>, AppError> { ... }
```

`FromRequestParts` extractors run first (they don't consume the body). `FromRequest` extractors run last.

## Error Handling in Extractors

The `Rejection` type must implement `IntoResponse`:

```rust
enum AuthError {
    Missing,
    Invalid,
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response<Body> {
        let (status, msg) = match self {
            AuthError::Missing => (StatusCode::UNAUTHORIZED, "Missing token"),
            AuthError::Invalid => (StatusCode::FORBIDDEN, "Invalid token"),
        };
        Response::builder()
            .status(status)
            .body(Body::from(msg))
            .unwrap()
    }
}
```
